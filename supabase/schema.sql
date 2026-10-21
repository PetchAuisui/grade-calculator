-- รันใน Supabase Dashboard → SQL Editor (รันซ้ำได้ ไม่พัง)
create table if not exists public.grade_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.grade_data enable row level security;

-- แต่ละคนเห็น/แก้ได้เฉพาะแถวของตัวเอง
drop policy if exists "own row select" on public.grade_data;
create policy "own row select" on public.grade_data
  for select using (auth.uid() = user_id);
drop policy if exists "own row insert" on public.grade_data;
create policy "own row insert" on public.grade_data
  for insert with check (auth.uid() = user_id);
drop policy if exists "own row update" on public.grade_data;
create policy "own row update" on public.grade_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own row delete" on public.grade_data;
create policy "own row delete" on public.grade_data
  for delete using (auth.uid() = user_id);
