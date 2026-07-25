import crypto from "node:crypto";

import pg from "pg";
import { UnauthorizedError } from "./errors.js";

const { Pool } = pg;
const DEFAULT_ORGANIZATION_ID = "default";
const DEFAULT_SCHOOL_ID = "default";

export function createPoolFromEnv(env = process.env) {
  return new Pool({
    host: env.POSTGRES_HOST || "postgres",
    port: Number(env.POSTGRES_PORT || 5432),
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    max: Number(env.POSTGRES_POOL_SIZE || 5),
  });
}

export function createDb(pool) {
  return {
    async health() {
      try {
        const result = await pool.query("select count(*)::int as count from schema_migrations");
        return { ok: true, migrations: result.rows[0]?.count ?? 0 };
      } catch {
        return { ok: false, migrations: 0 };
      }
    },

    async createClass(input) {
      const organizationId = input.organizationId || DEFAULT_ORGANIZATION_ID;
      const schoolId = input.schoolId || DEFAULT_SCHOOL_ID;
      await ensureSchool(pool, { organizationId, schoolId });
      const result = await pool.query(
        `insert into classes (code, label, organization_id, school_id)
         values ($1, $2, $3, $4)
         on conflict (code) do update set
           label = excluded.label,
           organization_id = excluded.organization_id,
           school_id = excluded.school_id
         returning code, label, organization_id, school_id`,
        [input.code, input.label, organizationId, schoolId],
      );
      return mapClass(result.rows[0]);
    },

    async createUser(input) {
      const organizationId = input.organizationId || DEFAULT_ORGANIZATION_ID;
      const schoolId = input.schoolId || DEFAULT_SCHOOL_ID;
      await this.createClass({
        code: input.classCode,
        label: null,
        organizationId,
        schoolId,
      });
      const id = crypto.randomUUID();
      const result = await pool.query(
        `insert into users (id, pseudo, class_code, role, organization_id, school_id)
         values ($1, $2, $3, $4, $5, $6)
         returning id, pseudo, class_code, role, organization_id, school_id`,
        [id, input.pseudo, input.classCode, input.role, organizationId, schoolId],
      );
      return mapUser(result.rows[0]);
    },

    async createTeacherInvitation(input) {
      const id = crypto.randomUUID();
      const invitationToken = crypto.randomBytes(32).toString("base64url");
      const tokenHash = hashSecret(invitationToken);
      const emailHash = hashSecret(input.email.toLowerCase());
      const result = await pool.query(
        `insert into teacher_invitations (id, school_id, email_hash, token_hash, role, expires_at)
         values ($1, $2, $3, $4, $5, now() + ($6::int * interval '1 day'))
         returning id, school_id, role, expires_at`,
        [id, input.schoolId, emailHash, tokenHash, input.role, input.expiresInDays],
      );
      return {
        ...mapTeacherInvitation(result.rows[0]),
        invitationToken,
      };
    },

    async acceptTeacherInvitation(input) {
      const invitation = await pool.query(
        `select teacher_invitations.id,
                teacher_invitations.school_id,
                teacher_invitations.role,
                schools.organization_id
         from teacher_invitations
         join schools on schools.id = teacher_invitations.school_id
         where teacher_invitations.token_hash = $1
           and teacher_invitations.accepted_at is null
           and teacher_invitations.revoked_at is null
           and teacher_invitations.expires_at > now()`,
        [hashSecret(input.invitationToken)],
      );
      const row = invitation.rows[0];
      if (!row) throw new UnauthorizedError("invitation invalid or expired");

      const userId = crypto.randomUUID();
      const sessionId = crypto.randomUUID();
      const sessionToken = crypto.randomBytes(32).toString("base64url");
      const sessionHash = hashSecret(sessionToken);

      await pool.query("begin");
      try {
        const user = await pool.query(
          `insert into users (id, pseudo, class_code, role, organization_id, school_id)
           values ($1, $2, null, $3, $4, $5)
           returning id, pseudo, class_code, role, organization_id, school_id`,
          [userId, input.pseudo, row.role, row.organization_id, row.school_id],
        );
        const session = await pool.query(
          `insert into auth_sessions (id, user_id, session_hash, role, expires_at)
           values ($1, $2, $3, $4, now() + interval '30 days')
           returning id, expires_at`,
          [sessionId, userId, sessionHash, row.role],
        );
        await pool.query(
          `update teacher_invitations
           set accepted_at = now()
           where id = $1`,
          [row.id],
        );
        await pool.query("commit");
        return {
          user: mapUser(user.rows[0]),
          session: {
            id: session.rows[0].id,
            expiresAt: session.rows[0].expires_at,
            sessionToken,
          },
        };
      } catch (error) {
        await pool.query("rollback");
        throw error;
      }
    },

    async getUserProgress(userId) {
      const result = await pool.query(
        `select module_id, fiches_read, activites_completed, scores, updated_at
         from progress
         where user_id = $1
         order by module_id`,
        [userId],
      );
      return result.rows.map(mapProgress);
    },

    async upsertProgress(userId, input) {
      const id = crypto.randomUUID();
      const result = await pool.query(
        `insert into progress (id, user_id, module_id, fiches_read, activites_completed, scores)
         values ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb)
         on conflict (user_id, module_id) do update set
           fiches_read = excluded.fiches_read,
           activites_completed = excluded.activites_completed,
           scores = excluded.scores,
           updated_at = now()
         returning module_id, fiches_read, activites_completed, scores, updated_at`,
        [
          id,
          userId,
          input.moduleId,
          JSON.stringify(input.fichesRead),
          JSON.stringify(input.activitesCompleted),
          JSON.stringify(input.scores),
        ],
      );
      return mapProgress(result.rows[0]);
    },

    async importLocalProgress(userId, input) {
      const importedModules = [];
      const skippedModules = [];
      for (const progress of Object.values(input.modules)) {
        try {
          await this.upsertProgress(userId, progress);
          importedModules.push(progress.moduleId);
        } catch {
          skippedModules.push(progress.moduleId);
        }
      }
      return { importedModules, skippedModules };
    },

    async getClassSummary(classCode) {
      const studentCount = await pool.query(
        `select count(*)::int as count
         from users
         where class_code = $1
           and role = 'student'`,
        [classCode],
      );
      const modules = await pool.query(
        `select progress.module_id,
                count(distinct progress.user_id)::int as started_count,
                coalesce(sum(jsonb_array_length(progress.activites_completed)), 0)::int as completed_activity_count
         from progress
         join users on users.id = progress.user_id
         where users.class_code = $1
           and users.role = 'student'
         group by progress.module_id
         order by progress.module_id`,
        [classCode],
      );
      return {
        classCode,
        studentCount: studentCount.rows[0]?.count ?? 0,
        modules: modules.rows.map((row) => ({
          moduleId: row.module_id,
          startedCount: row.started_count,
          completedActivityCount: row.completed_activity_count,
        })),
      };
    },

    async getAnalyticsOverview() {
      const result = await pool.query(
        `select
           (select count(*)::int from organizations) as organizations,
           (select count(*)::int from schools) as schools,
           (select count(*)::int from classes) as classes,
           (select count(*)::int from users where role = 'student') as student_users,
           (select count(*)::int from users where role in ('teacher', 'admin')) as teacher_users,
           (select count(*)::int from progress) as progress_rows`,
      );
      const row = result.rows[0] || {};
      return {
        organizations: row.organizations ?? 0,
        schools: row.schools ?? 0,
        classes: row.classes ?? 0,
        studentUsers: row.student_users ?? 0,
        teacherUsers: row.teacher_users ?? 0,
        progressRows: row.progress_rows ?? 0,
      };
    },
  };
}

async function ensureSchool(pool, { organizationId, schoolId }) {
  await pool.query(
    `insert into organizations (id, name)
     values ($1, $2)
     on conflict (id) do nothing`,
    [organizationId, organizationId],
  );
  await pool.query(
    `insert into schools (id, organization_id, name)
     values ($1, $2, $3)
     on conflict (id) do nothing`,
    [schoolId, organizationId, schoolId],
  );
}

function mapClass(row) {
  return {
    code: row.code,
    label: row.label,
    organizationId: row.organization_id,
    schoolId: row.school_id,
  };
}

function mapUser(row) {
  return {
    id: row.id,
    pseudo: row.pseudo,
    classCode: row.class_code,
    role: row.role,
    organizationId: row.organization_id,
    schoolId: row.school_id,
  };
}

function mapTeacherInvitation(row) {
  return {
    id: row.id,
    schoolId: row.school_id,
    role: row.role,
    expiresAt: row.expires_at,
  };
}

function mapProgress(row) {
  return {
    moduleId: row.module_id,
    fichesRead: row.fiches_read,
    activitesCompleted: row.activites_completed,
    scores: row.scores,
    updatedAt: row.updated_at,
  };
}

function hashSecret(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}
