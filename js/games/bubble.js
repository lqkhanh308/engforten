// ===========================================================================
// Bắt bong bóng: bong bóng chứa hình trôi lơ lửng, app đọc 1 từ tiếng Anh
// -> bé chạm nổ đúng bong bóng. Luyện nghe + phản xạ cho bé 3-4 tuổi.
// Có 3 tim: chạm sai mất 1 tim, hết tim là thua. Chế độ "Tính giờ" thêm
// thanh đếm ngược — hết giờ cũng mất tim.
// ===========================================================================

import { wordsOf, sample, distractors } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, toast, praise } from "../ui.js";
import { categoryPicker, chipPicker, livesWidget, loseScreen, timerBar } from "./common.js";

const app = document.getElementById("app");

const TIMER_SECONDS = 10;

let pool = wordsOf("all");
let target = null;
let locked = false;
let score = 0;
let timed = false;

const picker = categoryPicker((id) => {
  pool = wordsOf(id);
  restart();
});
const modePicker = chipPicker(
  [
    { id: "off", label: "😌 Thư giãn" },
    { id: "on", label: "⏱️ Tính giờ" },
  ],
  "off",
  (id) => {
    timed = id === "on";
    restart();
  }
);

const scoreEl = el("span", { text: "⭐ 0" });
// Hết tim -> khoá thao tác ngay, chờ một nhịp cho bé thấy tim vỡ rồi mới hiện màn thua.
const lives = livesWidget(3, () => {
  locked = true;
  timer.stop();
  setTimeout(lose, 700);
});
// Hết giờ = như chạm sai: mất 1 tim rồi qua vòng mới (nếu còn tim).
const timer = timerBar(() => {
  if (locked) return;
  toast("Hết giờ! ⏰");
  const left = lives.hit();
  if (left > 0) {
    locked = true;
    setTimeout(newRound, 900);
  }
});
const promptWord = el("span", { class: "prompt-word" });
const speaker = el("button", { class: "btn-speak", "aria-label": "Đọc lại", onclick: () => target && speakEn(target.en) }, "🔊");
const promptRow = el("div", { class: "prompt" }, [promptWord, speaker]);
const area = el("div", { class: "bubble-area" });
const loseWrap = el("div");

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
  app.appendChild(modePicker.bar);
  app.appendChild(el("div", { class: "scorebar" }, [scoreEl, lives.bar]));
  app.appendChild(el("p", { class: "lead", text: "Nghe rồi chạm nổ bong bóng đúng nhé!" }));
  app.appendChild(promptRow);
  app.appendChild(timer.bar);
  app.appendChild(area);
  app.appendChild(loseWrap);
}

function restart() {
  score = 0;
  scoreEl.textContent = "⭐ 0";
  lives.reset();
  loseWrap.innerHTML = "";
  promptRow.hidden = false;
  area.hidden = false;
  newRound();
}

function lose() {
  timer.stop();
  promptRow.hidden = true;
  area.hidden = true;
  area.innerHTML = "";
  loseWrap.innerHTML = "";
  loseWrap.appendChild(loseScreen({ scoreText: `Bé được ${score} ⭐`, onRetry: restart }));
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
  if (timed) timer.start(TIMER_SECONDS);
  else timer.stop();
}

function pick(bubble, word) {
  if (locked) return;
  if (word.id === target.id) {
    locked = true;
    timer.stop();
    bubble.classList.add("popped");
    // Chờ bong bóng nổ xong rồi mới đọc, nghe đỡ dồn dập.
    setTimeout(() => speakEn(target.en), 500);
    celebrate();
    score++;
    scoreEl.textContent = `⭐ ${score}`;
    praise({ spoken: false }); // toast khen tiếng Anh, không đọc
    setTimeout(newRound, 2200);
  } else {
    bubble.classList.add("bubble-wrong");
    setTimeout(() => bubble.classList.remove("bubble-wrong"), 400);
    lives.hit(); // chạm sai -> mất 1 tim
  }
}

// Chạm lần đầu -> TTS được mở khoá -> đọc lại từ cần tìm.
initPage(() => target && speakEn(target.en));
buildLayout();
newRound();
