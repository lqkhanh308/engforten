// ===========================================================================
// Chọn đúng hình: hiện + đọc 1 từ tiếng Anh -> bé bấm vào hình đúng.
// ===========================================================================

import { wordsOf, sample, distractors } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, toast, praise } from "../ui.js";
import { categoryPicker, livesWidget, loseScreen, winScreen } from "./common.js";

const app = document.getElementById("app");

const TARGET = 10; // đạt đủ sao là THẮNG -> nhận vé oẳn tù tì

let pool = wordsOf("all");
let target = null;
let locked = false;
let score = 0;

const picker = categoryPicker((id) => {
  pool = wordsOf(id);
  restart();
});

const scoreEl = el("span", { text: `⭐ 0/${TARGET}` });
// Hết tim -> khoá thao tác ngay, chờ một nhịp cho bé thấy tim vỡ rồi mới hiện màn thua.
const lives = livesWidget(3, () => {
  locked = true;
  setTimeout(lose, 700);
});
const promptWord = el("span", { class: "prompt-word" });
const speaker = el("button", { class: "btn-speak", "aria-label": "Đọc lại", onclick: () => target && speakEn(target.en) }, "🔊");
const promptRow = el("div", { class: "prompt" }, [promptWord, speaker]);
const choicesGrid = el("div", { class: "grid" });
const loseWrap = el("div");

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(picker.bar);
  app.appendChild(el("div", { class: "scorebar" }, [scoreEl, lives.bar]));
  app.appendChild(el("p", { class: "lead", text: "Bấm vào hình đúng nhé!" }));
  app.appendChild(promptRow);
  app.appendChild(choicesGrid);
  app.appendChild(loseWrap);
}

function restart() {
  score = 0;
  scoreEl.textContent = `⭐ 0/${TARGET}`;
  lives.reset();
  loseWrap.innerHTML = "";
  promptRow.hidden = false;
  newRound();
}

function lose() {
  promptRow.hidden = true;
  choicesGrid.innerHTML = "";
  loseWrap.innerHTML = "";
  loseWrap.appendChild(loseScreen({ scoreText: `Bé được ${score} ⭐`, onRetry: restart }));
}

// Đạt đủ sao -> thắng, nhận vé (game không phân độ khó = 1 vé).
function win() {
  promptRow.hidden = true;
  choicesGrid.innerHTML = "";
  loseWrap.innerHTML = "";
  loseWrap.appendChild(winScreen({ scoreText: `Bé đạt ${TARGET} ⭐!`, tickets: 1, onRetry: restart }));
}

function newRound() {
  locked = false;
  if (pool.length < 2) {
    toast("Chủ đề này quá ít từ");
    return;
  }
  const count = Math.min(4, pool.length);
  target = sample(pool, 1)[0];
  const choices = sample([target, ...distractors(target, count - 1, pool)], count);

  promptWord.textContent = target.en;
  choicesGrid.innerHTML = "";
  for (const w of choices) {
    const card = el("button", { class: "card", onclick: () => pick(card, w) }, [pictureEl(w)]);
    choicesGrid.appendChild(card);
  }
  // Đọc từ cần tìm.
  speakEn(target.en);
}

function pick(card, word) {
  if (locked) return;
  if (word.id === target.id) {
    locked = true;
    card.classList.add("correct");
    speakEn(target.en);
    celebrate();
    score++;
    scoreEl.textContent = `⭐ ${score}/${TARGET}`;
    praise({ spoken: false }); // toast khen tiếng Anh, không đọc
    // Đủ sao -> màn thắng; chưa thì chơi tiếp.
    setTimeout(score >= TARGET ? win : newRound, score >= TARGET ? 1400 : 2200);
  } else {
    card.classList.add("wrong");
    setTimeout(() => card.classList.remove("wrong"), 400);
    lives.hit(); // sai -> mất 1 tim (tự rung + xử lý thua khi hết tim)
  }
}

// Chạm lần đầu -> TTS được mở khoá -> đọc lại từ cần tìm.
initPage(() => target && speakEn(target.en));
buildLayout();
newRound();
