-- 云端共享留言板：D1 (SQLite) 表结构
-- 每次访客发一条留言；同 IP 60 秒内最多 1 条（简单限流，防刷屏）

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,              -- 昵称（服务端 trim，≤20 字）
  content    TEXT    NOT NULL,              -- 留言内容（服务端 trim，≤300 字）
  created_at INTEGER NOT NULL,              -- epoch ms
  ip_hash    TEXT    NOT NULL               -- sha256(访客IP) 前 16 位，仅用于限流
);

-- 列表按时间倒序
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
-- 限流查询：同一 IP 最近 60 秒的发帖数
CREATE INDEX IF NOT EXISTS idx_messages_ip_time ON messages(ip_hash, created_at);
