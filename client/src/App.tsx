import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { AdminSchoolPage } from './pages/AdminSchoolPage';
import { Bekal10DashboardPage } from './pages/Bekal10DashboardPage';
import { Bekal10ModulePage } from './pages/Bekal10ModulePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProgramDetailPage } from './pages/ProgramDetailPage';
import { ProgramDashboardAppPage } from './pages/ProgramDashboardAppPage';
import { ProgramModuleAppPage } from './pages/ProgramModuleAppPage';
import { ProgramPortfolioAppPage } from './pages/ProgramPortfolioAppPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentPortfolioPage } from './pages/StudentPortfolioPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { TeacherStudentDetailPage } from './pages/TeacherStudentDetailPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticleDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/programs/:slug" element={<ProgramDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
    </AuthProvider>
  );
}

export default App;
