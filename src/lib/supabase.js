import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// ไม่ได้ตั้งค่า -> null แล้วแอปทำงานแบบเก็บในเครื่องอย่างเดียว
export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce' } }) : null
export const cloudEnabled = !!supabase
