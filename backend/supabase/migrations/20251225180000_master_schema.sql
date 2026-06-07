-- Add user_id to existing tables
alter table public.transactions add column if not exists user_id uuid references auth.users(id) on delete cascade;
update public.transactions set user_id = auth.uid() where user_id is null;
alter table public.transactions alter column user_id set not null;

alter table public.budgets add column if not exists user_id uuid references auth.users(id) on delete cascade;
update public.budgets set user_id = auth.uid() where user_id is null;
alter table public.budgets alter column user_id set not null;

-- Create monthly_budgets table
create table if not exists public.monthly_budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  monthly_income numeric not null default 0,
  month_year text not null, -- format: "YYYY-MM"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric not null,
  category text not null,
  billing_day integer not null check (billing_day between 1 and 31),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create accounts table
create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  account_name text not null,
  account_type text not null, -- e.g. "Savings", "Credit Card"
  last_four text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add account_id to transactions
alter table public.transactions add column if not exists account_id uuid references public.accounts(id) on delete set null;

-- Enable RLS on all tables
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.subscriptions enable row level security;
alter table public.accounts enable row level security;

-- Create policies
create policy "Users can manage their own transactions" on public.transactions
  for all using (auth.uid() = user_id);

create policy "Users can manage their own budgets" on public.budgets
  for all using (auth.uid() = user_id);

create policy "Users can manage their own monthly budgets" on public.monthly_budgets
  for all using (auth.uid() = user_id);

create policy "Users can manage their own subscriptions" on public.subscriptions
  for all using (auth.uid() = user_id);

create policy "Users can manage their own accounts" on public.accounts
  for all using (auth.uid() = user_id);
