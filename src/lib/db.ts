import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";

export interface Novel {
  id: number;
  title: string;
  novel_name: string;
  youtube_url: string;
  thumbnail_url: string;
  total_chapters: number;
  uploaded_chapters: number;
  status: string;
}

let _sql: NeonQueryFunction<false> | null = null;

function getSQL() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql;
}

let _initialized = false;

async function initDB() {
  if (_initialized) return;
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS novels (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      novel_name VARCHAR(500) NOT NULL,
      youtube_url VARCHAR(1000),
      thumbnail_url VARCHAR(1000),
      total_chapters INT NOT NULL DEFAULT 0,
      uploaded_chapters INT NOT NULL DEFAULT 0,
      status VARCHAR(50) DEFAULT 'ongoing',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  _initialized = true;
}

export async function getNovels(): Promise<Novel[]> {
  await initDB();
  const sql = getSQL();
  const rows = await sql`SELECT * FROM novels ORDER BY created_at DESC`;
  return rows as Novel[];
}

export async function addNovel(
  title: string,
  novelName: string,
  youtubeUrl: string,
  thumbnailUrl: string,
  totalChapters: number,
  uploadedChapters: number,
  status: string
) {
  await initDB();
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO novels (title, novel_name, youtube_url, thumbnail_url, total_chapters, uploaded_chapters, status)
    VALUES (${title}, ${novelName}, ${youtubeUrl}, ${thumbnailUrl}, ${totalChapters}, ${uploadedChapters}, ${status})
    RETURNING *
  `;
  return rows[0];
}

export async function updateNovel(
  id: number,
  title: string,
  novelName: string,
  youtubeUrl: string,
  thumbnailUrl: string,
  totalChapters: number,
  uploadedChapters: number,
  status: string
) {
  await initDB();
  const sql = getSQL();
  const rows = await sql`
    UPDATE novels
    SET title = ${title}, novel_name = ${novelName}, youtube_url = ${youtubeUrl},
        thumbnail_url = ${thumbnailUrl}, total_chapters = ${totalChapters},
        uploaded_chapters = ${uploadedChapters}, status = ${status}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteNovel(id: number) {
  await initDB();
  const sql = getSQL();
  await sql`DELETE FROM novels WHERE id = ${id}`;
}
