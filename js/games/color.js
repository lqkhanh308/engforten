// ===========================================================================
// Tìm màu: app đọc tên 1 màu tiếng Anh -> bé chạm đúng. 3 mức độ:
//   🙂 Dễ  : 4 ô màu trơn
//   😃 Vừa : 6 ô màu trơn, ưu tiên trộn các màu DỄ NHẦM (đỏ/hồng/cam...)
//   😎 Khó : 6 ĐỒ VẬT emoji — bé phải nhận ra vật có màu đó
// Tên EN/VI lấy từ chủ đề "colors" trong data.js, mã màu định nghĩa ở đây.
// ===========================================================================

import { getCategory, sample, shuffle } from "../data.js";
import { initPage, el, speakEn, celebrate, praise } from "../ui.js";
import { chipPicker, livesWidget, loseScreen } from "./common.js";

const app = document.getElementById("app");

// Mã màu hiển thị cho từng id trong chủ đề colors (bỏ rainbow — nhiều màu).
const SWATCH = {
  red: "#e53935",
  blue: "#1e88e5",
  green: "#43a047",
  yellow: "#fdd835",
  orange: "#fb8c00",
  purple: "#8e24aa",
  pink: "#f06292",
  black: "#212121",
  white: "#f5f5f5",
  brown: "#6d4c41",
};

// Nhóm màu dễ nhầm với nhau — dùng làm "mồi nhử" ở mức Vừa.
const CONFUSE = {
  red: ["pink", "orange", "brown"],
  pink: ["red", "purple", "white"],
  orange: ["red", "yellow", "brown"],
  yellow: ["orange", "white", "green"],
  green: ["blue", "yellow", "brown"],
  blue: ["purple", "green", "black"],
  purple: ["blue", "pink", "black"],
  brown: ["red", "orange", "black"],
  black: ["brown", "purple", "blue"],
  white: ["yellow", "pink", "black"],
};

// Đồ vật quen thuộc có màu đặc trưng — dùng ở mức Khó.
const OBJECTS = {
  red: ["🍎", "🍓", "🍒", "🚒"],
  orange: ["🍊", "🥕", "🎃", "🦊"],
  yellow: ["🍌", "🍋", "🌻", "🐤"],
  green: ["🐸", "🥦", "🍀", "🌵"],
  blue: ["🐳", "💧", "🐬", "🦋"],
  purple: ["🍇", "🍆", "💜", "☂️"],
  pink: ["🐷", "🌸", "🎀", "🦩"],
  brown: ["🐻", "🍫", "🌰", "🥔"],
  black: ["🐜", "🕷️", "🎩", "⚫"],
  white: ["☁️", "🥚", "🐑", "⚪"],
};

const words = (getCategory("colors")?.words || []).filter((w) => SWATCH[w.id]);
const byId = Object.fromEntries(words.map((w) => [w.id, w]));

let mode = "easy";
let target = null;
let locked = false;
let score = 0;

const diff = chipPicker(
  [
    { id: "easy", label: "🙂 Dễ" },
    { id: "medium", label: "😃 Vừa" },
    { id: "hard", label: "😎 Khó" },
  ],
  "easy",
  (id) => {
    mode = id;
    restart();
  }
);

const scoreEl = el("span", { text: "⭐ 0" });
// Hết tim -> khoá thao tác ngay, chờ một nhịp cho bé thấy tim vỡ rồi mới hiện màn thua.
const lives = livesWidget(3, () => {
  locked = true;
  setTimeout(lose, 700);
});
const leadEl = el("p", { class: "lead" });
const promptWord = el("span", { class: "prompt-word" });
const speaker = el("button", { class: "btn-speak", "aria-label": "Đọc lại", onclick: () => target && speakEn(target.en) }, "🔊");
const promptRow = el("div", { class: "prompt" }, [promptWord, speaker]);
const grid = el("div", { class: "grid" });
const loseWrap = el("div");

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(diff.bar);
  app.appendChild(el("div", { class: "scorebar" }, [scoreEl, lives.bar]));
  app.appendChild(leadEl);
  app.appendChild(promptRow);
  app.appendChild(grid);
  app.appendChild(loseWrap);
}

function restart() {
  score = 0;
  scoreEl.textContent = "⭐ 0";
  lives.reset();
  loseWrap.innerHTML = "";
  promptRow.hidden = false;
  leadEl.hidden = false;
  newRound();
}

function lose() {
  promptRow.hidden = true;
  leadEl.hidden = true;
  grid.innerHTML = "";
  loseWrap.innerHTML = "";
  loseWrap.appendChild(loseScreen({ scoreText: `Bé được ${score} ⭐`, onRetry: restart }));
}

// Chọn danh sách màu cho vòng chơi (mục tiêu + mồi nhử).
function pickColors(count) {
  let others;
  if (mode === "medium") {
    // Ưu tiên màu dễ nhầm, thiếu thì bù màu ngẫu nhiên.
    const confusers = (CONFUSE[target.id] || []).filter((id) => byId[id]).map((id) => byId[id]);
    const rest = words.filter((w) => w.id !== target.id && !confusers.includes(w));
    others = [...sample(confusers, confusers.length), ...sample(rest, count)].slice(0, count - 1);
  } else {
    others = sample(words.filter((w) => w.id !== target.id), count - 1);
  }
  return shuffle([target, ...others]);
}

function newRound() {
  locked = false;
  target = sample(words, 1)[0];
  promptWord.textContent = target.en;
  leadEl.textContent = mode === "hard" ? "Chạm vào đồ vật có màu đó nhé!" : "Chạm vào ô có màu đúng nhé!";

  const count = mode === "easy" ? 4 : 6;
  const choices = pickColors(count);

  grid.innerHTML = "";
  for (const w of choices) {
    let card;
    if (mode === "hard") {
      // Đồ vật emoji trên nền thẻ trắng để màu của vật nổi rõ.
      const emoji = sample(OBJECTS[w.id], 1)[0];
      card = el("button", { class: "card color-obj", "aria-label": w.en, onclick: () => pick(card, w) }, [
        el("div", { class: "pic" }, [el("span", { class: "pic-emoji", text: emoji })]),
      ]);
      card.style.background = "var(--card)"; // đè màu pastel xoay vòng của .grid
    } else {
      card = el("button", { class: "card color-card", "aria-label": w.en, onclick: () => pick(card, w) });
      card.style.background = SWATCH[w.id];
    }
    grid.appendChild(card);
  }
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
    setTimeout(() => card.classList.remove("wrong"), 400);
    lives.hit(); // sai -> mất 1 tim
  }
}

// Chạm lần đầu -> TTS được mở khoá -> đọc lại màu cần tìm.
initPage(() => target && speakEn(target.en));
buildLayout();
newRound();
