import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { DEFAULT_SCALE, newTerm } from './lib/grade'
import { supabase } from './lib/supabase'
import { useAuth } from './auth'

const KEY = 'gradecalc.v1'
const initial = () => ({ scale: structuredClone(DEFAULT_SCALE), terms: [newTerm('ปี 1 เทอม 1')] })
const valid = (s) => s && Array.isArray(s.terms) && Array.isArray(s.scale)
// state ที่ยังไม่เคยถูกแก้ (มีแค่เทอมเริ่มต้นที่ว่างเปล่า)
const isBlank = (s) =>
  s.terms.length === 0 ||
  (s.terms.length === 1 && s.terms[0].courses.every((c) => !c.name && c.score == null && c.grade === 'auto'))

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (valid(s)) return s
  } catch {}
  return initial()
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const { user, signOut } = useAuth()
  const [state, setState] = useState(load)
  // local = ไม่ได้ login, loading = กำลังดึงจากคลาวด์, saving, saved, error
  const [sync, setSync] = useState('local')
  const ready = useRef(false) // ดึงข้อมูลจากคลาวด์เสร็จแล้ว ถึงจะอนุญาตให้เซฟขึ้นไป
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state])

  // login แล้ว: ดึงข้อมูลจากคลาวด์มารวมกับในเครื่อง
  useEffect(() => {
    ready.current = false
    if (!supabase || !user) { setSync('local'); return }
    let cancelled = false
    setSync('loading')
    ;(async () => {
      const { data, error } = await supabase.from('grade_data').select('data').eq('user_id', user.id).maybeSingle()
      if (cancelled) return
      if (error) { setSync('error'); return }
      const local = stateRef.current
      if (valid(data?.data)) {
        const same = JSON.stringify(data.data) === JSON.stringify(local)
        if (!same && !isBlank(local) &&
            !confirm('พบข้อมูลทั้งในเครื่องนี้และบนคลาวด์\n\nOK = ใช้ข้อมูลบนคลาวด์ (ข้อมูลในเครื่องนี้จะถูกแทนที่)\nCancel = ใช้ข้อมูลในเครื่องนี้ (ข้อมูลบนคลาวด์จะถูกเขียนทับ)')) {
          // เก็บของเครื่องนี้ แล้วให้ effect เซฟขึ้นคลาวด์ด้านล่าง
        } else if (!same) {
          setState(data.data)
        }
      }
      ready.current = true
      setSync('saving')
      // trigger เซฟครั้งแรก (ถ้าคลาวด์ว่างจะอัปโหลดข้อมูลในเครื่องขึ้นไป)
      setState((s) => ({ ...s }))
    })()
    return () => { cancelled = true }
  }, [user?.id])

  // เซฟขึ้นคลาวด์แบบหน่วงเวลา
  useEffect(() => {
    if (!supabase || !user || !ready.current) return
    setSync('saving')
    const t = setTimeout(async () => {
      const { error } = await supabase.from('grade_data')
        .upsert({ user_id: user.id, data: state, updated_at: new Date().toISOString() })
      setSync(error ? 'error' : 'saved')
    }, 800)
    return () => clearTimeout(t)
  }, [state, user?.id])

  const api = {
    ...state,
    sync,
    setAll: (s) => setState(s),
    reset: () => setState(initial()),
    // ออกจากระบบแล้วล้างข้อมูลในเครื่อง กันคนอื่นที่ใช้เครื่องเดียวกันเห็น
    logout: async () => {
      ready.current = false
      await signOut()
      setState(initial())
    },
    setScale: (scale) => setState((s) => ({ ...s, scale })),
    addTerm: () => {
      const t = newTerm(`เทอมที่ ${state.terms.length + 1}`)
      setState((s) => ({ ...s, terms: [...s.terms, t] }))
      return t.id
    },
    deleteTerm: (id) => setState((s) => ({ ...s, terms: s.terms.filter((t) => t.id !== id) })),
    updateTerm: (id, patch) =>
      setState((s) => ({ ...s, terms: s.terms.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
