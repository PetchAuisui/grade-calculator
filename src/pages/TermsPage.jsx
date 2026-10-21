import Icon from '../icons'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import { fmt, termStats } from '../lib/grade'

// หน้ารวมเทอม: เลือกเทอมเพื่อเข้าไปแก้รายวิชา
export default function TermsPage() {
  const { terms, scale, addTerm } = useStore()
  const nav = useNavigate()

  return (
    <>
      <div className="page-head">
        <h2>เทอมทั้งหมด</h2>
        <button className="primary" onClick={() => nav(`/terms/${addTerm()}`)}><Icon name="plus" /> เพิ่มเทอม</button>
      </div>
      {terms.length === 0 && <div className="card empty">ยังไม่มีเทอม กด "<Icon name="plus" /> เพิ่มเทอม" เพื่อเริ่มต้น</div>}
      <div className="grid">
        {terms.map((t) => {
          const s = termStats(t, scale)
          return (
            <Link key={t.id} to={`/terms/${t.id}`} className="card term-card">
              <div className="card-top"><b>{t.name || '(ไม่มีชื่อ)'}</b><StatusBadge term={t} /></div>
              <div className="big">{fmt(s.gpa)}</div>
              <span className="muted">GPA เทอม · {t.courses.length} วิชา · {s.allCr} หน่วยกิต</span>
              {s.pendCr > 0 && <span className="tag">มี {s.pendCr} หน่วยกิตยังไม่ออกเกรด</span>}
            </Link>
          )
        })}
      </div>
    </>
  )
}
