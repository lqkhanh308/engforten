// ===========================================================================
// Đố vui trắc nghiệm: trộn 2 dạng câu hỏi
//   A) Hiện HÌNH  -> chọn TỪ tiếng Anh đúng
//   B) Hiện TỪ EN -> chọn NGHĨA tiếng Việt đúng
// 10 câu/lượt, có điểm sao.
// ===========================================================================

import { wordsOf, sample, distractors, shuffle } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, buzz, toast } from "../ui.js";
import { categoryPicker } from "./common.js";

const app = document.getElementById("app");

const TOTAL = 10;
let pool = wordsOf("all");
let qIndex = 0;
let score = 0;
let locked = false;

const picker = categoryPicker((id) => {
  pool = wordsOf(id);
  startQuiz();
});

const scoreEl = el("span");
const progEl = el("span");
const stage = el("div", {});

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(picker.bar);
  app.appendChild(el("div", { class: "scorebar" }, [progEl, scoreEl]));
  app.appendChild(stage);
}

function startQuiz() {
  qIndex = 0;
  score = 0;
  locked = false;
  nextQuestion();
}

function updateBar() {
  progEl.textContent = `Câu ${Math.min(qIndex + 1, TOTAL)}/${TOTAL}`;
  scoreEl.textContent = `⭐ ${score}`;
}

function nextQuestion() {
  if (pool.length < 3) {
    stage.innerHTML = "";
    stage.appendChild(el("p", { class: "hint center", text: "Cần ít nhất 3 từ để chơi. Hãy chọn 'Tất cả'." }));
    return;
  }
  if (qIndex >= TOTAL) return finish();

  locked = false;
  updateBar();

  const target = sample(pool, 1)[0];
  const wrong = distractors(target, 2, pool);
  const options = shuffle([target, ...wrong]);
  const mode = Math.random() < 0.5 ? "pic2en" : "en2vi";

  // ---- Khu vực câu hỏi ----
  const qBox = el("div", { class: "quiz-q" });
  if (mode === "pic2en") {
    qBox.appendChild(pictureEl(target));
    qBox.appendChild(el("div", { class: "q-text", text: "Đây là từ gì?" }));
  } else {
    qBox.appendChild(
      el("div", { class: "prompt" }, [
        el("span", { class: "prompt-word", text: target.en }),
        el("button", { class: "btn-speak", "aria-label": "Đọc", onclick: () => speakEn(target.en) }, "🔊"),
      ])
    );
    qBox.appendChild(el("div", { class: "q-text", text: "Nghĩa tiếng Việt là gì?" }));
    speakEn(target.en);
  }

  // ---- Các lựa chọn ----
  const optsBox = el("div", { class: "quiz-options" });
  for (const w of options) {
    const text = mode === "pic2en" ? w.en : w.vi;
    const btn = el("button", { class: "opt", text });
    btn.addEventListener("click", () => answer(btn, w, target, optsBox));
    optsBox.appendChild(btn);
  }

  stage.innerHTML = "";
  stage.appendChild(qBox);
  stage.appendChild(optsBox);
}

function answer(btn, chosen, target, optsBox) {
  if (locked) return;
  locked = true;

  const buttons = [...optsBox.querySelectorAll(".opt")];
  if (chosen.id === target.id) {
    btn.classList.add("correct");
    score++;
    celebrate();
    toast("Đúng rồi! 🎉");
  } else {
    btn.classList.add("wrong");
    buzz(40);
    // tô xanh đáp án đúng để bé học
    buttons.forEach((b) => {
      if (b.textContent === target.en || b.textContent === target.vi) b.classList.add("correct");
    });
    toast("Đáp án đúng đã hiện 🌟");
  }
  speakEn(target.en);
  updateBar();

  qIndex++;
  setTimeout(nextQuestion, 1400);
}

function finish() {
  updateBar();
  stage.innerHTML = "";
  const stars = "⭐".repeat(Math.max(1, Math.round((score / TOTAL) * 5)));
  stage.appendChild(
    el("div", { class: "center" }, [
      el("div", { class: "quiz-q" }, [
        el("div", { class: "q-text", text: `Bé trả lời đúng ${score}/${TOTAL} câu!` }),
        el("div", { html: `<div style="font-size:2.4rem">${stars}</div>` }),
      ]),
      el("button", { class: "btn-big", onclick: startQuiz }, "🔄 Chơi lại"),
    ])
  );
  if (score >= TOTAL * 0.6) celebrate();
}

initPage();
buildLayout();
startQuiz();
