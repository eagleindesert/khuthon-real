import { Outlet, NavLink } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </main>

      <nav
        style={{
          display: 'flex',
          borderTop: '1px solid var(--color-outline-variant)',
          background: 'var(--color-surface)',
          flexShrink: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <TabItem to="/discover" label="발견" icon="🎵" />
        <TabItem to="/ranking" label="랭킹" icon="🏆" />
        <TabItem to="/me" label="내 정보" icon="👤" />
      </nav>
    </div>
  )
}

function TabItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-sm) 0',
        gap: 2,
        color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
        textDecoration: 'none',
      })}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </NavLink>
  )
}
