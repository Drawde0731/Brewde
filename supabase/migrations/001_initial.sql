-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- TENANTS
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  primary_color text not null default '#6F4E37',
  secondary_color text not null default '#A67C52',
  accent_color text not null default '#D9A441',
  auto_detect_colors boolean not null default true,
  owner_user_id uuid,
  created_at timestamptz not null default now()
);

-- USERS
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin','owner','cashier')),
  status text not null default 'pending' check (status in ('pending','active','rejected')),
  tenant_id uuid references tenants(id) on delete set null,
  force_password_change boolean not null default false,
  created_at timestamptz not null default now()
);

-- Add foreign key for tenant owner after users table exists
alter table tenants add constraint fk_owner foreign key (owner_user_id) references users(id) on delete set null;

-- PRODUCTS
create table products (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  image_url text,
  category text not null check (category in ('coffee','food','drink')),
  created_at timestamptz not null default now()
);

-- ORDERS
create table orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  subtotal numeric(10,2) not null,
  discount_type text not null default 'none' check (discount_type in ('none','pwd','senior')),
  discount_rate numeric(5,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_method text not null default 'cash' check (payment_method in ('cash','gcash','maya','online_bank','card')),
  created_at timestamptz not null default now()
);

-- ORDER ITEMS
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_name text not null,
  price numeric(10,2) not null,
  qty integer not null
);

-- SIGNUP REQUESTS
create table signup_requests (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  cafe_name text not null,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- INDEXES
create index idx_products_tenant on products(tenant_id);
create index idx_orders_tenant on orders(tenant_id);
create index idx_orders_created on orders(tenant_id, created_at desc);
create index idx_order_items_order on order_items(order_id);
create index idx_users_email on users(email);
create index idx_users_tenant on users(tenant_id);

-- ROW LEVEL SECURITY
alter table tenants enable row level security;
alter table users enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table signup_requests enable row level security;

-- Service role bypasses RLS (used server-side)
-- RLS policies for client-side safety (all real queries run server-side with service role)
create policy "service_role_all" on tenants for all using (true);
create policy "service_role_all" on users for all using (true);
create policy "service_role_all" on products for all using (true);
create policy "service_role_all" on orders for all using (true);
create policy "service_role_all" on order_items for all using (true);
create policy "service_role_all" on signup_requests for all using (true);

-- STORAGE BUCKET for images
insert into storage.buckets (id, name, public) values ('cafe-assets', 'cafe-assets', true) on conflict do nothing;
