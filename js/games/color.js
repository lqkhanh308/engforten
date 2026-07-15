// ===========================================================================
// Tìm màu: app đọc tên 1 màu tiếng Anh -> bé chạm đúng. 3 mức độ:
//   🙂 Dễ  : 4 ô màu trơn
//   😃 Vừa : 6 ĐỒ VẬT emoji, chọn 1 vật có màu đó (mồi nhử ưu tiên màu dễ nhầm)
//   😎 Khó : lưới 9 ĐỒ VẬT emoji, có 2-3 vật đúng màu — bé phải chạm TẤT CẢ
//            vật đúng mới xong vòng (chạm sai mất tim)
// Tên EN/VI lấy từ chủ đề "colors" trong data.js, mã màu định nghĩa ở đây.
// ===========================================================================

import { getCategory, sample, shuffle } from "../data.js";
import { initPage, el, speakEn, celebrate, praise, matchSound } from "../ui.js";
import { chipPicker, livesWidget, loseScreen, winScreen } from "./common.js";

const app = document.getElementById("app");

// Mã màu chuẩn cho từng id trong chủ đề colors (bỏ rainbow — nhiều màu).
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

// Đồ vật quen thuộc có màu đặc trưng — dùng ở mức Vừa (chọn 1) và Khó (chọn hết).
// Mỗi màu 8 icon cho phong phú, đỡ lặp lại giữa các vòng.
const OBJECTS = {
  red: ["🍎", "🍓", "🍒", "🚒", "🌹", "❤️", "🐞", "🧧"],
  orange: ["🍊", "🥕", "🎃", "🦊", "🏀", "🧡", "🔶"],
  yellow: ["🍌", "🍋", "🌻", "🐤", "⭐", "🧀", "🌽"],
  green: ["🐸", "🥦", "🍀", "🌵", "🥑", "🌲", "🍏", "🐢"],
  blue: ["🐳", "💧", "🐬", "🫐", "🌊", "💙", "🔵"],
  purple: ["🍇", "🍆", "💜", "☂️", "🔮", "🟣", "👾", "🟪"],
  pink: ["🐷", "🌸", "🎀", "🦩", "💗", "🌷", "🩰", "🌺"],
  brown: ["🐻", "🍫", "🌰", "🥔", "🪵", "🏈", "🍪", "🧸"],
  black: ["🐜", "🕷️", "🎩", "⚫", "🖤", "🎱", "🌑"],
  white: ["☁️", "🐑", "⚪", "🤍", "🦢", "🍚", "🧻"],
};

const words = (getCategory("colors")?.words || []).filter((w) => SWATCH[w.id]);
const byId = Object.fromEntries(words.map((w) => [w.id, w]));

const TARGET = 10; // đạt đủ sao là THẮNG -> nhận vé oẳn tù tì theo độ khó

let mode = "easy";
let target = null;
let locked = false;
let score = 0;
let remaining = 0; // mức Khó: số vật đúng màu còn phải tìm trong vòng này

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

const scoreEl = el("span", { text: `⭐ 0/${TARGET}` });
// Hết tim -> khoá thao tác ngay, chờ một nhịp cho bé thấy tim vỡ rồi mới hiện màn thua.
const lives = livesWidget(3, () => {
  locked = true;
  setTimeout(lose, 700);
});
const leadEl = el("p", { class: "lead" });
const promptWord = el("span", { class: "prompt-word" });
const progressEl = el("span", { class: "color-progress" }); // mức Khó: 🔎 1/3
const speaker = el("button", { class: "btn-speak", "aria-label": "Đọc lại", onclick: () => target && speakEn(target.en) }, "🔊");
const promptRow = el("div", { class: "prompt" }, [promptWord, progressEl, speaker]);
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
  scoreEl.textContent = `⭐ 0/${TARGET}`;
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

// Đạt đủ sao -> thắng, nhận vé theo độ khó đang chơi (dễ 1 / vừa 2 / khó 3).
function win() {
  promptRow.hidden = true;
  leadEl.hidden = true;
  grid.innerHTML = "";
  loseWrap.innerHTML = "";
  loseWrap.appendChild(
    winScreen({
      scoreText: `Bé đạt ${TARGET} ⭐!`,
      tickets: mode === "hard" ? 3 : mode === "medium" ? 2 : 1,
      onRetry: restart,
    })
  );
}

// Ăn 1 sao sau khi xong vòng; đủ sao thì thắng, chưa thì vòng mới.
function roundDone() {
  score++;
  scoreEl.textContent = `⭐ ${score}/${TARGET}`;
  celebrate();
  praise({ spoken: false }); // toast khen tiếng Anh, không đọc
  setTimeout(score >= TARGET ? win : newRound, score >= TARGET ? 1400 : 2200);
}

// ---- Vòng chơi mức Dễ / Vừa: 1 đáp án đúng duy nhất -------------------------
// Chọn danh sách màu (mục tiêu + mồi nhử); Vừa ưu tiên màu dễ nhầm.
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

function newRoundSingle() {
  const count = mode === "easy" ? 4 : 6;
  const choices = pickColors(count);

  grid.innerHTML = "";
  for (const w of choices) {
    let card;
    if (mode === "medium") {
      // Vừa: đồ vật emoji trên nền thẻ trắng — bé suy màu từ vật thật.
      const emoji = sample(OBJECTS[w.id], 1)[0];
      card = el("button", { class: "card color-obj", "aria-label": w.en, onclick: () => pickSingle(card, w) }, [
        el("div", { class: "pic" }, [el("span", { class: "pic-emoji", text: emoji })]),
      ]);
      card.style.background = "var(--card)"; // đè màu pastel xoay vòng của .grid
    } else {
      // Dễ: ô màu trơn.
      card = el("button", { class: "card color-card", "aria-label": w.en, onclick: () => pickSingle(card, w) });
      card.style.background = SWATCH[w.id];
    }
    grid.appendChild(card);
  }
}

function pickSingle(card, word) {
  if (locked) return;
  if (word.id === target.id) {
    locked = true;
    card.classList.add("correct");
    speakEn(target.en);
    roundDone();
  } else {
    card.classList.add("wrong");
    setTimeout(() => card.classList.remove("wrong"), 400);
    lives.hit(); // sai -> mất 1 tim
  }
}

// ---- Vòng chơi mức Khó: tìm TẤT CẢ vật đúng màu ------------------------------
function newRoundHard() {
  // 2-3 vật đúng màu trộn trong lưới 9 vật.
  const correctCount = 2 + Math.floor(Math.random() * 2);
  remaining = correctCount;
  const corrects = sample(OBJECTS[target.id], correctCount).map((e) => ({ emoji: e, ok: true }));
  const otherColors = sample(words.filter((w) => w.id !== target.id), 9 - correctCount);
  const wrongs = otherColors.map((w) => ({ emoji: sample(OBJECTS[w.id], 1)[0], ok: false }));

  updateProgress(correctCount);
  grid.innerHTML = "";
  for (const item of shuffle([...corrects, ...wrongs])) {
    const card = el("button", { class: "card color-obj", onclick: () => pickHard(card, item) }, [
      el("div", { class: "pic" }, [el("span", { class: "pic-emoji", text: item.emoji })]),
    ]);
    card.style.background = "var(--card)"; // đè màu pastel xoay vòng của .grid
    grid.appendChild(card);
  }
}

function updateProgress(total) {
  progressEl.textContent = `🔎 ${total - remaining}/${total}`;
  progressEl._total = total;
}

function pickHard(card, item) {
  if (locked || card.classList.contains("correct")) return;
  if (item.ok) {
    card.classList.add("correct");
    card.disabled = true; // vật đã tìm thấy sáng viền xanh, không bấm lại được
    matchSound();
    remaining--;
    updateProgress(progressEl._total);
    if (remaining <= 0) {
      locked = true;
      speakEn(target.en);
      roundDone();
    }
  } else {
    card.classList.add("wrong");
    setTimeout(() => card.classList.remove("wrong"), 400);
    lives.hit(); // sai -> mất 1 tim
  }
}

// ---- Vòng mới (chung): chọn màu mục tiêu rồi rẽ nhánh theo mức ---------------
function newRound() {
  locked = false;
  target = sample(words, 1)[0];
  promptWord.textContent = target.en;
  progressEl.textContent = ""; // chỉ mức Khó mới dùng
  leadEl.textContent =
    mode === "hard"
      ? "Chạm TẤT CẢ đồ vật có màu đó nhé!"
      : mode === "medium"
        ? "Chạm vào đồ vật có màu đó nhé!"
        : "Chạm vào ô có màu đúng nhé!";

  if (mode === "hard") newRoundHard();
  else newRoundSingle();
  speakEn(target.en);
}

// Chạm lần đầu -> TTS được mở khoá -> đọc lại màu cần tìm.
initPage(() => target && speakEn(target.en));
buildLayout();
newRound();
