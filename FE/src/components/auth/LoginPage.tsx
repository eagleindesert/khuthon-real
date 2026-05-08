import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setLoading(true)
    try {
      await login({ username: username.trim(), password })
      navigate('/discover', { replace: true })
    } catch {
      toast.error('아이디 또는 비밀번호를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-margin)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-xxl)' }}>
        Sonic
      </h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={primaryButtonStyle(loading)}>
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <p style={{ marginTop: 'var(--space-xl)', textAlign: 'center', fontSize: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)' }}>
        계정이 없으신가요?{' '}
        <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)' }}>
          회원가입
        </Link>
      </p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: 'var(--space-md)',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--color-outline)',
  background: 'var(--color-surface-container)',
  color: 'var(--color-on-surface)',
  fontSize: 'var(--text-body-lg)',
  outline: 'none',
  width: '100%',
}

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    marginTop: 'var(--space-sm)',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-full)',
    background: disabled ? 'var(--color-surface-container-high)' : 'var(--color-primary)',
    color: disabled ? 'var(--color-on-surface-variant)' : 'var(--color-on-primary)',
    fontSize: 'var(--text-body-lg)',
    fontWeight: 'var(--weight-bold)',
    opacity: disabled ? 0.7 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}
