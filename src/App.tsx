import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { TemplateDetailPage } from '@/pages/TemplateDetailPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { WebsiteCreatorPage } from '@/pages/WebsiteCreatorPage';
import { PublicEventPage } from '@/pages/PublicEventPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PlansPage } from '@/pages/PlansPage';
import { AdminPaymentsPage } from '@/pages/AdminPaymentsPage';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing */}
            <Route path="/" element={<HomePage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/:templateId" element={<TemplateDetailPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/admin/payments" element={<ProtectedRoute><AdminPaymentsPage /></ProtectedRoute>} />

            {/* Authentication */}
            <Route path="/login" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Creator Application (Protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/websites"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/websites/:websiteId"
              element={
                <ProtectedRoute>
                  <WebsiteCreatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/websites/:websiteId/edit"
              element={
                <ProtectedRoute>
                  <WebsiteCreatorPage />
                </ProtectedRoute>
              }
            />

            {/* Website Creation / Studio (Protected) */}
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <WebsiteCreatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create/:templateId"
              element={
                <ProtectedRoute>
                  <WebsiteCreatorPage />
                </ProtectedRoute>
              }
            />

            {/* Public Event Guest Portal */}
            <Route path="/e/:slug" element={<PublicEventPage />} />

            {/* 404 & Fallback */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
