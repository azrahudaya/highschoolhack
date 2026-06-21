import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const AdminSchoolPage = lazy(() => import('./pages/AdminSchoolPage').then((module) => ({ default: module.AdminSchoolPage })));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage').then((module) => ({ default: module.ArticleDetailPage })));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage').then((module) => ({ default: module.ArticlesPage })));
const Bekal10DashboardPage = lazy(() => import('./pages/Bekal10DashboardPage').then((module) => ({ default: module.Bekal10DashboardPage })));
const Bekal10ModulePage = lazy(() => import('./pages/Bekal10ModulePage').then((module) => ({ default: module.Bekal10ModulePage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then((module) => ({ default: module.OnboardingPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })));
const ProgramDashboardAppPage = lazy(() => import('./pages/ProgramDashboardAppPage').then((module) => ({ default: module.ProgramDashboardAppPage })));
const ProgramDetailPage = lazy(() => import('./pages/ProgramDetailPage').then((module) => ({ default: module.ProgramDetailPage })));
const ProgramModuleAppPage = lazy(() => import('./pages/ProgramModuleAppPage').then((module) => ({ default: module.ProgramModuleAppPage })));
const ProgramPortfolioAppPage = lazy(() => import('./pages/ProgramPortfolioAppPage').then((module) => ({ default: module.ProgramPortfolioAppPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })));
const ScholarshipPortalAppPage = lazy(() => import('./pages/ScholarshipPortalAppPage').then((module) => ({ default: module.ScholarshipPortalAppPage })));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage').then((module) => ({ default: module.StudentDashboardPage })));
const StudentPortfolioPage = lazy(() => import('./pages/StudentPortfolioPage').then((module) => ({ default: module.StudentPortfolioPage })));
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage').then((module) => ({ default: module.StudentProfilePage })));
const TeacherDashboardPage = lazy(() => import('./pages/TeacherDashboardPage').then((module) => ({ default: module.TeacherDashboardPage })));
const TeacherStudentDetailPage = lazy(() => import('./pages/TeacherStudentDetailPage').then((module) => ({ default: module.TeacherStudentDetailPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })));

function RouteFallback() {
  return <div className="grid min-h-screen place-items-center bg-[#f8fbff] text-sm text-slate-500">Memuat halaman...</div>;
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/programs/:slug" element={<ProgramDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute allowWithoutMembership>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/programs/bekal-10"
            element={
              <ProtectedRoute roles={['student']}>
                <Bekal10DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/programs/bekal-10/modules/:moduleSlug"
            element={
              <ProtectedRoute roles={['student']}>
                <Bekal10ModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/programs/smart-financial/scholarships"
            element={
              <ProtectedRoute roles={['student']}>
                <ScholarshipPortalAppPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/programs/:programSlug"
            element={
              <ProtectedRoute roles={['student']}>
                <ProgramDashboardAppPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/programs/:programSlug/modules/:moduleSlug"
            element={
              <ProtectedRoute roles={['student']}>
                <ProgramModuleAppPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/programs/:programSlug/portfolio"
            element={
              <ProtectedRoute roles={['student']}>
                <ProgramPortfolioAppPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/portfolio"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentPortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/profile"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute roles={['teacher_bk']}>
                <TeacherDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute roles={['teacher_bk']}>
                <TeacherDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students/:userId"
            element={
              <ProtectedRoute roles={['teacher_bk']}>
                <TeacherStudentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['school_admin', 'super_admin']}>
                <AdminSchoolPage section="overview" />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/classes" element={<ProtectedRoute roles={['school_admin', 'super_admin']}><AdminSchoolPage section="classes" /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute roles={['school_admin', 'super_admin']}><AdminSchoolPage section="students" /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute roles={['school_admin', 'super_admin']}><AdminSchoolPage section="teachers" /></ProtectedRoute>} />
          <Route path="/admin/school" element={<ProtectedRoute roles={['school_admin', 'super_admin']}><AdminSchoolPage section="school" /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
