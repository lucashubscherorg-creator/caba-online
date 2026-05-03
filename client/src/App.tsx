import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import RoleSelectPage from './pages/RoleSelectPage';
import LoadingScreen from './components/ui/LoadingScreen';

export default function App() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to="/game" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/game" />} />
        <Route path="/rol"      element={user  ? <RoleSelectPage /> : <Navigate to="/login" />} />
        <Route path="/game"     element={user  ? <GamePage />     : <Navigate to="/login" />} />
        <Route path="*"         element={<Navigate to={user ? "/game" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}
