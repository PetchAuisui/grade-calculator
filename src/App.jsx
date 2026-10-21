import Icon from './icons'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import TermsPage from './pages/TermsPage'
import TermPage from './pages/TermPage'
import GpaxPage from './pages/GpaxPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import { displayName, useAuth } from './auth'
import { useStore } from './store'
import { cloudEnabled } from './lib/supabase'

const SYNC = {
  loading: ['clock', 'กำลังโหลด…'],
  saving: ['clock', 'กำลังบันทึก…'],
  saved: ['cloud', 'ซิงก์แล้ว'],
  error: ['alert', 'ซิงก์ไม่สำเร็จ'],
}

function Account() {
  const { user } = useAuth()
  const { sync, logout } = useStore()
  if (!cloudEnabled) return null
  if (!user) return <NavLink to="/login" className="login-btn">เข้าสู่ระบบ</NavLink>
  return (
    <div className="account">
      <span className={`sync ${sync}`} title={user.email}><Icon name={SYNC[sync]?.[0] ?? 'cloud'} /> {SYNC[sync]?.[1]}</span>
      <div className="who" title={user.email}>
        <span className="avatar">{displayName(user).charAt(0).toUpperCase()}</span>
        <span className="who-text"><b>{displayName(user)}</b><small>{user.email}</small></span>
      </div>
      <button className="ghost" onClick={logout}>ออกจากระบบ</button>
    </div>
  )
}

export default function App() {
  return (
    <div className="wrap">
      <header>
        <h1><Icon name="cap" size="1.3em" /> คำนวณเกรด</h1>
        <Account />
        <nav>
          <NavLink to="/terms"><Icon name="book" /> เทอม</NavLink>
          <NavLink to="/gpax"><Icon name="trophy" /> GPAX</NavLink>
          <NavLink to="/settings"><Icon name="sliders" /> ตั้งค่า</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/terms" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms/:id" element={<TermPage />} />
        <Route path="/gpax" element={<GpaxPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/terms" replace />} />
      </Routes>
    </div>
  )
}
