-- ============================================================
-- NanoAI Database Schema (Supabase / PostgreSQL)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  avatar_url text,
  encrypted_minimax_key text -- Stored safely after backend GCM encryption
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Users can update and read own profile"
  on public.profiles
  for all
  using (auth.uid() = id);

-- 2. Spaces Table (Custom Workspaces)
create table if not exists public.spaces (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  user_id uuid references auth.users on delete cascade not null,
  icon text default 'Folder'
);

alter table public.spaces enable row level security;

create policy "Users can manage own spaces"
  on public.spaces
  for all
  using (auth.uid() = user_id);

-- 3. Chats Table
create table if not exists public.chats (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null default 'New Conversation',
  user_id uuid references auth.users on delete cascade not null,
  space_id uuid references public.spaces on delete set null,
  preset_type text not null default 'chat'
);

alter table public.chats enable row level security;

create policy "Users can manage own chats"
  on public.chats
  for all
  using (auth.uid() = user_id);

-- 4. Messages Table (Saves full reasoning paths)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  chat_id uuid references public.chats on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  -- Using JSONB to support mixed content types: text paragraphs, thinking blocks, or image/video nodes
  content jsonb not null
);

alter table public.messages enable row level security;

create policy "Users can read/write messages in own chats"
  on public.messages
  for all
  using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id and chats.user_id = auth.uid()
    )
  );

-- ============================================================
-- Auto-create profile on signup trigger
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();