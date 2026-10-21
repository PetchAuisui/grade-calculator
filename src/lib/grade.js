export const DEFAULT_SCALE = [
  { g: 'A', min: 80, pt: 4 },
  { g: 'B+', min: 75, pt: 3.5 },
  { g: 'B', min: 70, pt: 3 },
  { g: 'C+', min: 65, pt: 2.5 },
  { g: 'C', min: 60, pt: 2 },
  { g: 'D+', min: 55, pt: 1.5 },
  { g: 'D', min: 50, pt: 1 },
  { g: 'F', min: 0, pt: 0 },
  // S/U: ผ่าน/ไม่ผ่าน เลือกเกรดเองเท่านั้น ไม่คิดเข้า GPA (nogpa)
  { g: 'S', min: 0, pt: 0, nogpa: true, pass: true },
  { g: 'U', min: 0, pt: 0, nogpa: true, pass: false },
]

// ข้อมูลเก่าที่บันทึกไว้ก่อนมี S/U: เติม S/U เข้าไปในตารางเกณฑ์
export function withSpecial(scale) {
  const extra = DEFAULT_SCALE.filter((d) => d.nogpa && !scale.some((s) => s.g === d.g))
  return extra.length ? [...scale, ...extra.map((e) => ({ ...e }))] : scale
}
export const gpaScale = (scale) => scale.filter((s) => !s.nogpa)

export const uid = () => Math.random().toString(36).slice(2, 9)
export const fmt = (n, d = 2) => (n == null || Number.isNaN(n) ? '–' : n.toFixed(d))
export const toNum = (v) => (v === '' || v == null || Number.isNaN(parseFloat(v)) ? null : parseFloat(v))

export const newCourse = () => ({ id: uid(), name: '', credit: 3, score: null, grade: 'auto' })
// status: 'final' = เกรดจริงออกแล้ว, 'draft' = ทดลอง/คาดการณ์ (เทอมที่บันทึกก่อนหน้านี้ไม่มี status ให้นับเป็น final)
export const newTerm = (name) => ({ id: uid(), name, status: 'final', target: null, targetX: null, courses: [newCourse()] })
export const isDraft = (t) => t.status === 'draft'

export function gradeOf(course, scale) {
  if (course.grade && course.grade !== 'auto') return scale.find((s) => s.g === course.grade) || null
  if (course.score == null) return null
  return gpaScale(scale).sort((a, b) => b.min - a.min).find((s) => course.score >= s.min) || null
}

// cr/pts = เฉพาะวิชาที่มีเกรดแล้ว, pendCr = หน่วยกิตวิชาที่ยังไม่ออกเกรด
export function termStats(term, scale) {
  let cr = 0, pts = 0, pendCr = 0, passCr = 0, noGpaCr = 0
  for (const c of term.courses) {
    const credit = c.credit || 0
    const g = gradeOf(c, scale)
    if (!g) pendCr += credit
    else if (g.nogpa) { noGpaCr += credit; if (g.pass) passCr += credit }
    else { cr += credit; pts += credit * g.pt }
  }
  return { cr, pts, pendCr, passCr, allCr: cr + pendCr + noGpaCr, gpa: cr ? pts / cr : null }
}

export function totals(terms, scale) {
  let cr = 0, pts = 0, subjects = 0, passCr = 0
  for (const t of terms) {
    const s = termStats(t, scale)
    cr += s.cr; pts += s.pts; passCr += s.passCr; subjects += t.courses.length
  }
  return { cr, pts, passCr, subjects, gpax: cr ? pts / cr : null }
}

// GPAX สะสมถึงแต่ละเทอม (เรียงตามลำดับเทอม)
export function cumulative(terms, scale) {
  let cr = 0, pts = 0
  return terms.map((t) => {
    const s = termStats(t, scale)
    cr += s.cr; pts += s.pts
    return { term: t, ...s, cumCr: cr, gpax: cr ? pts / cr : null }
  })
}

// แต้มเฉลี่ยที่ต้องได้ -> เกรดต่ำสุดที่ถึง
export function describeNeed(need, fullScale) {
  const scale = gpaScale(fullScale)
  const maxPt = Math.max(...scale.map((s) => s.pt))
  if (need <= 0) return { level: 'ok', need, text: 'บรรลุเป้าหมายแล้ว ได้เกรดเท่าไรก็ถึง' }
  if (need > maxPt + 1e-9) return { level: 'no', need, text: `เป็นไปไม่ได้ ต้องเฉลี่ย ${fmt(need)} แต่เกรดสูงสุดคือ ${fmt(maxPt)}` }
  const g = [...scale].sort((a, b) => a.pt - b.pt).find((s) => s.pt >= need - 1e-9)
  return {
    level: need > maxPt - 0.5 ? 'warn' : 'ok',
    need,
    grade: g,
    text: `ต้องได้แต้มเฉลี่ย ≥ ${fmt(need)} → อย่างน้อยเกรด ${g.g} (คะแนน ≥ ${g.min})`,
  }
}

export const requiredAvg = (target, haveCr, havePts, newCr) => (target * (haveCr + newCr) - havePts) / newCr
