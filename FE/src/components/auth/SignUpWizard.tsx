import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { SCENE_TAGS } from '@/utils/sceneTags'
import type { SceneTag } from '@/utils/sceneTags'
import { signUp } from '@/api'

interface FormData {
  loginId: string
  password: string
  nickname: string
  preferredGenre: string
}

export default function SignUpWizard() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({ loginId: '', password: '', nickname: '', preferredGenre: '' })
  const [loading, setLoading] = useState(false)

  const next = (data: Partial<FormData>) => {
    setForm((f) => ({ ...f, ...data }))
    setStep((s) => s + 1)
  }

  const handleSubmit = async (preferredGenre: string) => {
    const final = { ...form, preferredGenre }
    setLoading(true)
    try {
      await signUp({ loginId: final.loginId, password: final.password, nickname: final.nickname, preferredGenre: final.preferredGenre })
      await login({ loginId: final.loginId, password: final.password })
      navigate('/discover', { replace: true })
    } catch {
      toast.error('회원가입에 실패했습니다. 다시 시도해주세요.')
      setLoading(false)
    }
  }

  if (step === 1) return <Step1IdPw onNext={(d) => next(d)} />
  if (step === 2) return <Step2Nickname onNext={(d) => next(d)} />
  return <Step3Genre loading={loading} onSubmit={handleSubmit} />
}

/* ─── Step 1: 아이디 / 비밀번호 ─────────────────────────────── */

interface Step1Props {
  onNext: (d: Pick<FormData, 'loginId' | 'password'>) => void
}

function Step1IdPw({ onNext }: Step1Props) {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handle = () => {
    if (loginId.trim().length < 4) { setError('아이디는 4자 이상이어야 합니다.'); return }
    if (password.length < 8)       { setError('비밀번호는 8자 이상이어야 합니다.'); return }
    if (password !== confirm)      { setError('비밀번호가 일치하지 않습니다.'); return }
    onNext({ loginId: loginId.trim(), password })
  }

  return (
    <WizardShell step={1} title="계정 만들기">
      <input type="text" placeholder="아이디 (4자 이상)" value={loginId} onChange={(e) => setLoginId(e.target.value)} style={inputStyle} autoComplete="username" />
      <input type="password" placeholder="비밀번호 (8자 이상)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} autoComplete="new-password" />
      <input type="password" placeholder="비밀번호 확인" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} autoComplete="new-password" />
      {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-body-sm)' }}>{error}</p>}
      <button onClick={handle} style={primaryBtnStyle}>다음</button>
    </WizardShell>
  )
}

/* ─── Step 2: 닉네임 ─────────────────────────────────────────── */

interface Step2Props {
  onNext: (d: Pick<FormData, 'nickname'>) => void
}

function Step2Nickname({ onNext }: Step2Props) {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  const handle = () => {
    if (nickname.trim().length < 2) { setError('닉네임은 2자 이상이어야 합니다.'); return }
    onNext({ nickname: nickname.trim() })
  }

  return (
    <WizardShell step={2} title="닉네임 설정">
      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-body-sm)' }}>다른 사용자에게 보여지는 이름입니다.</p>
      <input type="text" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} style={inputStyle} maxLength={20} />
      {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-body-sm)' }}>{error}</p>}
      <button onClick={handle} style={primaryBtnStyle}>다음</button>
    </WizardShell>
  )
}

/* ─── Step 3: 선호 장르 선택 ─────────────────────────────────── */

interface Step3Props {
  loading: boolean
  onSubmit: (preferredGenre: string) => void
}

function Step3Genre({ loading, onSubmit }: Step3Props) {
  const [selected, setSelected] = useState<SceneTag | ''>('')

  return (
    <WizardShell step={3} title="선호 장르 선택">
      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-body-sm)' }}>
        가장 좋아하는 장르를 하나 골라주세요. 추천에 반영됩니다.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        {SCENE_TAGS.map((tag) => {
          const active = selected === tag
          return (
            <button
              key={tag}
              onClick={() => setSelected(tag)}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-outline)'}`,
                background: active ? 'rgba(83,224,118,0.15)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-label-caps)',
                fontWeight: 'var(--weight-bold)',
                letterSpacing: '0.05em',
              }}
            >
              {tag}
            </button>
          )
        })}
      </div>
      <button
        onClick={() => { if (selected) onSubmit(selected) }}
        disabled={!selected || loading}
        style={primaryBtnStyle}
      >
        {loading ? '가입 중…' : '완료'}
      </button>
    </WizardShell>
  )
}

/* ─── WizardShell ────────────────────────────────────────────── */

function WizardShell({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 'var(--space-margin)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-xl)' }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 'var(--radius-full)',
              background: s <= step ? 'var(--color-primary)' : 'var(--color-outline-variant)',
            }}
          />
        ))}
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-xl)' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', flex: 1 }}>
        {children}
      </div>
      {step === 1 && (
        <p style={{ marginTop: 'var(--space-xl)', textAlign: 'center', fontSize: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)' }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)' }}>로그인</Link>
        </p>
      )}
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

const primaryBtnStyle: React.CSSProperties = {
  marginTop: 'auto',
  padding: 'var(--space-md)',
  borderRadius: 'var(--radius-full)',
  background: 'var(--color-primary)',
  color: 'var(--color-on-primary)',
  fontSize: 'var(--text-body-lg)',
  fontWeight: 'var(--weight-bold)',
}
