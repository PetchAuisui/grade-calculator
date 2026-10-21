import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// ชื่อที่แสดง: ชื่อ-นามสกุลที่ตั้งไว้ ถ้าไม่มีใช้ส่วนหน้าของอีเมล
export const displayName = (user) => user?.user_metadata?.display_name?.trim() || user?.email?.split('@')[0] || ''

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  const api = {
    user,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, name) =>
      supabase.auth.signUp({
        email, password,
        options: { data: { display_name: name }, emailRedirectTo: location.origin + location.pathname },
      }),
    updateName: async (name) => {
      const res = await supabase.auth.updateUser({ data: { display_name: name } })
      if (res.data?.user) setUser(res.data.user)
      return res
    },
    signOut: () => supabase.auth.signOut(),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
