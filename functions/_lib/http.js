/* ==========================================================================
   _lib/http.js —— 留言板 Functions 共享工具（纯 JS，无构建链）
   Pages Functions 约定：下划线开头目录（_lib）不映射为路由，仅供内部 import。
   ========================================================================== */

/* 统一 JSON 响应 */
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/* 统一错误响应体：{ error: { code, message } } */
export function apiError(status, code, message) {
  return json({ error: { code, message } }, status);
}

/* 内部可抛错误：handle() 统一捕获转 JSON */
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/* 解析请求 JSON 体，失败抛 400 */
export async function readJson(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, 'invalid_json', '请求体不是合法 JSON');
  }
  return body;
}

/* 包一层 onRequest：内部抛 ApiError -> 统一转 JSON 错误 */
export function handle(handler) {
  return async (context) => {
    try {
      return await handler(context);
    } catch (err) {
      if (err instanceof ApiError) return apiError(err.status, err.code, err.message);
      console.error(err);
      return apiError(500, 'internal', '服务器内部错误');
    }
  };
}

/* 取访客 IP 的哈希（前 16 位 hex），仅用于限流，不落明文 IP */
export async function clientIpHash(request) {
  const raw =
    request.headers.get('cf-connecting-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).slice(0, 16).join('');
}
