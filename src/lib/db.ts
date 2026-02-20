import { sql } from "@vercel/postgres";

export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pseudo VARCHAR(50) NOT NULL,
      class_code VARCHAR(20) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS module_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      module_id VARCHAR(50) NOT NULL,
      fiches_read TEXT[] DEFAULT '{}',
      activites_completed TEXT[] DEFAULT '{}',
      scores JSONB DEFAULT '{}',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(student_id, module_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS student_badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      badge_id VARCHAR(50) NOT NULL,
      earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(student_id, badge_id)
    )
  `;
}

// Create a student and return their ID
export async function createStudent(pseudo: string, classCode: string): Promise<string> {
  const result = await sql`
    INSERT INTO students (pseudo, class_code)
    VALUES (${pseudo}, ${classCode})
    RETURNING id
  `;
  return result.rows[0].id;
}

// Find a student by ID
export async function getStudent(studentId: string) {
  const result = await sql`
    SELECT id, pseudo, class_code, created_at FROM students WHERE id = ${studentId}
  `;
  return result.rows[0] || null;
}

// Get full progress for a student
export async function getStudentProgress(studentId: string) {
  const modules = await sql`
    SELECT module_id, fiches_read, activites_completed, scores
    FROM module_progress WHERE student_id = ${studentId}
  `;

  const badges = await sql`
    SELECT badge_id, earned_at FROM student_badges WHERE student_id = ${studentId}
  `;

  const modulesMap: Record<string, {
    fichesRead: string[];
    activitesCompleted: string[];
    scores: Record<string, number>;
  }> = {};

  for (const row of modules.rows) {
    modulesMap[row.module_id] = {
      fichesRead: row.fiches_read || [],
      activitesCompleted: row.activites_completed || [],
      scores: row.scores || {},
    };
  }

  return {
    modules: modulesMap,
    badges: badges.rows.map((r) => r.badge_id),
  };
}

// Mark a fiche as read
export async function markFicheReadDB(studentId: string, moduleId: string, ficheId: string) {
  await sql`
    INSERT INTO module_progress (student_id, module_id, fiches_read, updated_at)
    VALUES (${studentId}, ${moduleId}, ARRAY[${ficheId}]::text[], NOW())
    ON CONFLICT (student_id, module_id)
    DO UPDATE SET
      fiches_read = CASE
        WHEN ${ficheId} = ANY(module_progress.fiches_read) THEN module_progress.fiches_read
        ELSE array_append(module_progress.fiches_read, ${ficheId})
      END,
      updated_at = NOW()
  `;
}

// Mark an activity as completed
export async function markActiviteCompletedDB(
  studentId: string,
  moduleId: string,
  activiteId: string,
  score: number
) {
  await sql`
    INSERT INTO module_progress (student_id, module_id, activites_completed, scores, updated_at)
    VALUES (${studentId}, ${moduleId}, ARRAY[${activiteId}]::text[], ${JSON.stringify({ [activiteId]: score })}::jsonb, NOW())
    ON CONFLICT (student_id, module_id)
    DO UPDATE SET
      activites_completed = CASE
        WHEN ${activiteId} = ANY(module_progress.activites_completed) THEN module_progress.activites_completed
        ELSE array_append(module_progress.activites_completed, ${activiteId})
      END,
      scores = module_progress.scores || ${JSON.stringify({ [activiteId]: score })}::jsonb,
      updated_at = NOW()
  `;
}

// Add a badge
export async function addBadgeDB(studentId: string, badgeId: string) {
  await sql`
    INSERT INTO student_badges (student_id, badge_id)
    VALUES (${studentId}, ${badgeId})
    ON CONFLICT (student_id, badge_id) DO NOTHING
  `;
}

// Get all students in a class (teacher view)
export async function getClassStudents(classCode: string) {
  const students = await sql`
    SELECT s.id, s.pseudo, s.created_at,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'module_id', mp.module_id,
          'fiches_read', mp.fiches_read,
          'activites_completed', mp.activites_completed,
          'scores', mp.scores
        )) FROM module_progress mp WHERE mp.student_id = s.id),
        '[]'::json
      ) as modules,
      COALESCE(
        (SELECT json_agg(sb.badge_id) FROM student_badges sb WHERE sb.student_id = s.id),
        '[]'::json
      ) as badges
    FROM students s
    WHERE s.class_code = ${classCode}
    ORDER BY s.pseudo
  `;
  return students.rows;
}
