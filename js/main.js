/* ==========================================================================
   main.js —— 全站通用脚本
   1. 根据页面自动高亮导航当前项
   2. 提供共用的占位图生成函数（人物头像 / 16:9 漫画占位图，均为内联 SVG）
   ========================================================================== */

/* ---------- 导航当前页高亮 ----------
   每个页面的 <body> 上标注 data-page="home|history|figures|quiz|guestbook"，
   与导航链接的 data-nav 对应后添加 .active 类。 */
(function () {
  var page = document.body.getAttribute("data-page");
  if (!page) return;
  var links = document.querySelectorAll(".main-nav a[data-nav]");
  for (var i = 0; i < links.length; i++) {
    if (links[i].getAttribute("data-nav") === page) {
      links[i].classList.add("active");
    }
  }
})();

/* ---------- 生成人物占位头像（圆形，姓氏 + 红底金字） ----------
   说明：目前暂无真实照片，使用 SVG 占位；后续拿到照片时只需把
   data.js 中人物的 photo 字段改为图片路径，figures.js 会自动切换为 <img>。 */
function makeAvatarSVG(name, idx) {
  // 交替使用两种底色，让网格里的头像有区分度
  var colors = [["#C41A1A", "#FFE9B0"], ["#8E1111", "#F3E3B3"]];
  var c = colors[idx % colors.length];
  var char = name.charAt(0);
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<rect width="200" height="200" fill="' + c[0] + '"/>' +
    '<circle cx="100" cy="100" r="86" fill="none" stroke="' + c[1] + '" stroke-width="3" opacity="0.6"/>' +
    '<text x="100" y="100" text-anchor="middle" dominant-baseline="central" ' +
    'font-size="92" font-family="PingFang SC, Microsoft YaHei, serif" fill="' + c[1] + '">' + char + '</text>' +
    '</svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* ---------- 生成 16:9 漫画占位图（摩斯电码点缀 + "漫画筹备中·敬请期待"） ---------- */
function makeComicSVG(title) {
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">' +
    // 旧纸底色
    '<rect width="640" height="360" fill="#FBF3DF"/>' +
    // 顶部与底部摩斯电码装饰
    '<text x="320" y="46" text-anchor="middle" font-size="16" letter-spacing="8" fill="#D4AF37" opacity="0.75">· — · ·   — — —   · · —   · — ·</text>' +
    '<text x="320" y="330" text-anchor="middle" font-size="16" letter-spacing="8" fill="#D4AF37" opacity="0.75">— · ·   · · ·   · — · ·   — ·</text>' +
    // 电台 / 电波示意
    '<circle cx="320" cy="170" r="52" fill="none" stroke="#C41A1A" stroke-width="3"/>' +
    '<path d="M296 170 a24 24 0 0 1 48 0" fill="none" stroke="#C41A1A" stroke-width="3"/>' +
    '<line x1="320" y1="118" x2="320" y2="96" stroke="#C41A1A" stroke-width="4"/>' +
    '<circle cx="320" cy="90" r="5" fill="#C41A1A"/>' +
    '<path d="M240 170 q-18 -30 0 -58 M400 170 q18 -30 0 -58" fill="none" stroke="#C41A1A" stroke-width="2.5" opacity="0.55"/>' +
    // 阶段名称
    '<text x="320" y="252" text-anchor="middle" font-size="26" font-family="PingFang SC, Microsoft YaHei, serif" fill="#8E1111" letter-spacing="4">' + title + '</text>' +
    // 待补充提示
    '<text x="320" y="290" text-anchor="middle" font-size="15" font-family="PingFang SC, Microsoft YaHei, serif" fill="#B08A2E" letter-spacing="3">漫画筹备中 · 敬请期待</text>' +
    '</svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
