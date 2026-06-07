-- Create a table to store Plaid items (bank connections)
create table if not exists public.plaid_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  access_token text not null,
  item_id text not null,
  institution_id text,
  institution_name text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.plaid_items enable row level security;

-- Create policies
create policy "Users can view their own plaid items"
  on public.plaid_items for select
  using (auth.uid() = user_id);

create policy "Users can delete their own plaid items"
  on public.plaid_items for delete
  using (auth.uid() = user_id);

-- Note: Insertions usually happen via Edge Functions (server-side) to ensure security of access_token,
-- but we allow it here if the flow is different, though highly recommended to use service_role only for inserts.
-- For now, we restrict inserts to service_role (Edge Functions) mostly, but if we strictly follow the user request "setup the Link Bank Account button",
-- the exchange usually happens on backend.
