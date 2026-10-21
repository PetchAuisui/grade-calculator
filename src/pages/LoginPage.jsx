import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { cloudEnabled } from '../lib/supabase'

export default function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  if (!cloudEnabled) {
    return (
      <div className="card">
        <h3>ยังไม่ได้ตั้งค่าระบบ login</h3>
        <p className="hint">ตอนนี้แอปเก็บข้อมูลในเครื่องนี้อย่างเดียว ตั้งค่า Supabase ตามขั้นตอนใน README เพื่อเปิดใช้ login และซิงก์ข้ามอุปกรณ์</p>
      </div>
    )
  }
  if (!loading && user) return <Navigate to="/terms" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setMsg(null)
    const { data, error } = mode === 'in' ? await signIn(email, password) : await signUp(email, password)
    setBusy(false)
    if (error) return setMsg({ ok: false, text: error.message })
    if (mode === 'up' && !data.session) return setMsg({ ok: true, text: 'สมัครแล้ว กรุณาเช็กอีเมลเพื่อยืนยัน แล้วกลับมาเข้าสู่ระบบ' })
    nav('/terms')
  }

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{mode === 'in' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h2>
      <p className="hint">ล็อกอินแล้วข้อมูลเกรดจะซิงก์ไปทุกอุปกรณ์</p>
      <label>อีเมล
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>รหัสผ่าน
        <input type="password" required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {msg && <div className={`rev-msg ${msg.ok ? 'ok' : 'no'}`}>{msg.text}</div>}
      <button className="primary" disabled={busy}>{busy ? 'กำลังดำเนินการ…' : mode === 'in' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button>
      <button type="button" className="ghost" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(null) }}>
        {mode === 'in' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
      </button>
    </form>
  )
}
