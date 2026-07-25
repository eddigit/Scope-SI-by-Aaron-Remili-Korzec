create table organizations (
  id text primary key,
  name text not null check (char_length(name) between 2 and 120),
  created_at timestamptz not null default now()
);

create table schools (
  id text primary key,
  organization_id text not null references organizations(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  created_at timestamptz not null default now()
);

insert into organizations (id, name)
values ('default', 'InfoScope pilote')
on conflict (id) do nothing;

insert into schools (id, organization_id, name)
values ('default', 'default', 'Etablissement pilote')
on conflict (id) do nothing;

alter table classes
  add column organization_id text,
  add column school_id text,
  add column status text not null default 'active' check (status in ('active', 'archived'));

update classes
set organization_id = 'default',
    school_id = 'default'
where organization_id is null
   or school_id is null;

alter table classes
  alter column organization_id set not null,
  alter column school_id set not null,
  add constraint classes_organization_id_fkey foreign key (organization_id) references organizations(id) on delete restrict,
  add constraint classes_school_id_fkey foreign key (school_id) references schools(id) on delete restrict;

create index classes_organization_id_idx on classes(organization_id);
create index classes_school_id_idx on classes(school_id);

alter table users
  drop constraint users_role_check,
  add constraint users_role_check check (role in ('student', 'teacher', 'admin')),
  add column organization_id text,
  add column school_id text,
  add column last_seen_at timestamptz;

update users
set organization_id = classes.organization_id,
    school_id = classes.school_id
from classes
where users.class_code = classes.code
  and (users.organization_id is null or users.school_id is null);

alter table users
  alter column organization_id set not null,
  alter column school_id set not null,
  add constraint users_organization_id_fkey foreign key (organization_id) references organizations(id) on delete restrict,
  add constraint users_school_id_fkey foreign key (school_id) references schools(id) on delete restrict;

create index users_organization_id_idx on users(organization_id);
create index users_school_id_idx on users(school_id);

create table device_sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  session_hash text not null unique,
  user_agent_hash text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  check (expires_at > created_at)
);

create index device_sessions_user_id_idx on device_sessions(user_id);
create index device_sessions_expires_at_idx on device_sessions(expires_at);

create table teacher_invitations (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  email_hash text not null,
  role text not null check (role in ('teacher', 'admin')),
  invited_by_user_id text references users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  check (expires_at > created_at)
);

create index teacher_invitations_school_id_idx on teacher_invitations(school_id);
create index teacher_invitations_email_hash_idx on teacher_invitations(email_hash);
