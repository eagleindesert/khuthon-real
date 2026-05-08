import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import PhoneShell from '@/components/layout/PhoneShell'
import AppRoutes from '@/routes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PhoneShell>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </PhoneShell>
      </AuthProvider>
    </BrowserRouter>
  )
}
