import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

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
    signUp: (email, password) =>
      supabase.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } }),
    signOut: () => supabase.auth.signOut(),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
