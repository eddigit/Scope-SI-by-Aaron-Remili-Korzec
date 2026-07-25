import crypto from "node:crypto";

import pg from "pg";

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

function mapProgress(row) {
  return {
    moduleId: row.module_id,
    fichesRead: row.fiches_read,
    activitesCompleted: row.activites_completed,
    scores: row.scores,
    updatedAt: row.updated_at,
  };
}
