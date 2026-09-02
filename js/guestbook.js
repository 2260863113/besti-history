/* ==========================================================================
   guestbook.js —— 留言板脚本（云端共享版）
   留言存于 Cloudflare D1（POST/GET /api/messages），所有人共享同一块板。
   访客可浏览、发表；删除仅限站长通过管理接口完成（本页不提供删除按钮）。
   每条留言：{ id, name, content, createdAt }，列表按 id 倒序展示。
   ========================================================================== */

var NAME_MAX = 20;       /* 与后端一致 */
var CONTENT_MAX = 300;   /* 与后端一致 */
var LIST_LIMIT = 100;    /* 一次拉取的最大条数 */

/* 转义 HTML 特殊字符，防止留言内容破坏页面结构 */
function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* 请求封装：解析 JSON，出错时抛带 message 的错误 */
function apiFetch(url, options) {
  return fetch(url, options).then(function (res) {
    return res.json().catch(function () { return {}; }).then(function (data) {
      if (!res.ok) throw new Error((data.error && data.error.message) || ("请求失败（" + res.status + "）"));
      return data;
    });
  });
}

/* 渲染留言列表（按 id 倒序） */
function renderList() {
  var listEl = document.getElementById("gb-list");
  var statusEl = document.getElementById("gb-status");

  listEl.innerHTML = "";
  if (statusEl) statusEl.textContent = "留言加载中…";

  apiFetch("/api/messages?limit=" + LIST_LIMIT)
    .then(function (data) {
      var messages = data.messages || [];
      if (statusEl) statusEl.textContent = "";
      if (messages.length === 0) {
        listEl.innerHTML = '<p class="gb-empty">还没有留言，来写下第一条寄语吧。</p>';
        return;
      }
      messages.forEach(function (m) {
        var item = document.createElement("div");
        item.className = "gb-item";
        var time = new Date(m.createdAt).toLocaleString();
        item.innerHTML =
          '<div class="head">' +
          '<span class="name">' + escapeHtml(m.name) + '</span>' +
          '<span class="time">' + escapeHtml(time) + '</span>' +
          '</div>' +
          '<p class="content">' + escapeHtml(m.content) + '</p>';
        listEl.appendChild(item);
      });
    })
    .catch(function (err) {
      if (statusEl) statusEl.textContent = "";
      listEl.innerHTML = '<p class="gb-empty">留言加载失败：' + escapeHtml(err.message) + '。请稍后刷新重试。</p>';
    });
}

/* ---------------- 提交表单 ---------------- */
document.getElementById("gb-form").addEventListener("submit", function (e) {
  e.preventDefault();   /* 阻止表单默认跳转 */

  var nameEl = document.getElementById("gb-name");
  var contentEl = document.getElementById("gb-content");
  var btn = document.querySelector("#gb-form .btn");
  var name = nameEl.value.trim();
  var content = contentEl.value.trim();

  /* 必填 + 长度校验（与后端一致，前端先拦一道） */
  if (!name)    { alert("请填写昵称。"); nameEl.focus(); return; }
  if (name.length > NAME_MAX) { alert("昵称不能超过 " + NAME_MAX + " 字。"); nameEl.focus(); return; }
  if (!content) { alert("请填写留言内容。"); contentEl.focus(); return; }
  if (content.length > CONTENT_MAX) { alert("留言内容不能超过 " + CONTENT_MAX + " 字。"); contentEl.focus(); return; }

  /* 防止重复提交 */
  if (btn) btn.disabled = true;

  apiFetch("/api/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: name, content: content })
  })
    .then(function () {
      /* 清空表单并刷新列表 */
      nameEl.value = "";
      contentEl.value = "";
      renderList();
    })
    .catch(function (err) {
      alert("提交失败：" + err.message);
    })
    .finally(function () {
      if (btn) btn.disabled = false;
    });
});

/* 页面加载后首次渲染 */
renderList();
