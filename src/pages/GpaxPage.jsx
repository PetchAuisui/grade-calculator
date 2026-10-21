import Icon from '../icons'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { cumulative, describeNeed, fmt, isDraft, requiredAvg, toNum, totals } from '../lib/grade'
import StatusBadge from '../components/StatusBadge'

// หน้า GPAX รวมทุกเทอม แยกจากหน้าเทอมโดยสิ้นเชิง
export default function GpaxPage() {
  const { terms, scale } = useStore()
  const [target, setTarget] = useState('')
  const [futureCr, setFutureCr] = useState('')
  const [withDraft, setWithDraft] = useState(false)
  const drafts = terms.filter(isDraft).length
  const counted = withDraft ? terms : terms.filter((t) => !isDraft(t))
  const tot = totals(counted, scale)
  const rows = cumulative(counted, scale)
  const maxPt = Math.max(4, ...scale.map((s) => s.pt))

  const t = toNum(target), f = toNum(futureCr)
  const plan = t != null && f != null && f > 0 ? describeNeed(requiredAvg(t, tot.cr, tot.pts, f), scale) : null

  return (
    <>
      <div className="card">
        <div className="summary">
          <div className="stat"><b>{fmt(tot.gpax)}</b><span>GPAX</span></div>
          <div className="stat"><b>{tot.cr}</b><span>หน่วยกิตที่มีเกรด</span></div>
          <div className="stat"><b>{counted.length}</b><span>เทอมที่นับ</span></div>
        </div>
        {drafts > 0 && (
          <label className="check">
            <input type="checkbox" checked={withDraft} onChange={(e) => setWithDraft(e.target.checked)} />
            รวมเทอมทดลอง ({drafts} เทอม) ในการคำนวณ
          </label>
        )}
      </div>

      <div className="cols">
      <div className="card">
        <h3>สรุปรายเทอม</h3>
        {rows.length === 0 && <p className="empty">ยังไม่มีข้อมูล</p>}
        <table className="plain">
          <thead><tr><th>เทอม</th><th className="r">หน่วยกิต</th><th className="r">GPA</th><th className="r">GPAX สะสม</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.term.id}>
                <td><Link to={`/terms/${r.term.id}`}>{r.term.name || '(ไม่มีชื่อ)'}</Link> {isDraft(r.term) && <StatusBadge term={r.term} />}</td>
                <td className="r">{r.cr}</td>
                <td className="r">{fmt(r.gpa)}</td>
                <td className="r"><b>{fmt(r.gpax)}</b></td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot><tr><td>รวม</td><td className="r">{tot.cr}</td><td /><td className="r"><b>{fmt(tot.gpax)}</b></td></tr></tfoot>
          )}
        </table>
        <div className="bars">
          {rows.map((r) => (
            <div className="bar" key={r.term.id}>
              <span className="name">{r.term.name}</span>
              <div className="track"><div className="fill" style={{ width: `${r.gpa == null ? 0 : (r.gpa / maxPt) * 100}%` }} /></div>
              <b>{fmt(r.gpa)}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="card side">
        <h3><Icon name="repeat" /> วางแผนอนาคต: อยากได้ GPAX เท่านี้ ต้องทำเทอมหน้าเท่าไร</h3>
        <div className="goal-inputs">
          <label>เป้า GPAX
            <input type="number" min="0" step="0.01" placeholder="เช่น 3.00" value={target} onChange={(e) => setTarget(e.target.value)} />
          </label>
          <label>หน่วยกิตที่จะเรียนเพิ่ม
            <input type="number" min="0" step="1" placeholder="เช่น 60" value={futureCr} onChange={(e) => setFutureCr(e.target.value)} />
          </label>
        </div>
        <div className="rev">
          {plan ? <div className={plan.level}>{plan.text.replace('ต้องได้แต้มเฉลี่ย', 'GPA เฉลี่ยจากหน่วยกิตที่เหลือต้อง')}</div> : <div className="info">ใส่เป้าหมายและหน่วยกิตที่จะเรียนเพิ่ม</div>}
        </div>
      </div>
      </div>
    </>
  )
}
