/* ==========================================================================
   quiz.js —— 答题页脚本
   两种模式：
   1. 分步答题（默认，推荐）：每次 1 题，选择后立即显示对错与解析，点"下一题"继续；
   2. 全部题目：一次展示 17 题，可逐题自测。
   题库数据来自 data.js 的 QUIZ 数组。
   ========================================================================== */

var quizPanel = document.getElementById("quiz-panel");
var quizBody  = document.getElementById("quiz-body");

var LETTERS = ["A", "B", "C", "D"];        // 选项前缀
var current = 0;                            // 当前题号（下标）
var correctCount = 0;                       // 答对数量
var wrongList = [];                         // 错题记录（用于结算页回顾）
var mode = "step";                          // 当前模式：step=分步 / all=全部

/* ---------------- 工具函数 ---------------- */

/* 选项下标转文字，如 0 -> "A" */
function letter(i) { return LETTERS[i] || (i === 0 ? "对" : "错"); }

/* 更新进度条与题号提示 */
function updateProgress() {
  document.getElementById("progress-fill").style.width = (current / QUIZ.length * 100) + "%";
  document.getElementById("progress-label").textContent =
    "第 " + (current + 1) + " / " + QUIZ.length + " 题 · 已答对 " + correctCount + " 题";
}

/* 判断题的选项前缀显示"对/错"，单选显示 A/B/C/D */
function optionPrefix(idx, type) {
  return type === "判断" ? (idx === 0 ? "对" : "错") : LETTERS[idx];
}

/* ---------------- 分步答题模式 ---------------- */

/* 渲染当前题目 */
function renderQuestion() {
  var q = QUIZ[current];
  var html =
    '<div class="quiz-question"><span class="q-type">' + q.type + '</span>' +
    '第 ' + (current + 1) + ' 题：' + q.question + '</div>' +
    '<div class="quiz-options" id="options">';
  for (var i = 0; i < q.options.length; i++) {
    html += '<button data-idx="' + i + '">' + optionPrefix(i, q.type) + '. ' + q.options[i] + '</button>';
  }
  html += '</div>' +
    '<div class="explanation" id="explanation"></div>' +
    '<div class="quiz-actions">' +
    '<button class="btn" id="next-btn" disabled>下一题</button></div>';
  quizBody.innerHTML = html;
  updateProgress();

  /* 为每个选项绑定点击事件 */
  var btns = document.querySelectorAll("#options button");
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () { choose(this); });
  }
  document.getElementById("next-btn").addEventListener("click", goNext);
}

/* 用户选择某个选项：立即判分、标色并展示解析 */
function choose(btnEl) {
  var q = QUIZ[current];
  var picked = parseInt(btnEl.getAttribute("data-idx"), 10);
  var isRight = picked === q.answer;
  if (isRight) correctCount++;
  else wrongList.push(q);

  /* 禁用所有选项，并给正确/错误选项着色 */
  var btns = document.querySelectorAll("#options button");
  for (var i = 0; i < btns.length; i++) {
    btns[i].disabled = true;
    var idx = parseInt(btns[i].getAttribute("data-idx"), 10);
    if (idx === q.answer) btns[i].classList.add("correct");
    else if (idx === picked) { btns[i].classList.add("wrong"); btns[i].classList.add("chosen"); }
  }

  /* 显示解析 */
  var box = document.getElementById("explanation");
  box.innerHTML =
    '<p class="verdict ' + (isRight ? "right" : "miss") + '">' +
    (isRight ? "✔ 回答正确！" : "✘ 回答错误，正确答案是 " + optionPrefix(q.answer, q.type) + ". " + q.options[q.answer]) +
    '</p><p><strong>解析：</strong>' + q.explanation + '</p>';
  box.classList.add("show");

  /* 启用"下一题"按钮（最后一题文字改为"查看成绩"） */
  var nextBtn = document.getElementById("next-btn");
  nextBtn.disabled = false;
  nextBtn.textContent = current === QUIZ.length - 1 ? "查看成绩" : "下一题";
}

/* 进入下一题或结算 */
function goNext() {
  current++;
  if (current < QUIZ.length) renderQuestion();
  else renderResult();
}

/* ---------------- 成绩结算页 ---------------- */
function renderResult() {
  document.getElementById("progress-fill").style.width = "100%";
  document.getElementById("progress-label").textContent = "答题完成";

  var ratio = Math.round(correctCount / QUIZ.length * 100);
  var remark;
  if (ratio === 100)      remark = "满分！你对密码史与机要纪律了如指掌，向先烈致敬！";
  else if (ratio >= 80)   remark = "非常优秀！再接再厉，把易错的知识点记牢。";
  else if (ratio >= 60)   remark = "合格！建议回顾错题解析，补齐知识盲区。";
  else                    remark = "继续加油！通读密码史页面后再来挑战一次吧。";

  var html =
    '<div class="quiz-result">' +
    '<p class="score">' + correctCount + ' <small>/ ' + QUIZ.length + '</small></p>' +
    '<p class="remark">正确率 ' + ratio + '% — ' + remark + '</p>' +
    '<button class="btn" id="restart-btn">重新答题</button> ' +
    '<button class="btn ghost" id="listmode-btn">浏览全部题目</button>' +
    '</div>';

  /* 错题回顾（如有） */
  if (wrongList.length > 0) {
    html += '<div class="wrong-review"><h4>错题解析（' + wrongList.length + ' 道）</h4>';
    wrongList.forEach(function (q) {
      html += '<div class="item"><strong>' + q.question + '</strong><br>' +
        '正确答案：' + optionPrefix(q.answer, q.type) + '. ' + q.options[q.answer] + '<br>' +
        '<strong>解析：</strong>' + q.explanation + '</div>';
    });
    html += '</div>';
  }

  quizBody.innerHTML = html;
  document.getElementById("restart-btn").addEventListener("click", restart);
  document.getElementById("listmode-btn").addEventListener("click", function () { setMode("all"); });
}

/* ---------------- 全部题目模式 ---------------- */
function renderAll() {
  var html = "";
  QUIZ.forEach(function (q, qi) {
    html += '<div style="margin-bottom:30px">' +
      '<div class="quiz-question"><span class="q-type">' + q.type + '</span>' +
      '第 ' + (qi + 1) + ' 题：' + q.question + '</div><div class="quiz-options">';
    for (var i = 0; i < q.options.length; i++) {
      html += '<button data-q="' + qi + '" data-idx="' + i + '">' + optionPrefix(i, q.type) + '. ' + q.options[i] + '</button>';
    }
    html += '</div><div class="explanation" id="exp-' + qi + '"></div></div>';
  });
  html += '<div class="quiz-actions"><button class="btn ghost" id="back-step">返回分步答题</button></div>';
  quizBody.innerHTML = html;

  document.getElementById("back-step").addEventListener("click", function () { setMode("step"); });

  /* 全部模式下：点击选项做自测，同样即时显示对错与解析 */
  quizBody.querySelectorAll(".quiz-options button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var qi = parseInt(this.getAttribute("data-q"), 10);
      var picked = parseInt(this.getAttribute("data-idx"), 10);
      var q = QUIZ[qi];
      this.closest(".quiz-options").querySelectorAll("button").forEach(function (b) {
        b.disabled = true;
        var idx = parseInt(b.getAttribute("data-idx"), 10);
        if (idx === q.answer) b.classList.add("correct");
        else if (idx === picked) b.classList.add("wrong");
      });
      var box = document.getElementById("exp-" + qi);
      box.innerHTML =
        '<p class="verdict ' + (picked === q.answer ? "right" : "miss") + '">' +
        (picked === q.answer ? "✔ 回答正确！" : "✘ 正确答案是 " + optionPrefix(q.answer, q.type) + ". " + q.options[q.answer]) +
        '</p><p><strong>解析：</strong>' + q.explanation + '</p>';
      box.classList.add("show");
    });
  });
}

/* ---------------- 模式切换与初始化 ---------------- */
function setMode(m) {
  mode = m;
  if (m === "step") {
    current = 0; correctCount = 0; wrongList = [];
    renderQuestion();
  } else {
    document.getElementById("progress-label").textContent = "全部题目模式：点击选项即可自测";
    document.getElementById("progress-fill").style.width = "0";
    renderAll();
  }
}

/* 重新答题 */
function restart() { setMode("step"); }

/* 模式切换按钮（元素存在时才绑定，避免个别页面缺失时报错） */
var modeAllBtn = document.getElementById("mode-all");
var modeStepBtn = document.getElementById("mode-step");
if (modeAllBtn) modeAllBtn.addEventListener("click", function () { setMode("all"); });
if (modeStepBtn) modeStepBtn.addEventListener("click", function () { setMode("step"); });

/* 页面加载后默认进入分步答题模式 */
setMode("step");
