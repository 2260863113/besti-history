/* ==========================================================================
   /api/messages —— 留言列表与发表
   GET  /api/messages?limit=&before=   按 id 倒序分页取留言
   POST /api/messages { name, content } 发表留言（服务端校验 + IP 简单限流）
   ========================================================================== */

import { json, apiError, readJson, handle, clientIpHash } from '../_lib/http';

const NAME_MAX = 20;        /* 昵称最大长度（字符） */
const CONTENT_MAX = 300;    /* 留言内容最大长度（字符） */
const RATE_WINDOW_MS = 60000; /* 限流窗口：60 秒 */
const RATE_MAX_PER_WINDOW = 1; /* 同一 IP 窗口内最多条数 */
const PAGE_LIMIT_MAX = 100;

/* 清洗昵称：trim 后取前 NAME_MAX 字符 */
function cleanName(v) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, NAME_MAX);
}

/* 清洗内容：trim 后取前 CONTENT_MAX 字符 */
function cleanContent(v) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, CONTENT_MAX);
}

export const onRequestGet = handle(async (context) => {
  const env = context.env;
  const url = new URL(context.request.url);

  const beforeRaw = url.searchParams.get('before');
  const before = beforeRaw === null || beforeRaw === '' ? 0 : Number(beforeRaw);
  const beforeSafe = Number.isInteger(before) && before > 0 ? before : 0;

  const limitRaw = url.searchParams.get('limit');
  let limit = limitRaw ? Number(limitRaw) : 50;
  if (!Number.isInteger(limit) || limit < 1) limit = 50;
  if (limit > PAGE_LIMIT_MAX) limit = PAGE_LIMIT_MAX;

  const rows = await env.DB.prepare(
    `SELECT id, name, content, created_at
     FROM messages
     WHERE ? = 0 OR id < ?
     ORDER BY id DESC
     LIMIT ?`,
  )
    .bind(beforeSafe, beforeSafe, limit)
    .all();

  return json({ messages: (rows.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    content: r.content,
    createdAt: r.created_at,
  })) });
});

export const onRequestPost = handle(async (context) => {
  const env = context.env;
  const body = await readJson(context.request);

  const name = cleanName(body.name);
  const content = cleanContent(body.content);

  if (!name) return apiError(400, 'invalid_name', `请填写昵称（不超过 ${NAME_MAX} 字）`);
  if (!content) return apiError(400, 'invalid_content', `请填写留言内容（不超过 ${CONTENT_MAX} 字）`);

  /* IP 简单限流：同一 IP 窗口内最多 1 条 */
  const ipHash = await clientIpHash(context.request);
  const now = Date.now();
  const recent = await env.DB.prepare(
    `SELECT COUNT(*) AS c FROM messages WHERE ip_hash = ? AND created_at > ?`,
  )
    .bind(ipHash, now - RATE_WINDOW_MS)
    .first();
  if ((recent?.c ?? 0) >= RATE_MAX_PER_WINDOW) {
    return apiError(429, 'rate_limited', '发言太快了，请一分钟后再试');
  }

  const result = await env.DB.prepare(
    'INSERT INTO messages (name, content, created_at, ip_hash) VALUES (?, ?, ?, ?)',
  )
    .bind(name, content, now, ipHash)
    .run();

  const id = Number(result.meta.last_row_id);
  return json(
    { message: { id, name, content, createdAt: now } },
    201,
  );
});
