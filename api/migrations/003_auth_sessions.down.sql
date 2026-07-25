drop table if exists auth_sessions;

drop index if exists teacher_invitations_token_hash_idx;

alter table teacher_invitations
  drop column if exists token_hash;

delete from users
where role in ('teacher', 'admin')
  and class_code is null;

alter table users
  drop constraint if exists users_student_class_code_required,
  alter column class_code set not null;
