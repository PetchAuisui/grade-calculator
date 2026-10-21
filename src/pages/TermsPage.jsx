import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../icons'
import { useStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import { fmt, isDraft, termStats } from '../lib/grade'

// การ์ดเทอมหนึ่งใบ: กดเพื่อเข้าเทอม, เมนู ⋯ สำหรับแก้ชื่อ/เปลี่ยนสถานะ/ลบโดยไม่ต้องเข้าไป
function TermCard({ term }) {
  const { scale, updateTerm, deleteTerm } = useStore()
  const nav = useNavigate()
  const [menu, setMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(term.name)
  const wrap = useRef(null)
  const s = termStats(term, scale)

  useEffect(() => {
    if (!menu) return
    const close = (e) => { if (!wrap.current?.contains(e.target)) setMenu(false) }
    const esc = (e) => e.key === 'Escape' && setMenu(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [menu])

  const startEdit = () => { setName(term.name); setMenu(false); setEditing(true) }
  const commit = () => { updateTerm(term.id, { name: name.trim() || term.name }); setEditing(false) }
  const remove = () => {
    setMenu(false)
    if (confirm(`ลบ "${term.name}" และรายวิชาทั้งหมดในเทอมนี้?`)) deleteTerm(term.id)
  }

  return (
    <div className="card term-card" onClick={() => !editing && nav(`/terms/${term.id}`)}>
      <div className="card-top" onClick={(e) => e.stopPropagation()}>
        {editing ? (
          <input
            className="rename" autoFocus value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          />
        ) : (
          <Link to={`/terms/${term.id}`} className="term-name">{term.name || '(ไม่มีชื่อ)'}</Link>
        )}
        <StatusBadge term={term} />
        <div className="menu-wrap" ref={wrap}>
          <button className="ghost icon-btn" aria-label="ตัวเลือกเทอม" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
            <Icon name="more" size="1.3em" />
          </button>
          {menu && (
            <div className="menu" role="menu">
              <button role="menuitem" onClick={startEdit}><Icon name="pencil" /> แก้ไขชื่อ</button>
              <button role="menuitem" onClick={() => { updateTerm(term.id, { status: isDraft(term) ? 'final' : 'draft' }); setMenu(false) }}>
                <Icon name={isDraft(term) ? 'check' : 'flask'} /> {isDraft(term) ? 'ทำเป็นเกรดออกแล้ว' : 'ทำเป็นทดลอง'}
              </button>
              <button role="menuitem" className="danger" onClick={remove}><Icon name="trash" /> ลบเทอม</button>
            </div>
          )}
        </div>
      </div>
      <div className="big">{fmt(s.gpa)}</div>
      <span className="muted">GPA เทอม · {term.courses.length} วิชา · {s.allCr} หน่วยกิต</span>
      {s.pendCr > 0 && <span className="tag">มี {s.pendCr} หน่วยกิตยังไม่ออกเกรด</span>}
    </div>
  )
}

// หน้ารวมเทอม: เลือกเทอมเพื่อเข้าไปแก้รายวิชา
export default function TermsPage() {
  const { terms, addTerm } = useStore()
  const nav = useNavigate()

  return (
    <>
      <div className="page-head">
        <h2>เทอมทั้งหมด</h2>
        <button className="primary" onClick={() => nav(`/terms/${addTerm()}`)}><Icon name="plus" /> เพิ่มเทอม</button>
      </div>
      {terms.length === 0 && <div className="card empty">ยังไม่มีเทอม กด "เพิ่มเทอม" เพื่อเริ่มต้น</div>}
      <div className="grid">
        {terms.map((t) => <TermCard key={t.id} term={t} />)}
      </div>
    </>
  )
}
