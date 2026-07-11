// ===========================================================================
// Chọn đúng hình: hiện + đọc 1 từ tiếng Anh -> bé bấm vào hình đúng.
// ===========================================================================

import { wordsOf, sample, distractors } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, buzz, toast, praise } from "../ui.js";
import { categoryPicker } from "./common.js";

const app = document.getElementById("app");

let pool = wordsOf("all");
let target = null;
let locked = false;
let score = 0;

const picker = categoryPicker((id) => {
  pool = wordsOf(id);
  score = 0;
  newRound();
});

const scoreEl = el("span", { text: "⭐ 0" });
const promptWord = el("span", { class: "prompt-word" });
const speaker = el("button", { class: "btn-speak", "aria-label": "Đọc lại", onclick: () => target && speakEn(target.en) }, "🔊");
const choicesGrid = el("div", { class: "grid" });

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(picker.bar);
  app.appendChild(el("div", { class: "scorebar" }, [scoreEl]));
  app.appendChild(el("p", { class: "lead", text: "Bấm vào hình đúng nhé!" }));
  app.appendChild(el("div", { class: "prompt" }, [promptWord, speaker]));
  app.appendChild(choicesGrid);
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
    scoreEl.textContent = `⭐ ${score}`;
    praise({ spoken: false }); // toast khen tiếng Anh, không đọc
    setTimeout(newRound, 2200);
  } else {
    card.classList.add("wrong");
    buzz(40);
    setTimeout(() => card.classList.remove("wrong"), 400);
  }
}

// Chạm lần đầu -> TTS được mở khoá -> đọc lại từ cần tìm.
initPage(() => target && speakEn(target.en));
buildLayout();
newRound();
