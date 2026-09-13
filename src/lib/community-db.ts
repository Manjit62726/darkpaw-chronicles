import { neon } from "@neondatabase/serverless";
import { createHash } from "crypto";

export interface CommunityUser {
  id: number;
  username: string;
  profile_image: string;
  created_at: string;
}

export interface NovelVote {
  id: number;
  user_id: number;
  novel_id: number;
  vote_type: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  username: string;
  profile_image: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  user_vote?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  profile_image: string;
  content: string;
  parent_comment_id: number | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  user_vote?: string;
  replies?: Comment[];
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

export async function initCommunityDB() {
  if (_initialized) return;
  const sql = getSQL();

  await sql`
    CREATE TABLE IF NOT EXISTS community_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(500) NOT NULL,
      profile_image TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS novel_votes (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
      novel_id INT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
      vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, novel_id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      upvotes INT DEFAULT 0,
      downvotes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      parent_comment_id INT REFERENCES comments(id) ON DELETE CASCADE,
      upvotes INT DEFAULT 0,
      downvotes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS post_votes (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
      post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, post_id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comment_votes (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
      comment_id INT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, comment_id)
    );
  `;

  _initialized = true;
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "darkpaw_community_salt_2024").digest("hex");
}

export async function registerCommunityUser(username: string, password: string) {
  await initCommunityDB();
  const sql = getSQL();

  if (!username || username.length < 2 || username.length > 30) {
    throw new Error("Username must be 2-30 characters");
  }
  if (!password || password.length < 4) {
    throw new Error("Password must be at least 4 characters");
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error("Username can only contain letters, numbers, and underscores");
  }

  const existing = await sql`SELECT id FROM community_users WHERE username = ${username}`;
  if (existing.length > 0) {
    throw new Error("Username already taken");
  }

  const hash = hashPassword(password);
  const rows = await sql`
    INSERT INTO community_users (username, password_hash)
    VALUES (${username}, ${hash})
    RETURNING id, username, profile_image, created_at
  `;
  return rows[0] as CommunityUser;
}

export async function verifyCommunityUser(username: string, password: string) {
  await initCommunityDB();
  const sql = getSQL();
  const hash = hashPassword(password);
  const rows = await sql`
    SELECT id, username, profile_image, created_at FROM community_users
    WHERE username = ${username} AND password_hash = ${hash}
  `;
  return (rows[0] as CommunityUser) || null;
}

export async function getCommunityUser(userId: number) {
  await initCommunityDB();
  const sql = getSQL();
  const rows = await sql`
    SELECT id, username, profile_image, created_at FROM community_users WHERE id = ${userId}
  `;
  return (rows[0] as CommunityUser) || null;
}

export async function updateProfileImage(userId: number, base64Image: string) {
  await initCommunityDB();
  const sql = getSQL();
  await sql`
    UPDATE community_users SET profile_image = ${base64Image} WHERE id = ${userId}
  `;
}

export async function getEligibleNovelsForVoting() {
  await initCommunityDB();
  const sql = getSQL();
  const rows = await sql`
    SELECT n.*,
      COALESCE(v.upvotes, 0) as vote_upvotes,
      COALESCE(v.downvotes, 0) as vote_downvotes
    FROM novels n
    LEFT JOIN (
      SELECT novel_id,
        COUNT(*) FILTER (WHERE vote_type = 'up') as upvotes,
        COUNT(*) FILTER (WHERE vote_type = 'down') as downvotes
      FROM novel_votes
      GROUP BY novel_id
    ) v ON n.id = v.novel_id
    WHERE (n.total_chapters - n.uploaded_chapters) >= 60
    ORDER BY (COALESCE(v.upvotes, 0) - COALESCE(v.downvotes, 0)) DESC
  `;
  return rows;
}

export async function voteOnNovel(userId: number, novelId: number, voteType: string) {
  await initCommunityDB();
  const sql = getSQL();

  const existing = await sql`
    SELECT id, vote_type FROM novel_votes WHERE user_id = ${userId} AND novel_id = ${novelId}
  `;

  if (existing.length > 0) {
    if (existing[0].vote_type === voteType) {
      await sql`DELETE FROM novel_votes WHERE id = ${existing[0].id}`;
      return null;
    } else {
      await sql`UPDATE novel_votes SET vote_type = ${voteType} WHERE id = ${existing[0].id}`;
      return voteType;
    }
  } else {
    await sql`INSERT INTO novel_votes (user_id, novel_id, vote_type) VALUES (${userId}, ${novelId}, ${voteType})`;
    return voteType;
  }
}

export async function getUserNovelVotes(userId: number) {
  await initCommunityDB();
  const sql = getSQL();
  const rows = await sql`SELECT novel_id, vote_type FROM novel_votes WHERE user_id = ${userId}`;
  return rows as { novel_id: number; vote_type: string }[];
}

export async function createPost(userId: number, title: string, content: string) {
  await initCommunityDB();
  const sql = getSQL();
  if (!title || title.length < 3) throw new Error("Title must be at least 3 characters");
  if (!content || content.length < 1) throw new Error("Content cannot be empty");

  const rows = await sql`
    INSERT INTO posts (user_id, title, content)
    VALUES (${userId}, ${title}, ${content})
    RETURNING *
  `;
  return rows[0];
}

export async function getPosts(userId?: number) {
  await initCommunityDB();
  const sql = getSQL();

  const rows = await sql`
    SELECT p.*,
      cu.username, cu.profile_image,
      COALESCE(pc.comment_count, 0) as comment_count,
      COALESCE(pv.user_vote, '') as user_vote
    FROM posts p
    JOIN community_users cu ON p.user_id = cu.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as comment_count FROM comments GROUP BY post_id
    ) pc ON p.id = pc.post_id
    LEFT JOIN (
      SELECT post_id, vote_type as user_vote FROM post_votes
      WHERE user_id = ${userId || 0}
    ) pv ON p.id = pv.post_id
    ORDER BY p.created_at DESC
  `;
  return rows as Post[];
}

export async function getPost(postId: number, userId?: number) {
  await initCommunityDB();
  const sql = getSQL();

  const rows = await sql`
    SELECT p.*,
      cu.username, cu.profile_image,
      COALESCE(pv.user_vote, '') as user_vote
    FROM posts p
    JOIN community_users cu ON p.user_id = cu.id
    LEFT JOIN (
      SELECT post_id, vote_type as user_vote FROM post_votes
      WHERE user_id = ${userId || 0}
    ) pv ON p.id = pv.post_id
    WHERE p.id = ${postId}
  `;
  return (rows[0] as Post) || null;
}

export async function getPostComments(postId: number, userId?: number) {
  await initCommunityDB();
  const sql = getSQL();

  const rows = await sql`
    SELECT c.*,
      cu.username, cu.profile_image,
      COALESCE(cv.user_vote, '') as user_vote
    FROM comments c
    JOIN community_users cu ON c.user_id = cu.id
    LEFT JOIN (
      SELECT comment_id, vote_type as user_vote FROM comment_votes
      WHERE user_id = ${userId || 0}
    ) cv ON c.id = cv.comment_id
    WHERE c.post_id = ${postId}
    ORDER BY c.created_at ASC
  `;
  return rows as Comment[];
}

export async function createComment(postId: number, userId: number, content: string, parentCommentId?: number) {
  await initCommunityDB();
  const sql = getSQL();
  if (!content || content.length < 1) throw new Error("Comment cannot be empty");

  const rows = await sql`
    INSERT INTO comments (post_id, user_id, content, parent_comment_id)
    VALUES (${postId}, ${userId}, ${content}, ${parentCommentId || null})
    RETURNING *
  `;
  return rows[0];
}

export async function deletePost(postId: number, userId: number) {
  await initCommunityDB();
  const sql = getSQL();
  const result = await sql`DELETE FROM posts WHERE id = ${postId} AND user_id = ${userId}`;
  return result.count > 0;
}

export async function deleteComment(commentId: number, userId: number) {
  await initCommunityDB();
  const sql = getSQL();
  const result = await sql`DELETE FROM comments WHERE id = ${commentId} AND user_id = ${userId}`;
  return result.count > 0;
}

export async function voteOnPost(userId: number, postId: number, voteType: string) {
  await initCommunityDB();
  const sql = getSQL();

  const existing = await sql`
    SELECT id, vote_type FROM post_votes WHERE user_id = ${userId} AND post_id = ${postId}
  `;

  if (existing.length > 0) {
    if (existing[0].vote_type === voteType) {
      await sql`DELETE FROM post_votes WHERE id = ${existing[0].id}`;
      await sql`UPDATE posts SET ${voteType === 'up' ? sql`upvotes = upvotes - 1` : sql`downvotes = downvotes - 1`} WHERE id = ${postId}`;
      return null;
    } else {
      await sql`UPDATE post_votes SET vote_type = ${voteType} WHERE id = ${existing[0].id}`;
      if (voteType === 'up') {
        await sql`UPDATE posts SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = ${postId}`;
      } else {
        await sql`UPDATE posts SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = ${postId}`;
      }
      return voteType;
    }
  } else {
    await sql`INSERT INTO post_votes (user_id, post_id, vote_type) VALUES (${userId}, ${postId}, ${voteType})`;
    if (voteType === 'up') {
      await sql`UPDATE posts SET upvotes = upvotes + 1 WHERE id = ${postId}`;
    } else {
      await sql`UPDATE posts SET downvotes = downvotes + 1 WHERE id = ${postId}`;
    }
    return voteType;
  }
}

export async function voteOnComment(userId: number, commentId: number, voteType: string) {
  await initCommunityDB();
  const sql = getSQL();

  const existing = await sql`
    SELECT id, vote_type FROM comment_votes WHERE user_id = ${userId} AND comment_id = ${commentId}
  `;

  if (existing.length > 0) {
    if (existing[0].vote_type === voteType) {
      await sql`DELETE FROM comment_votes WHERE id = ${existing[0].id}`;
      await sql`UPDATE comments SET ${voteType === 'up' ? sql`upvotes = upvotes - 1` : sql`downvotes = downvotes - 1`} WHERE id = ${commentId}`;
      return null;
    } else {
      await sql`UPDATE comment_votes SET vote_type = ${voteType} WHERE id = ${existing[0].id}`;
      if (voteType === 'up') {
        await sql`UPDATE comments SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = ${commentId}`;
      } else {
        await sql`UPDATE comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = ${commentId}`;
      }
      return voteType;
    }
  } else {
    await sql`INSERT INTO comment_votes (user_id, comment_id, vote_type) VALUES (${userId}, ${commentId}, ${voteType})`;
    if (voteType === 'up') {
      await sql`UPDATE comments SET upvotes = upvotes + 1 WHERE id = ${commentId}`;
    } else {
      await sql`UPDATE comments SET downvotes = downvotes + 1 WHERE id = ${commentId}`;
    }
    return voteType;
  }
}
