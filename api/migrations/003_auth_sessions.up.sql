alter table users
  alter column class_code drop not null,
  add constraint users_student_class_code_required check (role <> 'student' or class_code is not null);

alter table teacher_invitations
  add column token_hash text;

update teacher_invitations
set token_hash = md5('legacy:' || id)
where token_hash is null;

alter table teacher_invitations
  alter column token_hash set not null;

create unique index teacher_invitations_token_hash_idx on teacher_invitations(token_hash);

create table auth_sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  session_hash text not null unique,
  role text not null check (role in ('student', 'teacher', 'admin')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  check (expires_at > created_at)
);

create index auth_sessions_user_id_idx on auth_sessions(user_id);
create index auth_sessions_expires_at_idx on auth_sessions(expires_at);
