// ===========================================================================
// Đếm số: hiện 1-5 hình giống nhau -> bé đếm rồi bấm số đúng (1-5).
// Học đếm bằng tiếng Anh cho bé 3-4 tuổi. Không cần chọn chủ đề —
// vật đếm lấy từ các chủ đề "đếm được" (động vật, trái cây, phương tiện).
// ===========================================================================

import { wordsOf, sample } from "../data.js";
import { initPage, el, speakEn, celebrate, buzz, praise } from "../ui.js";

const app = document.getElementById("app");

// Số 1-10 kèm tên tiếng Anh.
const NUMBERS = [
  { n: 1, en: "One" },
  { n: 2, en: "Two" },
  { n: 3, en: "Three" },
  { n: 4, en: "Four" },
  { n: 5, en: "Five" },
  { n: 6, en: "Six" },
  { n: 7, en: "Seven" },
  { n: 8, en: "Eight" },
  { n: 9, en: "Nine" },
  { n: 10, en: "Ten" },
];

// Chỉ đếm các vật cụ thể, dễ nhìn.
const pool = [...wordsOf("animals"), ...wordsOf("fruits"), ...wordsOf("vehicles")];

let answer = 0;
let word = null;
let locked = false;
let score = 0;

const scoreEl = el("span", { text: "⭐ 0" });
const board = el("div", { class: "count-board" });
const speaker = el("button", { class: "btn-speak", "aria-label": "Đọc lại", onclick: () => speakEn("How many?") }, "🔊");
const options = el("div", { class: "count-options" });

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(el("div", { class: "scorebar" }, [scoreEl]));
  app.appendChild(el("p", { class: "lead", text: "Đếm xem có mấy hình rồi bấm số đúng nhé!" }));
  app.appendChild(el("div", { class: "prompt" }, [el("span", { class: "prompt-word", text: "How many?" }), speaker]));
  app.appendChild(board);
  app.appendChild(options);
}

function newRound() {
  locked = false;
  answer = 1 + Math.floor(Math.random() * 10);
  word = sample(pool, 1)[0];

  board.innerHTML = "";
  for (let i = 0; i < answer; i++) {
    board.appendChild(el("span", { class: "count-item", text: word.emoji }));
  }

  options.innerHTML = "";
  for (const num of NUMBERS) {
    options.appendChild(
      el("button", { class: "count-num", onclick: (e) => pick(e.currentTarget, num) }, [
        el("span", { class: "count-digit", text: String(num.n) }),
        el("span", { class: "count-name", text: num.en }),
      ])
    );
  }
  speakEn("How many?");
}

function pick(btn, num) {
  if (locked) return;
  if (num.n === answer) {
    locked = true;
    btn.classList.add("correct");
    speakEn(num.en);
    celebrate();
    score++;
    scoreEl.textContent = `⭐ ${score}`;
    praise({ spoken: false }); // toast khen tiếng Anh, không đọc
    setTimeout(newRound, 2200);
  } else {
    btn.classList.add("wrong");
    buzz(40);
    setTimeout(() => btn.classList.remove("wrong"), 400);
  }
}

// Chạm lần đầu -> TTS được mở khoá -> đọc lại câu hỏi.
initPage(() => speakEn("How many?"));
buildLayout();
newRound();
