drop table if exists teacher_invitations;
drop table if exists device_sessions;

drop index if exists users_school_id_idx;
drop index if exists users_organization_id_idx;

alter table users
  drop constraint if exists users_school_id_fkey,
  drop constraint if exists users_organization_id_fkey,
  drop column if exists last_seen_at,
  drop column if exists school_id,
  drop column if exists organization_id,
  drop constraint users_role_check,
  add constraint users_role_check check (role in ('student', 'teacher'));

drop index if exists classes_school_id_idx;
drop index if exists classes_organization_id_idx;

alter table classes
  drop constraint if exists classes_school_id_fkey,
  drop constraint if exists classes_organization_id_fkey,
  drop column if exists status,
  drop column if exists school_id,
  drop column if exists organization_id;

drop table if exists schools;
drop table if exists organizations;
