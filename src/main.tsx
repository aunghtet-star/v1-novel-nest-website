import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { MainLayout } from '@/components/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { NovelDetailPage } from '@/pages/NovelDetailPage';
import { ChapterReaderPage } from '@/pages/ChapterReaderPage';
import { GenrePage } from '@/pages/GenrePage';
import { SearchPage } from '@/pages/SearchPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NovelFormPage } from '@/pages/NovelFormPage';
import { AuthorChapterListPage } from '@/pages/AuthorChapterListPage';
import { ChapterFormPage } from '@/pages/ChapterFormPage';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminUserManagementPage } from '@/pages/admin/AdminUserManagementPage';
import { AdminNovelModerationPage } from '@/pages/admin/AdminNovelModerationPage';
import { AdminGenreManagementPage } from '@/pages/admin/AdminGenreManagementPage';
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage';
import { VerifyOtpPage } from '@/pages/VerifyOtpPage';
const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/novel/:slug", element: <NovelDetailPage /> },
      { path: "/novel/:slug/:chapterNumber", element: <ChapterReaderPage /> },
      { path: "/genre/:slug", element: <GenrePage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-otp", element: <VerifyOtpPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/dashboard/settings", element: <ProfileSettingsPage /> },
          { path: "/dashboard/novels/new", element: <NovelFormPage /> },
          { path: "/dashboard/novels/edit/:slug", element: <NovelFormPage /> },
          { path: "/dashboard/novels/:slug/chapters", element: <AuthorChapterListPage /> },
          { path: "/dashboard/novels/:slug/chapters/new", element: <ChapterFormPage /> },
          { path: "/dashboard/novels/:slug/chapters/edit/:chapterNumber", element: <ChapterFormPage /> },
        ]
      },
      {
        element: <AdminProtectedRoute />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { path: "users", element: <AdminUserManagementPage /> },
              { path: "novels", element: <AdminNovelModerationPage /> },
              { path: "genres", element: <AdminGenreManagementPage /> },
            ]
          }
        ]
      },
      { path: "*", element: <NotFoundPage /> },
    ]
  }
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)