# คำนวณเกรด GPA / GPAX

React + Vite + Supabase (login และซิงก์ข้ามอุปกรณ์)

## ฟีเจอร์
- **เทอม** (`/terms`): เพิ่มเทอมและรายวิชา ใส่หน่วยกิตกับคะแนน แล้วแอปตัดเกรดให้อัตโนมัติ หรือเลือกเกรดเองก็ได้
- **สถานะเทอม**: `final` คือเกรดออกจริงแล้ว ส่วน `draft` ใช้ทดลองหรือคาดการณ์เกรด
- **GPAX** (`/gpax`): ดู GPA รายเทอมและ GPAX สะสมถึงแต่ละเทอม
- **เป้าหมาย**: ตั้งเป้า GPA เทอมนี้หรือ GPAX รวม แล้วแอปบอกว่าวิชาที่ยังไม่ออกเกรดต้องได้เฉลี่ยเท่าไร และเกรดต่ำสุดที่ยังถึงเป้าคืออะไร
- **ใช้ได้โดยไม่ต้องล็อกอิน**: ข้อมูลเก็บใน localStorage ถ้าล็อกอินจะซิงก์ขึ้น Supabase และถามก่อนถ้าข้อมูลในเครื่องกับบนคลาวด์ไม่ตรงกัน
- **S/U**: วิชาผ่าน/ไม่ผ่าน นับหน่วยกิตที่ผ่านแต่ไม่คิดเข้า GPA
- **ตั้งค่าเกณฑ์เกรด** (`/settings`): ค่าเริ่มต้นคือ A ≥ 80, B+ ≥ 75, B ≥ 70, C+ ≥ 65, C ≥ 60, D+ ≥ 55, D ≥ 50 ปรับเองได้
## โครงสร้าง
```
src/
  lib/grade.js     # ตรรกะคำนวณเกรด, GPA, GPAX, เป้าหมาย
  lib/supabase.js  # ตั้งค่า Supabase client
  store.jsx        # state และการบันทึกข้อมูล
  auth.jsx         # login / session
  pages/           # หน้า Terms, Term, GPAX, Login, Settings
supabase/schema.sql  # ตาราง + Row Level Security
```

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
