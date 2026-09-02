/* ==========================================================================
   figures.js —— 人物页脚本
   从 data.js 的 FIGURES 数组渲染人物卡片（网格布局）。
   photo 为 null 时使用 SVG 占位头像；后续替换真实照片只需修改 data.js。
   ========================================================================== */

(function renderFigures() {
  var grid = document.getElementById("figures-grid");
  if (!grid) return;

  FIGURES.forEach(function (f, i) {
    var card = document.createElement("article");
    card.className = "figure-card";

    /* 头像：优先使用 photo 字段（真实照片路径），否则生成占位头像 */
    var avatarHtml;
    if (f.photo) {
      avatarHtml = '<img class="avatar" src="' + f.photo + '" alt="' + f.name + '照片">';
    } else {
      avatarHtml = '<img class="avatar" src="' + makeAvatarSVG(f.name, i) + '" alt="' + f.name + '照片（占位头像，待替换真实照片）">';
    }

    /* 参考资料链接列表 */
    var linksHtml = f.links.map(function (l) {
      return '<a class="ref-btn" href="' + l.url + '" target="_blank" rel="noopener">' + l.text + '</a>';
    }).join("");

    card.innerHTML =
      avatarHtml +
      '<h3>' + f.name + '</h3>' +
      '<p class="years">' + f.birthDeath + '</p>' +
      '<div class="field"><h4>简介</h4><p>' + f.intro + '</p></div>' +
      '<div class="field"><h4>对密码事业的贡献</h4><p>' + f.contribution + '</p></div>' +
      '<div class="field" style="text-align:center;margin-bottom:0"><h4>参考资料</h4><div>' + linksHtml + '</div></div>';

    grid.appendChild(card);
  });
})();
