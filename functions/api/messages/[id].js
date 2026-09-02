/* ==========================================================================
   /api/messages/:id —— 删除留言（仅站长）
   DELETE 需带请求头 X-Admin-Key: <管理密钥>，与 secret ADMIN_KEY 比对。
   访客端不提供此按钮/密钥，删除只能由站长手动调用。
   ========================================================================== */

import { json, apiError, handle } from '../../_lib/http';

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const onRequestDelete = handle(async (context) => {
  const env = context.env;

  /* 校验管理密钥 */
  const adminKey = env.ADMIN_KEY;
  const given = context.request.headers.get('x-admin-key');
  if (!adminKey || !given || !constantTimeEqual(adminKey, given)) {
    return apiError(403, 'forbidden', '无权删除留言');
  }

  /* 解析留言 ID */
  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id < 1) return apiError(400, 'invalid_id', '留言 ID 不合法');

  const existing = await env.DB.prepare('SELECT id FROM messages WHERE id = ?').bind(id).first();
  if (!existing) return apiError(404, 'not_found', '留言不存在或已删除');

  await env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();
  return json({ ok: true });
});
