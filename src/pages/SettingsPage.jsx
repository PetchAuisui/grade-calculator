import Icon from '../icons'
import { useRef } from 'react'
import { useState } from 'react'
import { useStore } from '../store'
import { cloudEnabled } from '../lib/supabase'
import { displayName, useAuth } from '../auth'
import { DEFAULT_SCALE, toNum } from '../lib/grade'

export default function SettingsPage() {
  const store = useStore()
  const { scale, setScale } = store
  const file = useRef(null)
  const { user, updateName } = useAuth()
  const [name, setName] = useState(user?.user_metadata?.display_name ?? '')
  const [saved, setSaved] = useState('')
  const saveName = async (e) => {
    e.preventDefault()
    const { error } = await updateName(name.trim())
    setSaved(error ? 'บันทึกไม่สำเร็จ: ' + error.message : 'บันทึกแล้ว')
  }
  const patch = (i, p) => setScale(scale.map((s, j) => (j === i ? { ...s, ...p } : s)))

  const exportJson = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ scale: store.scale, terms: store.terms }, null, 2)], { type: 'application/json' }))
    a.download = 'grades-backup.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const importJson = async (e) => {
    try {
      const s = JSON.parse(await e.target.files[0].text())
      if (!Array.isArray(s.terms) || !Array.isArray(s.scale)) throw new Error()
      if (confirm('นำเข้าจะแทนที่ข้อมูลปัจจุบันทั้งหมด ต้องการต่อหรือไม่?')) store.setAll({ scale: s.scale, terms: s.terms })
    } catch { alert('ไฟล์ไม่ถูกต้อง') }
    e.target.value = ''
  }

  return (
    <>
      {cloudEnabled && user && (
        <form className="card" onSubmit={saveName}>
          <h3>บัญชี</h3>
          <p className="hint">อีเมล: {user.email} · แสดงเป็น "{displayName(user)}"</p>
          <div className="goal-inputs">
            <label>ชื่อ-นามสกุล (ชื่อที่แสดง)
              <input value={name} onChange={(e) => { setName(e.target.value); setSaved('') }} placeholder="เช่น สมชาย ใจดี" />
            </label>
          </div>
          <div className="actions">
            <button className="primary" disabled={!name.trim()}>บันทึกชื่อ</button>
            {saved && <span className="muted" style={{ alignSelf: 'center', margin: 0 }}>{saved}</span>}
          </div>
        </form>
      )}
      <div className="card">
        <h3>ตารางเกณฑ์เกรด</h3>
        <p className="hint">เกรดคำนวณจากคะแนนขั้นต่ำสูงสุดที่คะแนนถึง ค่าเริ่มต้นเป็นเกณฑ์ 4.0</p>
        <table>
          <thead><tr><th>เกรด</th><th>คะแนนขั้นต่ำ</th><th>แต้ม</th><th /></tr></thead>
          <tbody>
            {scale.map((s, i) => s.nogpa ? (
              <tr key={i}>
                <td><input value={s.g} disabled /></td>
                <td colSpan={2} className="muted">{s.pass ? 'ผ่าน' : 'ไม่ผ่าน'} · เลือกเองเท่านั้น ไม่คิดเข้า GPA/GPAX</td>
                <td />
              </tr>
            ) : (
              <tr key={i}>
                <td><input value={s.g} onChange={(e) => patch(i, { g: e.target.value })} /></td>
                <td><input type="number" step="0.01" value={s.min} onChange={(e) => patch(i, { min: toNum(e.target.value) ?? 0 })} /></td>
                <td><input type="number" step="0.1" value={s.pt} onChange={(e) => patch(i, { pt: toNum(e.target.value) ?? 0 })} /></td>
                <td className="w36"><button className="ghost" disabled={scale.filter((x) => !x.nogpa).length <= 1} onClick={() => setScale(scale.filter((_, j) => j !== i))}><Icon name="x" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="actions">
          <button onClick={() => setScale([...scale.filter((x) => !x.nogpa), { g: '?', min: 0, pt: 0 }, ...scale.filter((x) => x.nogpa)])}><Icon name="plus" /> เพิ่มเกรด</button>
          <button onClick={() => setScale(structuredClone(DEFAULT_SCALE))}>คืนค่าเริ่มต้น</button>
        </div>
      </div>

      <div className="card">
        <h3>ข้อมูล</h3>
        <p className="hint">ข้อมูลเก็บในเบราว์เซอร์เครื่องนี้เท่านั้น ใช้ส่งออก/นำเข้าเพื่อสำรองหรือย้ายเครื่อง</p>
        <div className="actions">
          <button onClick={exportJson}>ส่งออก JSON</button>
          <button onClick={() => file.current.click()}>นำเข้า JSON</button>
          <button className="ghost" onClick={() => confirm('ลบข้อมูลทั้งหมดถาวร?') && store.reset()}>ลบข้อมูลทั้งหมด</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={importJson} />
        </div>
      </div>
    </>
  )
}
