// ===========================================================================
// Tìm bóng đen: hiện 1 hình thật -> bé chọn đúng bóng đen (silhouette) của nó.
// Kiểu Montessori, hợp bé 3-4 tuổi. Chọn đúng thì bóng "hiện hình" thành màu.
// ===========================================================================

import { wordsOf, sample, distractors } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, toast, praise } from "../ui.js";
import { categoryPicker, livesWidget, loseScreen } from "./common.js";

const app = document.getElementById("app");

// Loại các chủ đề mà bóng đen trông giống hệt nhau (toàn hình tròn/vuông):
// màu sắc = chấm tròn, số đếm = ô vuông, hành động = nhiều emoji khuôn mặt,
// gia đình + nghề nghiệp = toàn hình người (đầu/vai) na ná nhau khi tô đen.
const EXCLUDE = ["colors", "numbers", "actions", "family", "jobs"];
const poolOf = (id) => wordsOf(id).filter((w) => !EXCLUDE.includes(w.categoryId));

let pool = poolOf("all");
let target = null;
let locked = false;
let score = 0;

const picker = categoryPicker(
  (id) => {
    pool = poolOf(id);
    restart();
  },
  { exclude: EXCLUDE }
);

const scoreEl = el("span", { text: "⭐ 0" });
// Hết tim -> khoá thao tác ngay, chờ một nhịp cho bé thấy tim vỡ rồi mới hiện màn thua.
const lives = livesWidget(3, () => {
  locked = true;
  setTimeout(lose, 700);
});
const targetBox = el("div", { class: "shadow-target" });
const promptWord = el("span", { class: "prompt-word" });
const speaker = el("button", { class: "btn-speak", "aria-label": "Đọc lại", onclick: () => target && speakEn(target.en) }, "🔊");
const promptRow = el("div", { class: "prompt" }, [promptWord, speaker]);
const choicesGrid = el("div", { class: "grid" });
const loseWrap = el("div");

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(picker.bar);
  app.appendChild(el("div", { class: "scorebar" }, [scoreEl, lives.bar]));
  app.appendChild(el("p", { class: "lead", text: "Bóng đen nào là của hình này?" }));
  app.appendChild(targetBox);
  app.appendChild(promptRow);
  app.appendChild(choicesGrid);
  app.appendChild(loseWrap);
}

function restart() {
  score = 0;
  scoreEl.textContent = "⭐ 0";
  lives.reset();
  loseWrap.innerHTML = "";
  promptRow.hidden = false;
  targetBox.hidden = false;
  newRound();
}

function lose() {
  promptRow.hidden = true;
  targetBox.hidden = true;
  choicesGrid.innerHTML = "";
  loseWrap.innerHTML = "";
  loseWrap.appendChild(loseScreen({ scoreText: `Bé được ${score} ⭐`, onRetry: restart }));
}

function newRound() {
  locked = false;
  if (pool.length < 2) {
    toast("Chủ đề này quá ít từ");
    return;
  }
  const count = Math.min(3, pool.length);
  target = sample(pool, 1)[0];
  const choices = sample([target, ...distractors(target, count - 1, pool)], count);

  targetBox.innerHTML = "";
  targetBox.appendChild(pictureEl(target));
  promptWord.textContent = target.en;

  choicesGrid.innerHTML = "";
  for (const w of choices) {
    const card = el("button", { class: "card", onclick: () => pick(card, w) }, [
      pictureEl(w, { className: "silhouette" }),
    ]);
    choicesGrid.appendChild(card);
  }
  speakEn(target.en);
}

function pick(card, word) {
  if (locked) return;
  if (word.id === target.id) {
    locked = true;
    card.classList.add("correct");
    // Bóng đen "hiện hình" thành màu thật.
    card.querySelector(".pic").classList.remove("silhouette");
    speakEn(target.en);
    celebrate();
    score++;
    scoreEl.textContent = `⭐ ${score}`;
    praise({ spoken: false }); // toast khen tiếng Anh, không đọc
    setTimeout(newRound, 2200);
  } else {
    card.classList.add("wrong");
    setTimeout(() => card.classList.remove("wrong"), 400);
    lives.hit(); // sai -> mất 1 tim
  }
}

// Chạm lần đầu -> TTS được mở khoá -> đọc lại câu hỏi hiện tại.
initPage(() => target && speakEn(target.en));
buildLayout();
newRound();
