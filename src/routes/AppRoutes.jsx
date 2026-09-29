import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Game from '../pages/Game';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../pages/admin/AdminLayout';
import ShiftsPage from '../pages/admin/ShiftsPage';
import ShiftDetailPage from '../pages/admin/ShiftDetailPage';
import BeatDetailPage from '../pages/admin/BeatDetailPage';
import PracticeTasksPage from '../pages/admin/PracticeTasksPage';
import Admin from '../pages/Admin';

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
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/super-admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<ShiftsPage />} />
        <Route path="practice" element={<PracticeTasksPage />} />
        <Route path="shifts/:shiftId" element={<ShiftDetailPage />} />
        <Route path="beats/:beatId" element={<BeatDetailPage />} />
      </Route>
      <Route path="*" element={<div>404 — Not Found</div>} />
    </Routes>
  );
}
