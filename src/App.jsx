import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import TermsPage from './pages/TermsPage'
import TermPage from './pages/TermPage'
import GpaxPage from './pages/GpaxPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import { useAuth } from './auth'
import { useStore } from './store'
import { cloudEnabled } from './lib/supabase'

const SYNC = { loading: '⏳ กำลังโหลด…', saving: '⏳ กำลังบันทึก…', saved: '☁️ ซิงก์แล้ว', error: '⚠️ ซิงก์ไม่สำเร็จ' }

function Account() {
  const { user } = useAuth()
  const { sync, logout } = useStore()
  if (!cloudEnabled) return null
  if (!user) return <NavLink to="/login" className="login-btn">เข้าสู่ระบบ</NavLink>
  return (
    <div className="account">
      <span className="muted" title={user.email}>{SYNC[sync]}</span>
      <button className="ghost" onClick={logout} title={user.email}>ออกจากระบบ</button>
    </div>
  )
}

export default function App() {
  return (
    <div className="wrap">
      <header>
        <h1>🎓 คำนวณเกรด</h1>
        <Account />
        <nav>
          <NavLink to="/terms">📚 เทอม</NavLink>
          <NavLink to="/gpax">🏆 GPAX</NavLink>
          <NavLink to="/settings">⚙️ ตั้งค่า</NavLink>
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
