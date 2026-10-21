import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import TermsPage from './pages/TermsPage'
import TermPage from './pages/TermPage'
import GpaxPage from './pages/GpaxPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <div className="wrap">
      <header>
        <h1>🎓 คำนวณเกรด</h1>
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
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/terms" replace />} />
      </Routes>
    </div>
  )
}
