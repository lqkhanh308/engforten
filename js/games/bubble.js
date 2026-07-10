// ===========================================================================
// Bắt bong bóng: bong bóng chứa hình trôi lơ lửng, app đọc 1 từ tiếng Anh
// -> bé chạm nổ đúng bong bóng. Luyện nghe + phản xạ cho bé 3-4 tuổi.
// ===========================================================================

import { wordsOf, sample, distractors } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, buzz, toast } from "../ui.js";
import { categoryPicker } from "./common.js";

const app = document.getElementById("app");

let pool = wordsOf("all");
let target = null;
let locked = false;
let score = 0;

const picker = categoryPicker((id) => {
  pool = wordsOf(id);
  score = 0;
  scoreEl.textContent = "⭐ 0";
  newRound();
});

const scoreEl = el("span", { text: "⭐ 0" });
const promptWord = el("span", { class: "prompt-word" });
const speaker = el("button", { class: "btn-speak", "aria-label": "Đọc lại", onclick: () => target && speakEn(target.en) }, "🔊");
const area = el("div", { class: "bubble-area" });

// Vị trí đặt sẵn (trái %, trên %) để bong bóng không đè lên nhau.
const SLOTS = [
  { l: 4, t: 4 },
  { l: 64, t: 8 },
  { l: 34, t: 22 },
  { l: 6, t: 50 },
  { l: 62, t: 48 },
  { l: 34, t: 62 },
];

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(picker.bar);
  app.appendChild(el("div", { class: "scorebar" }, [scoreEl]));
  app.appendChild(el("p", { class: "lead", text: "Nghe rồi chạm nổ bong bóng đúng nhé!" }));
  app.appendChild(el("div", { class: "prompt" }, [promptWord, speaker]));
  app.appendChild(area);
}

function newRound() {
  locked = false;
  if (pool.length < 2) {
    toast("Chủ đề này quá ít từ");
    return;
  }
  const count = Math.min(5, pool.length, SLOTS.length);
  target = sample(pool, 1)[0];
  const choices = sample([target, ...distractors(target, count - 1, pool)], count);
  const slots = sample(SLOTS, count);

  promptWord.textContent = target.en;
  area.innerHTML = "";
  choices.forEach((w, i) => {
    const b = el("button", { class: "bubble", "aria-label": w.en, onclick: () => pick(b, w) }, [pictureEl(w)]);
    b.style.left = slots[i].l + "%";
    b.style.top = slots[i].t + "%";
    // Mỗi bong bóng lắc lư một nhịp khác nhau cho tự nhiên.
    b.style.animationDuration = 2.4 + Math.random() * 1.8 + "s";
    b.style.animationDelay = -Math.random() * 2 + "s";
    area.appendChild(b);
  });
  speakEn(target.en);
}

function pick(bubble, word) {
  if (locked) return;
  if (word.id === target.id) {
    locked = true;
    bubble.classList.add("popped");
    // Chờ bong bóng nổ xong rồi mới đọc, nghe đỡ dồn dập.
    setTimeout(() => speakEn(target.en), 500);
    celebrate();
    score++;
    scoreEl.textContent = `⭐ ${score}`;
    toast("Nổ rồi! 🎉");
    setTimeout(newRound, 2200);
  } else {
    bubble.classList.add("bubble-wrong");
    buzz(40);
    setTimeout(() => bubble.classList.remove("bubble-wrong"), 400);
  }
}

initPage();
buildLayout();
newRound();
