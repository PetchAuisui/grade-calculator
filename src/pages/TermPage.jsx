import Icon from '../icons'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import {
  describeNeed, fmt, gradeOf, newCourse, requiredAvg, termStats, toNum, totals,
} from '../lib/grade'

// หน้าเดียวของ 1 เทอม: รายวิชา, GPA เทอมนี้, คำนวณย้อนกลับเฉพาะเทอมนี้
export default function TermPage() {
  const { id } = useParams()
  const { terms, scale, updateTerm, deleteTerm } = useStore()
  const nav = useNavigate()
  const term = terms.find((t) => t.id === id)
  if (!term) return <Navigate to="/terms" replace />

  const stats = termStats(term, scale)
  const all = totals(terms, scale)
  const setCourses = (courses) => updateTerm(id, { courses })
  const patchCourse = (cid, patch) =>
    setCourses(term.courses.map((c) => (c.id === cid ? { ...c, ...patch } : c)))

  const goals = []
  if (stats.pendCr > 0) {
    if (term.target != null)
      goals.push({ icon: 'target', label: `GPA เทอมนี้ ${fmt(term.target)}`, ...describeNeed(requiredAvg(term.target, stats.cr, stats.pts, stats.pendCr), scale) })
    if (term.targetX != null)
      goals.push({ icon: 'trophy', label: `GPAX รวม ${fmt(term.targetX)}`, ...describeNeed(requiredAvg(term.targetX, all.cr, all.pts, stats.pendCr), scale) })
  }

  return (
    <>
      <Link to="/terms" className="back"><Icon name="back" /> กลับไปหน้าเทอม</Link>
      <div className="cols">
      <div className="card">
        <div className="term-head">
          <input className="tname" value={term.name} placeholder="ชื่อเทอม" onChange={(e) => updateTerm(id, { name: e.target.value })} />
          <button className="ghost" title="ลบเทอม" aria-label="ลบเทอม" onClick={() => { if (confirm(`ลบ "${term.name}" ?`)) { deleteTerm(id); nav('/terms') } }}><Icon name="trash" size="1.2em" /></button>
        </div>
        <div className="summary two">
          <div className="stat"><b>{fmt(stats.gpa)}</b><span>GPA เทอมนี้</span></div>
          <div className="stat"><b>{stats.cr + stats.pendCr}</b><span>หน่วยกิตเทอมนี้</span></div>
        </div>

        <table>
          <thead>
            <tr><th>รายวิชา</th><th>หน่วยกิต</th><th>คะแนน</th><th className="hide-sm">เกรด</th><th className="c">ผล</th><th /></tr>
          </thead>
          <tbody>
            {term.courses.map((c) => {
              const g = gradeOf(c, scale)
              return (
                <tr key={c.id}>
                  <td><input value={c.name} placeholder="ชื่อวิชา" onChange={(e) => patchCourse(c.id, { name: e.target.value })} /></td>
                  <td className="num w70"><input type="number" min="0" step="0.5" value={c.credit ?? ''} onChange={(e) => patchCourse(c.id, { credit: toNum(e.target.value) })} /></td>
                  <td className="num w80"><input type="number" min="0" max="100" step="0.01" placeholder="0-100" value={c.score ?? ''} onChange={(e) => patchCourse(c.id, { score: toNum(e.target.value) })} /></td>
                  <td className="hide-sm w100">
                    <select value={c.grade} onChange={(e) => patchCourse(c.id, { grade: e.target.value })}>
                      <option value="auto">อัตโนมัติ</option>
                      {scale.map((s) => <option key={s.g} value={s.g}>{s.g}</option>)}
                    </select>
                  </td>
                  <td className="gcell w64">{g ? <>{g.g}<small>{fmt(g.pt, 1)}</small></> : '–'}</td>
                  <td className="w36"><button className="ghost" title="ลบวิชา" onClick={() => setCourses(term.courses.filter((x) => x.id !== c.id))}><Icon name="x" /></button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="actions"><button onClick={() => setCourses([...term.courses, newCourse()])}><Icon name="plus" /> เพิ่มวิชา</button></div>
      </div>

      <div className="card side">
        <h3><Icon name="repeat" /> คำนวณย้อนกลับ: ต้องได้เกรดเท่าไรถึงจะได้ตามเป้า</h3>
        <p className="hint">เว้นคะแนน/เกรดว่างไว้สำหรับวิชาที่ยังไม่ออกผล แล้วเว็บจะคำนวณว่าวิชาเหล่านั้นต้องได้เท่าไร</p>
        <div className="goal-inputs">
          <label>เป้า GPA เทอมนี้
            <input type="number" min="0" step="0.01" placeholder="เช่น 3.50" value={term.target ?? ''} onChange={(e) => updateTerm(id, { target: toNum(e.target.value) })} />
          </label>
          <label>เป้า GPAX รวมทุกเทอม
            <input type="number" min="0" step="0.01" placeholder="เช่น 3.25" value={term.targetX ?? ''} onChange={(e) => updateTerm(id, { targetX: toNum(e.target.value) })} />
          </label>
        </div>
        <div className="rev">
          {stats.pendCr <= 0 && <div className="info">ไม่มีวิชาที่ยังไม่มีเกรดในเทอมนี้</div>}
          {stats.pendCr > 0 && !goals.length && <div className="info">ใส่เป้าหมายด้านบนเพื่อดูผล</div>}
          {goals.map((g) => <div key={g.label} className={g.level}><b><Icon name={g.icon} /> {g.label}:</b> {g.text}</div>)}
        </div>
      </div>
      </div>
    </>
  )
}
