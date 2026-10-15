-- =====================================================================
-- MELISSA EDU 스키마 (v2)
-- Supabase 대시보드 → SQL Editor에서 이 파일 전체를 실행하세요.
-- 처음 실행해도, 이전 버전(v1)을 이미 실행했어도 안전하도록 작성되어 있습니다.
-- 실행 후 seed.sql을 실행하면 출시 예정 교재 목록이 등록됩니다.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 교재(상품)
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title           text not null,
  summary         text not null default '',
  description     text not null default '',
  subject         text not null default 'common',
  grades          text[] not null default '{}',
  type            text not null default 'concept',
  price           integer check (price is null or price >= 0),
  page_count      integer,
  toc             text[] not null default '{}',
  targets         text[] not null default '{}',
  includes        text[] not null default '{}',
  sample_images   text[] not null default '{}',
  thumbnail_url   text,
  file_path       text,
  is_featured     boolean not null default false,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- v2에서 추가된 컬럼
alter table public.products add column if not exists sku             text;
alter table public.products add column if not exists series          text;
alter table public.products add column if not exists track           text not null default 'csat';
alter table public.products add column if not exists area            text;
alter table public.products add column if not exists course          text;
alter table public.products add column if not exists kind            text;
alter table public.products add column if not exists difficulty      text;
alter table public.products add column if not exists curriculum      text;
alter table public.products add column if not exists exam_year       integer;
alter table public.products add column if not exists question_count  integer;
alter table public.products add column if not exists sale_price      integer;
alter table public.products add column if not exists goals           text[] not null default '{}';
alter table public.products add column if not exists keywords        text[] not null default '{}';
alter table public.products add column if not exists cover_url       text;
alter table public.products add column if not exists preview_pdf_url text;
alter table public.products add column if not exists answer_path     text;
alter table public.products add column if not exists answer_mode     text not null default 'none';
alter table public.products add column if not exists edition         text;
alter table public.products add column if not exists revision_notes  text[] not null default '{}';
alter table public.products add column if not exists release_date    date;
alter table public.products add column if not exists status          text not null default 'coming_soon';
alter table public.products add column if not exists featured_rank   integer;
alter table public.products add column if not exists seo_title       text;
alter table public.products add column if not exists seo_description text;

-- v1 → v2 값 이전 (이미 v2 값이면 아무 일도 하지 않습니다)
update public.products set area = case subject when 'inquiry' then 'science' else subject end where area is null;
update public.products set kind = case type when 'guide' then 'concept' when 'self-study' then 'material' else type end where kind is null;
update public.products set cover_url = thumbnail_url where cover_url is null and thumbnail_url is not null;
update public.products set status = case when is_published and file_path is not null then 'on_sale' else 'coming_soon' end
  where status = 'coming_soon' and is_published;
update public.products set area = 'common' where area is null;
update public.products set kind = 'concept' where kind is null;

alter table public.products alter column area set not null;
alter table public.products alter column kind set not null;
alter table public.products alter column area set default 'common';
alter table public.products alter column kind set default 'concept';

-- 구매·정답 파일 유무는 경로를 노출하지 않고 불리언으로만 공개합니다.
alter table public.products drop column if exists has_file;
alter table public.products drop column if exists has_answer_file;
alter table public.products add column has_file boolean generated always as (file_path is not null) stored;
alter table public.products add column has_answer_file boolean generated always as (answer_path is not null) stored;

alter table public.products drop constraint if exists products_subject_check;
alter table public.products drop constraint if exists products_type_check;
alter table public.products drop constraint if exists products_track_check;
alter table public.products drop constraint if exists products_area_check;
alter table public.products drop constraint if exists products_kind_check;
alter table public.products drop constraint if exists products_difficulty_check;
alter table public.products drop constraint if exists products_curriculum_check;
alter table public.products drop constraint if exists products_status_check;
alter table public.products drop constraint if exists products_answer_mode_check;
alter table public.products add constraint products_track_check check (track in ('csat','school','common'));
alter table public.products add constraint products_area_check check (area in ('korean','math','english','social','science','common'));
alter table public.products add constraint products_kind_check check (kind in ('concept','past-exam','variant','mock','material'));
alter table public.products add constraint products_difficulty_check check (difficulty is null or difficulty in ('basic','standard','advanced'));
alter table public.products add constraint products_curriculum_check check (curriculum is null or curriculum in ('2015','2022'));
alter table public.products add constraint products_status_check check (status in ('on_sale','coming_soon','sold_out','discontinued'));
alter table public.products add constraint products_answer_mode_check check (answer_mode in ('separate','inline','none'));
-- 판매 중인 교재에는 가격과 구매 파일이 반드시 있어야 합니다.
alter table public.products drop constraint if exists products_on_sale_ready;
-- 상담 판매 전환: 판매 중은 가격만 있으면 됩니다(PDF 파일 연결 불필요).
alter table public.products add constraint products_on_sale_ready check (status <> 'on_sale' or price is not null);

-- 납품 형태(custom = 주문 제작 상담 가능 / ready = PDF 완성본)와 취약 유형 태그(추천 연결)
alter table public.products add column if not exists delivery_type text not null default 'custom';
alter table public.products drop constraint if exists products_delivery_type_check;
alter table public.products add constraint products_delivery_type_check check (delivery_type in ('custom','ready'));
alter table public.products add column if not exists weak_tags text[] not null default '{}';

alter table public.products drop constraint if exists products_sale_below_price;
alter table public.products add constraint products_sale_below_price check (sale_price is null or (price is not null and sale_price < price));

create unique index if not exists products_sku_key on public.products (sku) where sku is not null;
create index if not exists products_status_idx on public.products (status, updated_at desc);
create index if not exists products_track_area_idx on public.products (track, area);
create index if not exists products_grades_idx on public.products using gin (grades);
drop index if exists products_published_idx;

-- ---------------------------------------------------------------------
-- 패키지(묶음 판매)
-- ---------------------------------------------------------------------
create table if not exists public.bundles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title           text not null,
  summary         text not null default '',
  description     text not null default '',
  track           text check (track is null or track in ('csat','school','common')),
  price           integer check (price is null or price >= 0),
  status          text not null default 'coming_soon' check (status in ('on_sale','coming_soon','sold_out','discontinued')),
  release_date    date,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.bundle_items (
  bundle_id  uuid not null references public.bundles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  position   integer not null default 0,
  primary key (bundle_id, product_id)
);

-- ---------------------------------------------------------------------
-- 주문 (한 주문 = 여러 교재). v1의 단일 상품 주문도 order_items로 이전합니다.
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null unique,
  user_id       uuid not null references auth.users (id) on delete cascade,
  product_id    uuid references public.products (id),
  product_title text not null,
  amount        integer not null check (amount >= 0),
  status        text not null default 'pending'
                check (status in ('pending','paid','canceled','refunded','failed')),
  payment_key   text unique,
  method        text,
  receipt_url   text,
  approved_at   timestamptz,
  created_at    timestamptz not null default now()
);
alter table public.orders alter column product_id drop not null;
alter table public.orders add column if not exists bundle_id uuid references public.bundles (id);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id            bigserial primary key,
  order_uuid    uuid not null references public.orders (id) on delete cascade,
  product_id    uuid not null references public.products (id),
  product_title text not null,
  unit_price    integer not null check (unit_price >= 0),
  unique (order_uuid, product_id)
);
create index if not exists order_items_order_idx on public.order_items (order_uuid);
create index if not exists order_items_product_idx on public.order_items (product_id);

insert into public.order_items (order_uuid, product_id, product_title, unit_price)
select o.id, o.product_id, o.product_title, o.amount from public.orders o
where o.product_id is not null
  and not exists (select 1 from public.order_items i where i.order_uuid = o.id);

-- ---------------------------------------------------------------------
-- 다운로드 기록 (교재별 횟수 제한, 청약철회 가능 여부 판단)
-- ---------------------------------------------------------------------
create table if not exists public.downloads (
  id          bigserial primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
alter table public.downloads add column if not exists product_id uuid references public.products (id);
alter table public.downloads add column if not exists kind text not null default 'main';
update public.downloads d set product_id = o.product_id from public.orders o where d.order_id = o.id and d.product_id is null;
create index if not exists downloads_order_idx on public.downloads (order_id);

-- ---------------------------------------------------------------------
-- 무료 학습 도구 기록, AI 하루 사용량
-- ---------------------------------------------------------------------
create table if not exists public.study_progress (
  user_id    uuid not null references auth.users (id) on delete cascade,
  key        text not null check (char_length(key) <= 64),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  count   integer not null default 0,
  primary key (user_id, day)
);

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
drop trigger if exists bundles_touch on public.bundles;
create trigger bundles_touch before update on public.bundles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- RLS: 쓰기는 모두 서버(service_role)에서만. 클라이언트는 공개 정보만 읽기.
-- ---------------------------------------------------------------------
alter table public.products       enable row level security;
alter table public.bundles        enable row level security;
alter table public.bundle_items   enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.downloads      enable row level security;
alter table public.study_progress enable row level security;
alter table public.ai_usage       enable row level security;

drop policy if exists "공개 상품 조회" on public.products;
drop policy if exists "공개 교재 조회" on public.products;
create policy "공개 교재 조회" on public.products for select using (status <> 'discontinued' or is_published);

drop policy if exists "공개 패키지 조회" on public.bundles;
create policy "공개 패키지 조회" on public.bundles for select using (status <> 'discontinued');
drop policy if exists "공개 패키지 구성 조회" on public.bundle_items;
create policy "공개 패키지 구성 조회" on public.bundle_items for select using (true);

drop policy if exists "본인 주문 조회" on public.orders;
create policy "본인 주문 조회" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "본인 주문 항목 조회" on public.order_items;
create policy "본인 주문 항목 조회" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_uuid and o.user_id = auth.uid()));
drop policy if exists "본인 다운로드 기록 조회" on public.downloads;
create policy "본인 다운로드 기록 조회" on public.downloads for select using (auth.uid() = user_id);

drop policy if exists "본인 학습 기록 조회" on public.study_progress;
create policy "본인 학습 기록 조회" on public.study_progress for select using (auth.uid() = user_id);
drop policy if exists "본인 학습 기록 생성" on public.study_progress;
create policy "본인 학습 기록 생성" on public.study_progress for insert with check (auth.uid() = user_id);
drop policy if exists "본인 학습 기록 수정" on public.study_progress;
create policy "본인 학습 기록 수정" on public.study_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 파일 경로(file_path, answer_path)는 anon/authenticated 역할에 노출하지 않습니다.
revoke select on public.products from anon, authenticated;
grant select (id, sku, slug, title, series, summary, description, track, area, course, grades, kind, difficulty,
              curriculum, exam_year, page_count, question_count, price, sale_price, cover_url, toc, goals, targets,
              includes, preview_pdf_url, sample_images, answer_mode, has_file, delivery_type, weak_tags, has_answer_file, edition,
              revision_notes, release_date, status, featured_rank, seo_title, seo_description, keywords,
              created_at, updated_at, is_published)
  on public.products to anon, authenticated;

-- ---------------------------------------------------------------------
-- Storage 버킷
-- product-files : 비공개 (구매용 PDF·정답 PDF, 서명 URL로만 접근)
-- product-assets: 공개   (표지, 샘플 이미지, 워터마크가 들어간 미리보기 PDF)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-files', 'product-files', false, 104857600, array['application/pdf'])
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-assets', 'product-assets', true, 31457280, array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do update set public = true, allowed_mime_types = excluded.allowed_mime_types, file_size_limit = excluded.file_size_limit;
