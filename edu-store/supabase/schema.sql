-- =====================================================================
-- 멜리사 에듀 PDF 스토어 스키마
-- Supabase 대시보드 → SQL Editor에서 이 파일 전체를 실행한 뒤 seed.sql을 실행하세요.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 상품
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title           text not null,
  summary         text not null,
  description     text not null default '',
  subject         text not null check (subject in ('korean','math','english','inquiry','common')),
  grades          text[] not null default '{}',
  type            text not null check (type in ('past-exam','variant','guide','self-study')),
  price           integer not null check (price >= 0),
  page_count      integer not null default 0,
  toc             text[] not null default '{}',
  targets         text[] not null default '{}',
  includes        text[] not null default '{}',
  sample_excerpt  text[] not null default '{}',
  thumbnail_url   text,
  sample_images   text[] not null default '{}',
  -- 비공개 버킷(product-files) 안의 경로. 클라이언트에 노출하지 않습니다.
  file_path       text,
  is_featured     boolean not null default false,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists products_published_idx on public.products (is_published, updated_at desc);
create index if not exists products_grades_idx on public.products using gin (grades);

-- ---------------------------------------------------------------------
-- 주문 (한 주문 = 한 상품)
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null unique,             -- 토스페이먼츠에 전달하는 주문번호
  user_id       uuid not null references auth.users (id) on delete cascade,
  product_id    uuid not null references public.products (id),
  product_title text not null,                    -- 주문 당시 상품명 (상품 수정과 무관하게 보존)
  amount        integer not null check (amount >= 0),
  status        text not null default 'pending'
                check (status in ('pending','paid','canceled','refunded','failed')),
  payment_key   text unique,
  method        text,
  receipt_url   text,
  approved_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 다운로드 기록 (횟수 제한, 청약철회 가능 여부 판단에 사용)
-- ---------------------------------------------------------------------
create table if not exists public.downloads (
  id          bigserial primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists downloads_order_idx on public.downloads (order_id);

-- ---------------------------------------------------------------------
-- updated_at 자동 갱신
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- RLS: 쓰기는 모두 서버(service_role)에서만. 클라이언트는 읽기만.
-- ---------------------------------------------------------------------
alter table public.products  enable row level security;
alter table public.orders    enable row level security;
alter table public.downloads enable row level security;

drop policy if exists "공개 상품 조회" on public.products;
create policy "공개 상품 조회" on public.products
  for select using (is_published = true);

drop policy if exists "본인 주문 조회" on public.orders;
create policy "본인 주문 조회" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "본인 다운로드 기록 조회" on public.downloads;
create policy "본인 다운로드 기록 조회" on public.downloads
  for select using (auth.uid() = user_id);

-- file_path 컬럼은 anon/authenticated 역할에 노출하지 않습니다.
revoke select on public.products from anon, authenticated;
grant select (id, slug, title, summary, description, subject, grades, type, price, page_count,
              toc, targets, includes, sample_excerpt, thumbnail_url, sample_images,
              is_featured, is_published, updated_at)
  on public.products to anon, authenticated;

-- ---------------------------------------------------------------------
-- Storage 버킷
-- product-files : 비공개 (PDF 원본, 서명 URL로만 접근)
-- product-assets: 공개   (썸네일, 워터마크 샘플 이미지)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-files', 'product-files', false, 104857600, array['application/pdf'])
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-assets', 'product-assets', true, 10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true;

-- storage.objects에는 별도 정책을 만들지 않습니다.
-- → 비공개 버킷의 파일은 service_role로 발급한 서명 URL로만 내려받을 수 있습니다.

-- ---------------------------------------------------------------------
-- 무료 학습 도구 기록 (영단어 챌린지, 속독, 66일 습관, 순공 시간, 오답노트)
-- 로그인한 사용자는 브라우저 기록이 이 테이블과 동기화됩니다.
-- 이미 위 내용을 실행했다면 이 블록만 실행해도 됩니다. (전체 재실행도 안전합니다)
-- ---------------------------------------------------------------------
create table if not exists public.study_progress (
  user_id    uuid not null references auth.users (id) on delete cascade,
  key        text not null check (char_length(key) <= 64),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.study_progress enable row level security;

drop policy if exists "본인 학습 기록 조회" on public.study_progress;
create policy "본인 학습 기록 조회" on public.study_progress
  for select using (auth.uid() = user_id);
drop policy if exists "본인 학습 기록 생성" on public.study_progress;
create policy "본인 학습 기록 생성" on public.study_progress
  for insert with check (auth.uid() = user_id);
drop policy if exists "본인 학습 기록 수정" on public.study_progress;
create policy "본인 학습 기록 수정" on public.study_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- AI 지문 분석 하루 사용량 (서버에서 service_role로만 읽고 씀)
-- ---------------------------------------------------------------------
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  count   integer not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;
