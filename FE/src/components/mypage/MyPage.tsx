import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function MyPage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (!currentUser) return null

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 'var(--space-margin)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-xxl)' }}>
        내 정보
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', flex: 1 }}>
        <InfoRow label="닉네임" value={currentUser.nickname} />
        <InfoRow label="아이디" value={currentUser.loginId} />
        <InfoRow label="커뮤니티" value={currentUser.preferredGenre} />
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 'var(--space-xl)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--color-outline)',
          background: 'transparent',
          color: 'var(--color-on-surface-variant)',
          fontSize: 'var(--text-body-lg)',
          fontWeight: 'var(--weight-bold)',
          cursor: 'pointer',
        }}
      >
        로그아웃
      </button>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-md) var(--space-lg)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface-container)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-md)',
      }}
    >
      <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)' }}>
        {label}
      </span>
      <span style={{ fontSize: 'var(--text-body-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>
        {value}
      </span>
    </div>
  )
}
