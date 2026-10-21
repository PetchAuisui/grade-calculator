import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { fmt, termStats } from '../lib/grade'

// หน้ารวมเทอม: เลือกเทอมเพื่อเข้าไปแก้รายวิชา
export default function TermsPage() {
  const { terms, scale, addTerm } = useStore()
  const nav = useNavigate()

  return (
    <>
      <div className="page-head">
        <h2>เทอมทั้งหมด</h2>
        <button className="primary" onClick={() => nav(`/terms/${addTerm()}`)}>+ เพิ่มเทอม</button>
      </div>
      {terms.length === 0 && <div className="card empty">ยังไม่มีเทอม กด "+ เพิ่มเทอม" เพื่อเริ่มต้น</div>}
      <div className="grid">
        {terms.map((t) => {
          const s = termStats(t, scale)
          return (
            <Link key={t.id} to={`/terms/${t.id}`} className="card term-card">
              <b>{t.name || '(ไม่มีชื่อ)'}</b>
              <div className="big">{fmt(s.gpa)}</div>
              <span className="muted">GPA เทอม · {t.courses.length} วิชา · {s.cr + s.pendCr} หน่วยกิต</span>
              {s.pendCr > 0 && <span className="tag">มี {s.pendCr} หน่วยกิตยังไม่ออกเกรด</span>}
            </Link>
          )
        })}
      </div>
    </>
  )
}
