/* ==========================================================================
   history.js —— 密码史时间线页脚本
   阶段数据在下方 STAGES 数组中维护；漫画占位图由 main.js 的
   makeComicSVG() 动态生成（内联 SVG，体积极小，满足 16:9 与 300KB 限制）。
   后续拿到真实漫画时，给对应阶段加 image 字段（图片路径）即可自动替换。
   ========================================================================== */

/* 五个历史阶段：名称、起止年份、简介（2~3 句，据公开资料概括） */
var STAGES = [
  {
    tag: "1927 — 1936",
    title: "红军时期（萌芽与创建）",
    text: "1927年大革命失败后，党在白色恐怖中认识到建立秘密通信的迫切性。1930年1月15日，我党首次无线电密码通信成功，标志密码工作正式创建。张沈川等早期技术人员在上海秘密培训、筹建电台；1931年周恩来在上海编制“豪密”，实现“同字不同码、同码不同字”，守护党中央与苏区之间的绝密通信。",
    image: "cartoon/1.jpg"   /* 占位：后续填入漫画图片路径，如 "img/comic-1.png" */
  },
  {
    tag: "1937 — 1945",
    title: "抗战时期",
    text: "全面抗战爆发后，密码通信成为指挥敌后抗战的神经中枢。军委三局统筹全军通信，王诤等带领通信人员建立起覆盖各根据地与地下组织的电台网络；军委二局的无线电侦察破译工作屡建奇功，为粉碎日伪顽的封锁与“扫荡”提供了大量关键情报。",
      image: "cartoon/2.png"
  },
  {
    tag: "1945 — 1949",
    title: "解放战争时期",
    text: "解放战争中，密码通信与情报战线在无形战场上的作用空前凸显。我军建立起由700多部电台构成的强大通信网络，保障了各大战役的指挥畅通；隐蔽战线同志深入敌营、掌管核心密码本，为辽沈、淮海、平津等战役的胜利立下汗马功劳。",
      image: "cartoon/3.jpg"
  },
  {
    tag: "1949 — 1978",
    title: "建国初期",
    text: "新中国成立后，密码工作从战时体制转向国家化、正规化建设。1955年，我国研制成功第一台电动密码机“紫电一号”，开启自主研发密码设备的先河。同一时期，香农《保密系统的通信理论》传入我国，密码学逐步从经验走向科学，专业人才培养与科研体系开始建立。",
      image: "cartoon/4.jpg"
  },
  {
    tag: "1978 — 今",
    title: "改革开放至今（新时代）",
    text: "改革开放以来，我国密码事业进入自主创新、法治化发展的新阶段。SM2、SM3、ZUC（祖冲之）等国产密码算法相继问世并走向国际标准；1999年《商用密码管理条例》颁布；2020年1月1日《中华人民共和国密码法》正式施行，密码作为国家重要战略资源，进入依法治理、护航数字中国的新时代。",
      image: "cartoon/5.jpg"
  }
];

/* 渲染时间线：为每个阶段生成一张卡片，内含简介与漫画占位图 */
(function renderTimeline() {
  var wrap = document.getElementById("timeline");
  if (!wrap) return;

  STAGES.forEach(function (s) {
    var item = document.createElement("section");
    item.className = "timeline-item";

    var card = document.createElement("div");
    card.className = "timeline-card";

    /* 阶段标题 + 年代标签 */
    card.innerHTML =
      '<span class="era-tag">' + s.tag + '</span>' +
      '<h3>' + s.title + '</h3>' +
      '<p>' + s.text + '</p>';

    /* 漫画：有真实图片用 <img>，否则用 SVG 占位图 */
    var box = document.createElement("div");
    box.className = "comic-placeholder";
    if (s.image) {
      var img = document.createElement("img");
      img.src = s.image;
      img.alt = s.title + "漫画";
      box.appendChild(img);
    } else {
      var ph = document.createElement("img");
      ph.src = makeComicSVG(s.title);
      ph.alt = s.title + "漫画占位图（漫画筹备中，敬请期待）";
      box.appendChild(ph);
    }

    card.appendChild(box);
    item.appendChild(card);
    wrap.appendChild(item);
  });
})();
