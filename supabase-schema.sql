-- Run this in your Supabase SQL Editor

-- Promos table
create table promos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_name text not null,
  platform text,
  amount numeric(10,2) not null default 0,
  due_date date,
  notes text,
  priority boolean default false,
  completed boolean default false,
  completed_at timestamptz,
  work_link text,
  screenshot_url text,
  created_at timestamptz default now()
);

-- User settings table (monthly goal)
create table user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  monthly_goal numeric(10,2) default 1000,
  updated_at timestamptz default now()
);

-- Row Level Security: users only see their own data
alter table promos enable row level security;
alter table user_settings enable row level security;

create policy "Users own promos" on promos
  for all using (auth.uid() = user_id);

create policy "Users own settings" on user_settings
  for all using (auth.uid() = user_id);

-- Storage bucket for payment screenshots
insert into storage.buckets (id, name, public) values ('screenshots', 'screenshots', true);

create policy "Users upload screenshots" on storage.objects
  for insert with check (bucket_id = 'screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Screenshots are public" on storage.objects
  for select using (bucket_id = 'screenshots');
