import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardIndex from '@/pages/dashboard/DashboardIndex';
import { AuthProvider } from '@/providers/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import HomePage from '@/pages/HomePage';
import TeacherSetupPage from '@/pages/auth/TeacherSetupPage';
import TeacherPublicProfile from '@/pages/TeacherPublicProfile';
import ClassesPage from '@/pages/dashboard/classes/ClassesPage';
import StudentsPage from '@/pages/dashboard/students/StudentsPage';
import MaterialsPage from '@/pages/dashboard/materials/MaterialsPage';
import PaymentsPage from '@/pages/dashboard/payments/PaymentsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import AdminTeachersPage from '@/pages/dashboard/admin/AdminTeachersPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage role="student" />} />
          <Route path="/login/teacher" element={<LoginPage role="teacher" />} />
          <Route path="/login/manager" element={<LoginPage role="manager" />} />
          <Route path="/teacher-setup" element={<TeacherSetupPage />} />
          <Route path="/:teacherSlug" element={<TeacherPublicProfile />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardIndex />} />
              <Route path="/dashboard/classes" element={<ClassesPage />} />
              <Route path="/dashboard/students" element={<StudentsPage />} />
              <Route path="/dashboard/materials" element={<MaterialsPage />} />
              <Route path="/dashboard/payments" element={<PaymentsPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/admin/teachers" element={<AdminTeachersPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
