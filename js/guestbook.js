/* ==========================================================================
   guestbook.js —— 留言板脚本
   留言保存于 localStorage（key: redstar_guestbook），刷新页面不丢失。
   每条留言：{ id, name, content, time }，列表按时间倒序展示，支持删除。
   ========================================================================== */

var STORAGE_KEY = "redstar_guestbook";

/* 读取本地存储的留言数组 */
function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];   /* 数据损坏时自动重置，避免页面报错 */
  }
}

/* 保存留言数组 */
function saveMessages(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* 转义 HTML 特殊字符，防止留言内容破坏页面结构 */
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* 渲染留言列表（按时间倒序） */
function renderList() {
  var listEl = document.getElementById("gb-list");
  var messages = loadMessages().sort(function (a, b) { return b.id - a.id; });

  if (messages.length === 0) {
    listEl.innerHTML = '<p class="gb-empty">还没有留言，来写下第一条寄语吧。</p>';
    return;
  }

  listEl.innerHTML = "";
  messages.forEach(function (m) {
    var item = document.createElement("div");
    item.className = "gb-item";
    item.innerHTML =
      '<div class="head">' +
      '<span class="name">' + escapeHtml(m.name) + '</span>' +
      '<span><span class="time">' + escapeHtml(m.time) + '</span> ' +
      '<button class="del-btn" data-id="' + m.id + '">删除</button></span>' +
      '</div>' +
      '<p class="content">' + escapeHtml(m.content) + '</p>';
    listEl.appendChild(item);
  });

  /* 绑定删除按钮（可选功能） */
  listEl.querySelectorAll(".del-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!confirm("确定删除这条留言吗？")) return;
      var id = parseInt(this.getAttribute("data-id"), 10);
      saveMessages(loadMessages().filter(function (m) { return m.id !== id; }));
      renderList();
    });
  });
}

/* ---------------- 提交表单 ---------------- */
document.getElementById("gb-form").addEventListener("submit", function (e) {
  e.preventDefault();   /* 阻止表单默认跳转 */

  var nameEl = document.getElementById("gb-name");
  var contentEl = document.getElementById("gb-content");
  var name = nameEl.value.trim();
  var content = contentEl.value.trim();

  /* 必填校验 */
  if (!name)    { alert("请填写昵称。"); nameEl.focus(); return; }
  if (!content) { alert("请填写留言内容。"); contentEl.focus(); return; }

  var list = loadMessages();
  list.push({
    id: Date.now(),                              /* 用时间戳作为唯一 id */
    name: name,
    content: content,
    time: new Date().toLocaleString()            /* 显示留言时间 */
  });
  saveMessages(list);

  /* 清空表单并刷新列表 */
  nameEl.value = "";
  contentEl.value = "";
  renderList();
});

/* 页面加载后首次渲染 */
renderList();
