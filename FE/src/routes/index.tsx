import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from '@/components/layout/AuthGuard'
import MainLayout from '@/components/layout/MainLayout'

const LoginPage = lazy(() => import('@/components/auth/LoginPage'))
const SignUpWizard = lazy(() => import('@/components/auth/SignUpWizard'))
const RecommendationPage = lazy(() => import('@/components/recommendation/RecommendationPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpWizard />} />

        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/discover" replace />} />
            <Route path="/discover" element={<RecommendationPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/discover" replace />} />
      </Routes>
    </Suspense>
  )
}
