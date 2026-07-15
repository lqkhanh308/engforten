// ===========================================================================
// Đếm số: hiện 1-5 hình giống nhau -> bé đếm rồi bấm số đúng (1-5).
// Học đếm bằng tiếng Anh cho bé 3-4 tuổi. Không cần chọn chủ đề —
// vật đếm lấy từ các chủ đề "đếm được" (động vật, trái cây, phương tiện).
// ===========================================================================

import { wordsOf, sample } from "../data.js";
import { initPage, el, speak, speakEn, celebrate, praise } from "../ui.js";
import { livesWidget, loseScreen, winScreen } from "./common.js";

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

const TARGET = 10; // đạt đủ sao là THẮNG -> nhận vé oẳn tù tì

let answer = 0;
let word = null;
let locked = false;
let score = 0;

const scoreEl = el("span", { text: `⭐ 0/${TARGET}` });
// Hết tim -> khoá thao tác ngay, chờ một nhịp cho bé thấy tim vỡ rồi mới hiện màn thua.
const lives = livesWidget(3, () => {
  locked = true;
  setTimeout(lose, 700);
});
const board = el("div", { class: "count-board" });
// Câu hỏi đọc bằng ngữ điệu "lên giọng" như đang hỏi thật.
const askHowMany = () => speak("How many?", { mood: "question" });
const speaker = el("button", { class: "btn-speak", "aria-label": "Đọc lại", onclick: askHowMany }, "🔊");
const promptRow = el("div", { class: "prompt" }, [el("span", { class: "prompt-word", text: "How many?" }), speaker]);
const options = el("div", { class: "count-options" });
const loseWrap = el("div");

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(el("div", { class: "scorebar" }, [scoreEl, lives.bar]));
  app.appendChild(el("p", { class: "lead", text: "Đếm xem có mấy hình rồi bấm số đúng nhé!" }));
  app.appendChild(promptRow);
  app.appendChild(board);
  app.appendChild(options);
  app.appendChild(loseWrap);
}

function restart() {
  score = 0;
  scoreEl.textContent = `⭐ 0/${TARGET}`;
  lives.reset();
  loseWrap.innerHTML = "";
  promptRow.hidden = false;
  board.hidden = false;
  newRound();
}

function lose() {
  promptRow.hidden = true;
  board.hidden = true;
  options.innerHTML = "";
  loseWrap.innerHTML = "";
  loseWrap.appendChild(loseScreen({ scoreText: `Bé được ${score} ⭐`, onRetry: restart }));
}

// Đạt đủ sao -> thắng, nhận vé (game không phân độ khó = 1 vé).
function win() {
  promptRow.hidden = true;
  board.hidden = true;
  options.innerHTML = "";
  loseWrap.innerHTML = "";
  loseWrap.appendChild(winScreen({ scoreText: `Bé đạt ${TARGET} ⭐!`, tickets: 1, onRetry: restart }));
}

function newRound() {
  locked = false;
  answer = 1 + Math.floor(Math.random() * 10);
  word = sample(pool, 1)[0];

  board.innerHTML = "";
  for (let i = 0; i < answer; i++) {
    const item = el("span", { class: "count-item", text: word.emoji });
    // Mỗi hình một CỠ + độ nghiêng + khoảng hở ngẫu nhiên để bé phải ĐẾM
    // thật sự, không đoán được đáp án theo độ dài hàng hay mật độ quen mắt.
    item.style.fontSize = (1.6 + Math.random() * 1.8).toFixed(2) + "rem";
    item.style.transform = `rotate(${Math.round(Math.random() * 24 - 12)}deg)`;
    item.style.margin = `${Math.round(Math.random() * 8)}px ${Math.round(Math.random() * 14)}px`;
    board.appendChild(item);
    // Thỉnh thoảng bẻ dòng ngẫu nhiên -> mỗi câu xếp thành số dòng khác nhau.
    if (i < answer - 1 && Math.random() < 0.3) {
      board.appendChild(el("span", { class: "count-break" }));
    }
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
  askHowMany();
}

function pick(btn, num) {
  if (locked) return;
  if (num.n === answer) {
    locked = true;
    btn.classList.add("correct");
    speakEn(num.en);
    celebrate();
    score++;
    scoreEl.textContent = `⭐ ${score}/${TARGET}`;
    praise({ spoken: false }); // toast khen tiếng Anh, không đọc
    // Đủ sao -> màn thắng; chưa thì chơi tiếp.
    setTimeout(score >= TARGET ? win : newRound, score >= TARGET ? 1400 : 2200);
  } else {
    btn.classList.add("wrong");
    setTimeout(() => btn.classList.remove("wrong"), 400);
    lives.hit(); // sai -> mất 1 tim
  }
}

// Chạm lần đầu -> TTS được mở khoá -> đọc lại câu hỏi.
initPage(askHowMany);
buildLayout();
newRound();
