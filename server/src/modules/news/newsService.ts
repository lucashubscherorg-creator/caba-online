// ============================================================
// SERVICIO DE NOTICIAS RSS — CABA ONLINE
// ============================================================
import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { createWorldEvent } from '../events/eventsService';
import { RSS_FEEDS, NEWS_KEYWORDS, NEIGHBORHOODS } from '../../../../shared/constants';
import type { WorldEvent, WorldEventType } from '../../../../shared/types';

// ── RSS parser instance ─────────────────────────────────────
const rssParser = new Parser({
  timeout: 10_000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (compatible; CABAOnlineBot/1.0; +https://cabaonline.ar)',
  },
});

// ── helpers ──────────────────────────────────────────────────
const allNeighborhoodIds = (): string[] => Object.keys(NEIGHBORHOODS);

const neighborhoodNameToId: Record<string, string> = Object.fromEntries(
  Object.entries(NEIGHBORHOODS).map(([id, meta]) => [
    meta.name.toLowerCase(),
    id,
  ]),
);

/** Detect neighbourhood mentions in article text */
function detectAffectedNeighborhoods(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [name, id] of Object.entries(neighborhoodNameToId)) {
    if (lower.includes(name)) found.push(id);
  }
  return found.length > 0 ? found : allNeighborhoodIds();
}

const eventDurationByType: Record<WorldEventType, [number, number]> = {
  marcha:             [60, 180],
  paro:               [120, 180],
  dolar_salto:        [30, 90],
  inflacion_pico:     [60, 120],
  evento_cultural:    [60, 180],
  operativo_policial: [30, 90],
  corte_servicio:     [60, 120],
  crisis_economica:   [120, 180],
  elecciones:         [120, 180],
  noticia_real:       [30, 90],
};

function randomDuration(minMin: number, maxMin: number): number {
  return Math.floor(Math.random() * (maxMin - minMin + 1)) + minMin;
}

// ─────────────────────────────────────────────────────────────
// Duplicate detection — in-memory set of (sourceNews, eventType) pairs
// seen in the last 2 hours
// ─────────────────────────────────────────────────────────────
interface RecentEvent {
  key: string;
  seenAt: number; // Date.now()
}

const recentEvents: RecentEvent[] = [];
const DUPLICATE_WINDOW_MS = 2 * 60 * 60_000; // 2 hours

function isDuplicate(key: string): boolean {
  const now = Date.now();
  // Prune old entries
  const cutoff = now - DUPLICATE_WINDOW_MS;
  while (recentEvents.length > 0 && recentEvents[0].seenAt < cutoff) {
    recentEvents.shift();
  }
  return recentEvents.some((e) => e.key === key);
}

function markSeen(key: string): void {
  recentEvents.push({ key, seenAt: Date.now() });
}

// ─────────────────────────────────────────────────────────────
// fetchAllFeeds
// ─────────────────────────────────────────────────────────────
export interface RssArticle {
  title: string;
  description: string;
  link: string;
  pubDate?: string;
  feedName: string;
}

export async function fetchAllFeeds(): Promise<RssArticle[]> {
  const articles: RssArticle[] = [];

  await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await rssParser.parseURL(feed.url);
        const items = (parsed.items ?? []).slice(0, 30); // max 30 items per feed
        for (const item of items) {
          articles.push({
            title:       item.title?.trim() ?? '',
            description: (item.contentSnippet ?? item.content ?? item.summary ?? '').trim(),
            link:        item.link ?? '',
            pubDate:     item.pubDate,
            feedName:    feed.name,
          });
        }
        logger.debug(`[NewsService] ${feed.name}: ${items.length} articles fetched`);
      } catch (err) {
        logger.warn(
          `[NewsService] Failed to fetch feed "${feed.name}" (${feed.url}): ${(err as Error).message}`,
        );
        // Continue — never crash the whole cycle
      }
    }),
  );

  return articles;
}

// ─────────────────────────────────────────────────────────────
// parseNewsToEvents — keyword matching
// ─────────────────────────────────────────────────────────────
export function parseNewsToEvents(
  articles: RssArticle[],
): Array<Omit<WorldEvent, 'id' | 'startTime' | 'endTime' | 'isActive'>> {
  const pending: Array<Omit<WorldEvent, 'id' | 'startTime' | 'endTime' | 'isActive'>> = [];

  for (const article of articles) {
    const searchText = `${article.title} ${article.description}`.toLowerCase();

    // Find first matching keyword
    for (const [keyword, meta] of Object.entries(NEWS_KEYWORDS)) {
      if (!searchText.includes(keyword.toLowerCase())) continue;

      const eventType = meta.eventType as WorldEventType;
      const duplicateKey = `${eventType}:${article.link}`;

      if (isDuplicate(duplicateKey)) break; // already processed this article for this type

      const durationRange = eventDurationByType[eventType] ?? [30, 90];
      const affectedNeighborhoods = detectAffectedNeighborhoods(searchText);

      pending.push({
        type:                 eventType,
        title:                article.title.substring(0, 120),
        description:          article.description.substring(0, 300) || article.title,
        affectedNeighborhoods,
        economicImpact:       meta.economicImpact,
        safetyImpact:         meta.safetyImpact,
        duration:             randomDuration(...durationRange),
        sourceNews:           article.link,
        iconEmoji:            '',
      });

      markSeen(duplicateKey);
      break; // one event per article
    }
  }

  return pending;
}

// ─────────────────────────────────────────────────────────────
// getActiveEvents (from Supabase)
// ─────────────────────────────────────────────────────────────
export async function getActiveEvents(): Promise<WorldEvent[]> {
  const { data, error } = await supabase
    .from('world_events')
    .select('*')
    .eq('isActive', true)
    .order('startTime', { ascending: false });

  if (error) {
    logger.error(`[NewsService] getActiveEvents error: ${error.message}`);
    return [];
  }
  return (data as WorldEvent[]) ?? [];
}

// ─────────────────────────────────────────────────────────────
// refreshNews — full cycle: fetch → parse → save → emit
// ─────────────────────────────────────────────────────────────
export async function refreshNews(): Promise<void> {
  logger.info('[NewsService] Starting news refresh cycle…');
  const startedAt = Date.now();

  try {
    const articles = await fetchAllFeeds();
    logger.info(`[NewsService] Fetched ${articles.length} articles total`);

    const eventDrafts = parseNewsToEvents(articles);
    logger.info(`[NewsService] ${eventDrafts.length} new events to create`);

    let created = 0;
    for (const draft of eventDrafts) {
      try {
        await createWorldEvent(draft);
        created++;
      } catch (err) {
        logger.error(
          `[NewsService] Failed to create event "${draft.title}": ${(err as Error).message}`,
        );
      }
    }

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    logger.info(
      `[NewsService] Refresh done in ${elapsed}s — created ${created}/${eventDrafts.length} events`,
    );
  } catch (err) {
    logger.error(`[NewsService] refreshNews fatal error: ${(err as Error).message}`);
  }
}
