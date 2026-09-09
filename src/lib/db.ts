import { neon } from "@neondatabase/serverless";
import { createHash } from "crypto";

export interface Novel {
  id: number;
  title: string;
  novel_name: string;
  youtube_url: string;
  thumbnail_url: string;
  playlist_url: string;
  notes: string;
  total_chapters: number;
  uploaded_chapters: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sql: any = null;

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
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS novels (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      novel_name VARCHAR(500) NOT NULL,
      youtube_url VARCHAR(1000),
      thumbnail_url VARCHAR(1000),
      playlist_url VARCHAR(1000) DEFAULT '',
      total_chapters INT NOT NULL DEFAULT 0,
      uploaded_chapters INT NOT NULL DEFAULT 0,
      status VARCHAR(50) DEFAULT 'ongoing',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // Add playlist_url column if it doesn't exist (migration)
  await sql`ALTER TABLE novels ADD COLUMN IF NOT EXISTS playlist_url VARCHAR(1000) DEFAULT ''`;
  await sql`ALTER TABLE novels ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''`;
  await sql`ALTER TABLE novels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`;

  // Ensure single admin account exists
  const check = await sql`SELECT id FROM admins WHERE username = 'admin'`;
  if (check.length === 0) {
    // Delete any old registration accounts, then create default admin
    await sql`DELETE FROM admins`;
    const hash = hashPassword("admin123");
    await sql`
      INSERT INTO admins (username, password_hash)
      VALUES ('admin', ${hash})
    `;
  }

  _initialized = true;
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "darkpaw_salt_2024").digest("hex");
}

export async function verifyAdmin(username: string, password: string) {
  await initDB();
  const sql = getSQL();
  const hash = hashPassword(password);
  const rows = await sql`
    SELECT id, username FROM admins
    WHERE username = ${username} AND password_hash = ${hash}
  `;
  return rows[0] || null;
}

export async function changeAdminPassword(userId: number, newPassword: string) {
  await initDB();
  const sql = getSQL();
  const hash = hashPassword(newPassword);
  await sql`
    UPDATE admins SET password_hash = ${hash} WHERE id = ${userId}
  `;
}

export async function getNovels(): Promise<Novel[]> {
  await initDB();
  const sql = getSQL();
  const rows = await sql`SELECT * FROM novels ORDER BY created_at DESC`;
  return rows as Novel[];
}

export async function getNovel(id: number): Promise<Novel | null> {
  await initDB();
  const sql = getSQL();
  const rows = await sql`SELECT * FROM novels WHERE id = ${id}`;
  return (rows[0] as Novel) || null;
}

export async function addNovel(
  title: string,
  novelName: string,
  youtubeUrl: string,
  thumbnailUrl: string,
  playlistUrl: string,
  notes: string,
  totalChapters: number,
  uploadedChapters: number,
  status: string
) {
  await initDB();
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO novels (title, novel_name, youtube_url, thumbnail_url, playlist_url, notes, total_chapters, uploaded_chapters, status)
    VALUES (${title}, ${novelName}, ${youtubeUrl}, ${thumbnailUrl}, ${playlistUrl}, ${notes}, ${totalChapters}, ${uploadedChapters}, ${status})
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
  playlistUrl: string,
  notes: string,
  totalChapters: number,
  uploadedChapters: number,
  status: string
) {
  await initDB();
  const sql = getSQL();
  const rows = await sql`
    UPDATE novels
    SET title = ${title}, novel_name = ${novelName}, youtube_url = ${youtubeUrl},
        thumbnail_url = ${thumbnailUrl}, playlist_url = ${playlistUrl}, notes = ${notes},
        total_chapters = ${totalChapters}, uploaded_chapters = ${uploadedChapters}, status = ${status},
        updated_at = NOW()
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

export async function getTotalStats() {
  await initDB();
  const sql = getSQL();
  const rows = await sql`
    SELECT
      COUNT(*) as novel_count,
      COALESCE(SUM(total_chapters), 0) as total_chapters,
      COALESCE(SUM(uploaded_chapters), 0) as uploaded_chapters
    FROM novels
  `;
  return rows[0];
}
