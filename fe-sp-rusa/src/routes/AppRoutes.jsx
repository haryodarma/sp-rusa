import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GuestLayout from '../layouts/GuestLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

import LandingPage from '../features/landing/LandingPage';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import { ProtectedRoute, RoleRoute } from './RouteGuards';

import DashboardUser from '../features/prediksi/DashboardUser';
import HasilPrediksi from '../features/prediksi/HasilPrediksi';
import RiwayatPrediksi from '../features/prediksi/RiwayatPrediksi';

import DashboardAdmin from '../features/admin/DashboardAdmin';
import GejalaList from '../features/admin/gejala/GejalaList';
import PenyakitList from '../features/admin/penyakit/PenyakitList';
import RuleList from '../features/admin/rule/RuleList';
import UserList from '../features/admin/user/UserList';
import DeerList from '../features/admin/deer/DeerList';
import UserSymptomList from '../features/admin/user_symptom/UserSymptomList';
import PredictionList from '../features/admin/prediction/PredictionList';
import PredictionDetail from '../features/admin/prediction/PredictionDetail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes - Guest / User */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['guest']} />}>
          <Route element={<UserLayout />}>
            <Route path="/prediksi" element={<DashboardUser />} />
            <Route path="/prediksi/hasil/:id" element={<HasilPrediksi />} />
            <Route path="/prediksi/riwayat" element={<RiwayatPrediksi />} />
          </Route>
        </Route>
      </Route>

      {/* Protected Routes - Admin */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardAdmin />} />
            <Route path="/admin/gejala" element={<GejalaList />} />
            <Route path="/admin/penyakit" element={<PenyakitList />} />
            <Route path="/admin/rule" element={<RuleList />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/deers" element={<DeerList />} />
            <Route path="/admin/user-symptoms" element={<UserSymptomList />} />
            <Route path="/admin/predictions" element={<PredictionList />} />
            <Route path="/admin/predictions/:id" element={<PredictionDetail />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
