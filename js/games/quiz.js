// ===========================================================================
// Đố vui trắc nghiệm: trộn 2 dạng câu hỏi
//   A) Hiện HÌNH  -> chọn TỪ tiếng Anh đúng
//   B) Hiện TỪ EN -> chọn NGHĨA tiếng Việt đúng
// 10 câu/lượt, có điểm sao. Có 3 tim: sai 3 câu là thua sớm.
// Chế độ "Tính giờ" thêm thanh đếm ngược — hết giờ tính như trả lời sai.
// ===========================================================================

import { wordsOf, sample, distractors, shuffle } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, toast, praise } from "../ui.js";
import { chipPicker, livesWidget, loseScreen, winScreen, timerBar } from "./common.js";

const app = document.getElementById("app");

const TOTAL = 10;
const TIMER_SECONDS = 12;
const pool = wordsOf("all");
let qIndex = 0;
let score = 0;
let locked = false;
let timed = false;
let current = null; // { target, optsBox } của câu đang hỏi (cho xử lý hết giờ)
let speakPrompt = null; // đọc lại câu hỏi hiện tại (nếu dạng câu có đọc)

const modePicker = chipPicker(
  [
    { id: "off", label: "😌 Thư giãn" },
    { id: "on", label: "⏱️ Tính giờ" },
  ],
  "off",
  (id) => {
    timed = id === "on";
    startQuiz();
  }
);

const scoreEl = el("span");
const progEl = el("span");
// Hết tim -> dừng lượt sớm; chờ lâu hơn một chút cho bé kịp nhìn đáp án đúng.
const lives = livesWidget(3, () => {
  locked = true;
  timer.stop();
  setTimeout(lose, 1800);
});
// Hết giờ = như trả lời sai: hiện đáp án đúng + mất 1 tim.
const timer = timerBar(() => {
  if (locked || !current) return;
  locked = true;
  toast("Hết giờ! ⏰");
  revealCorrect(current.optsBox, current.target);
  speakEn(current.target.en);
  const left = lives.hit();
  qIndex++;
  if (left > 0) setTimeout(nextQuestion, 2200);
});
const stage = el("div", {});

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(modePicker.bar);
  app.appendChild(el("div", { class: "scorebar" }, [progEl, scoreEl, lives.bar]));
  app.appendChild(timer.bar);
  app.appendChild(stage);
}

function startQuiz() {
  qIndex = 0;
  score = 0;
  locked = false;
  lives.reset();
  timer.stop();
  nextQuestion();
}

// Tô xanh đáp án đúng để bé học (dùng khi trả lời sai hoặc hết giờ).
function revealCorrect(optsBox, target) {
  [...optsBox.querySelectorAll(".opt")].forEach((b) => {
    if (b.textContent === target.en || b.textContent === target.vi) b.classList.add("correct");
  });
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
    // Không đọc từ ở dạng này — đọc là lộ đáp án.
    speakPrompt = null;
    qBox.appendChild(pictureEl(target));
    qBox.appendChild(el("div", { class: "q-text", text: "Đây là từ gì?" }));
  } else {
    speakPrompt = () => speakEn(target.en);
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

  current = { target, optsBox };
  if (timed) timer.start(TIMER_SECONDS);
  else timer.stop();
}

function answer(btn, chosen, target, optsBox) {
  if (locked) return;
  locked = true;
  timer.stop();

  let left = 1;
  if (chosen.id === target.id) {
    btn.classList.add("correct");
    score++;
    celebrate();
    praise({ spoken: false }); // toast khen tiếng Anh, không đọc
  } else {
    btn.classList.add("wrong");
    revealCorrect(optsBox, target);
    toast("Đáp án đúng đã hiện 🌟");
    left = lives.hit(); // sai -> mất 1 tim; hết tim thì lives tự xử lý thua
  }
  speakEn(target.en);
  updateBar();

  qIndex++;
  // Nghỉ một nhịp cho bé nghe/nhìn xong rồi mới qua câu mới; sai thì lâu hơn
  // để bé kịp nhìn đáp án đúng được tô xanh. Hết tim thì không qua câu mới.
  if (left > 0) setTimeout(nextQuestion, chosen.id === target.id ? 2200 : 2800);
}

function lose() {
  timer.stop();
  updateBar();
  stage.innerHTML = "";
  stage.appendChild(loseScreen({ scoreText: `Bé được ${score} ⭐`, onRetry: startQuiz }));
}

function finish() {
  timer.stop();
  updateBar();
  stage.innerHTML = "";
  // Hoàn thành 10 câu (không bị thua giữa chừng) = THẮNG -> màn ăn mừng chung
  // (🏆 + kèn fanfare). Vé theo chế độ: tính giờ khó hơn = 2 vé, thư giãn = 1.
  const stars = "⭐".repeat(Math.max(1, Math.round((score / TOTAL) * 5)));
  stage.appendChild(
    winScreen({
      scoreText: `Bé trả lời đúng ${score}/${TOTAL} câu!`,
      tickets: timed ? 2 : 1,
      onRetry: startQuiz,
      extra: el("div", { class: "quiz-stars", text: stars }),
    })
  );
}

// Chạm lần đầu -> TTS được mở khoá -> đọc lại câu hỏi (nếu là dạng có đọc).
initPage(() => speakPrompt && speakPrompt());
buildLayout();
startQuiz();
