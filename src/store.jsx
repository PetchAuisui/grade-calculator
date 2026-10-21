import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_SCALE, newTerm } from './lib/grade'

const KEY = 'gradecalc.v1'
const initial = () => ({ scale: structuredClone(DEFAULT_SCALE), terms: [newTerm('ปี 1 เทอม 1')] })

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s && Array.isArray(s.terms) && Array.isArray(s.scale)) return s
  } catch {}
  return initial()
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state])

  const api = {
    ...state,
    setAll: (s) => setState(s),
    reset: () => setState(initial()),
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
