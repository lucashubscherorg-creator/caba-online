/**
 * Vercel serverless entry point.
 * Vercel compiles this TypeScript file and routes all /api/* requests here.
 * The Express app handles internal routing (e.g. /api/auth, /api/world, …).
 */
import app from '../server/src/index';

export default app;
