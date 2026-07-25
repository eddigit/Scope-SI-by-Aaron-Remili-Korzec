create table classes (
  code text primary key,
  label text,
  created_at timestamptz not null default now()
);

create table users (
  id text primary key,
  pseudo text not null check (char_length(pseudo) between 2 and 40),
  class_code text not null references classes(code) on delete restrict,
  role text not null check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

create index users_class_code_idx on users(class_code);
create index users_role_idx on users(role);

create table progress (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  module_id text not null,
  fiches_read jsonb not null default '[]'::jsonb,
  activites_completed jsonb not null default '[]'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id),
  check (jsonb_typeof(fiches_read) = 'array'),
  check (jsonb_typeof(activites_completed) = 'array'),
  check (jsonb_typeof(scores) = 'object')
);

create index progress_user_id_idx on progress(user_id);

