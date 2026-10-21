import Icon from '../icons'
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
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
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

  // สมัครสำเร็จ -> ปิด popup แล้วสลับไปหน้าเข้าสู่ระบบ
  const closeMsg = () => {
    if (msg?.ok) { setMode('in'); setPassword(''); setConfirm('') }
    setMsg(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (mode === 'up' && password !== confirm) return setMsg({ ok: false, text: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' })
    setBusy(true); setMsg(null)
    const { data, error } = mode === 'in' ? await signIn(email, password) : await signUp(email, password, name.trim())
    setBusy(false)
    if (error) return setMsg({ ok: false, text: error.message })
    if (mode === 'up' && !data.session) return setMsg({ ok: true, text: 'สมัครแล้ว กรุณาเช็กอีเมลเพื่อยืนยัน แล้วกลับมาเข้าสู่ระบบ' })
    nav('/terms')
  }

  return (
    <div className="login-wrap">
    <div className="intro">
      <h2>เกรดของคุณ ซิงก์ได้ทุกที่</h2>
      <ul>
        <li><Icon name="cloud" size="1.4em" /> บันทึกเทอม รายวิชา และคะแนนไว้บนคลาวด์</li>
        <li><Icon name="phone" size="1.4em" /> เปิดดูและแก้ไขได้จากมือถือ แท็บเล็ต หรือคอมพิวเตอร์</li>
        <li><Icon name="lock" size="1.4em" /> ข้อมูลของคุณเห็นได้เฉพาะคุณเท่านั้น</li>
        <li><Icon name="trophy" size="1.4em" /> คำนวณ GPA รายเทอม GPAX รวม และเป้าหมายย้อนกลับ</li>
      </ul>
    </div>
    <form className="card auth" onSubmit={submit}>
      <h2>{mode === 'in' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h2>
      <p className="hint">ล็อกอินแล้วข้อมูลเกรดจะซิงก์ไปทุกอุปกรณ์</p>
      {mode === 'up' && (
        <label>ชื่อ-นามสกุล
          <input required autoComplete="name" placeholder="เช่น สมชาย ใจดี" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      )}
      <label>อีเมล
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>รหัสผ่าน
        <input type="password" required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {mode === 'up' && (
        <label>ยืนยันรหัสผ่านอีกครั้ง
          <input type="password" required minLength={6} autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
      )}
      <button className="primary" disabled={busy}>{busy ? 'กำลังดำเนินการ…' : mode === 'in' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button>
      <button type="button" className="ghost" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(null); setConfirm('') }}>
        {mode === 'in' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
      </button>
      {msg && (
        <div className="modal-bg" onClick={closeMsg}>
          <div className="modal" role="alertdialog" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon ${msg.ok ? 'ok' : 'no'}`}><Icon name={msg.ok ? 'check' : 'alert'} size="2.4rem" /></div>
            <p>{msg.text}</p>
            <button type="button" className="primary" autoFocus onClick={closeMsg}>ตกลง</button>
          </div>
        </div>
      )}
    </form>
    </div>
  )
}
