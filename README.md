# คำนวณเกรด GPA / GPAX

React + Vite + Supabase (login และซิงก์ข้ามอุปกรณ์)

## รัน
```bash
npm install
cp .env.example .env.local   # ใส่ค่า Supabase (ข้ามได้ ถ้าไม่ตั้งแอปจะเก็บในเครื่องอย่างเดียว)
npm run dev
```

## ตั้งค่า Supabase (ฟรี)
1. สมัคร/ล็อกอินที่ supabase.com แล้วสร้าง Project
2. SQL Editor → วางและรัน `supabase/schema.sql` (สร้างตารางพร้อม Row Level Security ให้แต่ละคนเห็นเฉพาะข้อมูลตัวเอง)
3. Project Settings → API → คัดลอก **Project URL** และ **anon public key** ใส่ใน `.env.local`
4. Authentication → URL Configuration → เพิ่ม URL ของเว็บที่ deploy (เช่น `https://<user>.github.io/<repo>/`) ใน Site URL / Redirect URLs
5. (ทางเลือก) ปิด "Confirm email" ใน Authentication → Providers → Email ถ้าไม่ต้องการยืนยันอีเมลตอนสมัคร

anon key เป็นคีย์สาธารณะโดยออกแบบ ความปลอดภัยมาจาก RLS ใน schema.sql **ห้ามใส่ service_role key ในแอป**

## Deploy GitHub Pages
Settings → Pages → Source: GitHub Actions
Settings → Secrets and variables → Actions → **Variables** → เพิ่ม `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`
จากนั้น push เข้า `main`
