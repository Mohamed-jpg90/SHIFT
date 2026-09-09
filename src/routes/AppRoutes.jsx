/**
 * src/routes/AppRoutes.jsx
 * SHIFT is a single desktop OS experience, not a multi-page site —
 * keep routes minimal on purpose.
 */
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Game from '../pages/Game';
import Admin from '../pages/Admin';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <Game />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<div>404 — Not Found</div>} />
    </Routes>
  );
}