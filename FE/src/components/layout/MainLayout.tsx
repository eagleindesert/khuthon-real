import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}
