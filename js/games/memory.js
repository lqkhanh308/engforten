// ===========================================================================
// Lật thẻ tìm cặp (memory): lật 2 thẻ tìm 2 hình giống nhau. Khớp -> đọc từ.
// Gia vị thêm: ghép đúng liên tiếp được COMBO 🔥, mỗi ván có 1 cặp thẻ SAO
// may mắn ⭐ (ăn mừng lớn), mức Khó có 2 thẻ MA 👻 — lật trúng là nó cười
// khúc khích, tráo 2 thẻ đang úp rồi bay mất (mỗi ván bị trêu 2 lần).
// ===========================================================================

import { wordsOf, sample, shuffle } from "../data.js";
import {
  initPage, el, pictureEl, speakEn, celebrate, buzz, toast, praise,
  matchSound, comboSound, starSound, ghostSound,
} from "../ui.js";
import { categoryPicker, chipPicker } from "./common.js";

const app = document.getElementById("app");

// Thẻ đặc biệt (không phải từ vựng).
const STAR = { id: "__star__", en: "Lucky star!", vi: "Ngôi sao may mắn", emoji: "⭐" };
const GHOST = { id: "__ghost__", en: "", vi: "Ma nghịch ngợm", emoji: "👻" };

let pool = wordsOf("all");
let pairs = 4;
let first = null;
let locked = false;
let matched = 0;
let totalPairs = 0;
let streak = 0; // số cặp ghép đúng liên tiếp -> combo

const picker = categoryPicker((id) => {
  pool = wordsOf(id);
  start();
});
const diff = chipPicker(
  [
    { id: 4, label: "🙂 Dễ" },
    { id: 8, label: "😃 Vừa" },
    { id: 12, label: "😎 Khó" },
  ],
  4,
  (n) => {
    pairs = n;
    start();
  }
);

const boardWrap = el("div", {});

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(picker.bar);
  app.appendChild(diff.bar);
  app.appendChild(el("p", { class: "lead", text: "Lật 2 thẻ để tìm cặp giống nhau!" }));
  app.appendChild(boardWrap);
}

function start() {
  first = null;
  locked = false;
  matched = 0;
  streak = 0;

  const n = Math.min(pairs, pool.length);
  if (n < 2) {
    toast("Chủ đề này quá ít từ");
    return;
  }
  const chosen = sample(pool, n);
  // Mỗi ván trộn thêm 1 cặp thẻ SAO; mức Khó thêm 2 thẻ MA (lẻ, không có cặp)
  // -> mỗi ván bị ma trêu 2 lần.
  const cards = [...chosen, ...chosen, STAR, STAR];
  if (pairs >= 12) cards.push(GHOST, GHOST);
  totalPairs = n + 1;
  const deck = shuffle(cards);

  const grid = el("div", { class: "memory-grid" + (deck.length >= 16 ? " big" : "") });
  for (const w of deck) {
    const back = el("div", { class: "mem-face mem-back", text: "❓" });
    const front = el("div", { class: "mem-face mem-front" }, [pictureEl(w)]);
    const inner = el("div", { class: "mem-inner" }, [back, front]);
    const card = el("button", { class: "mem-card", "aria-label": "Lật thẻ" }, [inner]);
    if (w.id === STAR.id) card.classList.add("mem-star");
    if (w.id === GHOST.id) card.classList.add("mem-ghost");
    card._word = w;
    card._front = front;
    card.addEventListener("click", () => flip(card));
    grid.appendChild(card);
  }
  boardWrap.innerHTML = "";
  boardWrap.appendChild(grid);
}

function flip(card) {
  if (locked) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");

  // Thẻ MA không có cặp — nó trêu một cú rồi bay mất, không tính lượt chọn.
  if (card._word.id === GHOST.id) return ghostTrick(card);

  // Chờ thẻ lật xong (transition 0.4s) rồi mới đọc từ (thẻ sao đọc "Lucky star!").
  setTimeout(() => speakEn(card._word.en), 450);

  if (!first) {
    first = card;
    return;
  }

  // Thẻ thứ hai -> so sánh.
  locked = true;
  if (first._word.id === card._word.id) {
    setTimeout(() => {
      first.classList.add("matched");
      card.classList.add("matched");
      first = null;
      locked = false;
      matched++;
      streak++;
      if (card._word.id === STAR.id) {
        // Cặp sao may mắn -> ăn mừng lớn.
        starSound();
        celebrate();
        toast("Ngôi sao may mắn! 🌟");
      } else {
        matchSound();
        if (streak >= 2) {
          comboSound(streak);
          toast(`Combo x${streak}! 🔥`);
          if (streak >= 3) celebrate();
        }
      }
      if (matched === totalPairs) win();
    }, 350);
  } else {
    streak = 0; // trượt -> đứt combo
    buzz(40);
    setTimeout(() => {
      first.classList.remove("flipped");
      card.classList.remove("flipped");
      first = null;
      locked = false;
    }, 850);
  }
}

// Lật trúng MA: cười khúc khích, tráo ruột 2 thẻ đang úp rồi "vụt" biến mất.
function ghostTrick(card) {
  locked = true;
  ghostSound();
  toast("Hihi! Tráo thẻ nào! 👻", 1600);
  setTimeout(() => {
    // Không tráo thẻ đang ngửa, đã ghép, hay thẻ MA còn lại (tráo ma thì lệch
    // màu nền + con ma "dọn nhà" mất, bé không đoán được).
    const hidden = [...boardWrap.querySelectorAll(".mem-card")].filter(
      (c) => c !== card && c._word.id !== GHOST.id &&
        !c.classList.contains("flipped") && !c.classList.contains("matched")
    );
    if (hidden.length >= 2) {
      const [a, b] = sample(hidden, 2);
      a.classList.add("mem-swap");
      b.classList.add("mem-swap");
      // Mặt úp giống hệt nhau nên chỉ cần đổi "ruột" (từ + mặt trước) cho nhau.
      const tmp = a._word;
      a._word = b._word;
      b._word = tmp;
      a._front.innerHTML = "";
      a._front.appendChild(pictureEl(a._word));
      b._front.innerHTML = "";
      b._front.appendChild(pictureEl(b._word));
      setTimeout(() => {
        a.classList.remove("mem-swap");
        b.classList.remove("mem-swap");
      }, 750);
    }
    card.classList.add("poof");
    card.disabled = true;
    locked = false;
  }, 1000);
}

function win() {
  celebrate();
  // Chờ tiếng đọc từ của thẻ cuối (delay 450ms ở flip) bắt đầu trước,
  // rồi câu khen mới xếp hàng đọc nối sau — không bị cắt ngang.
  setTimeout(praise, 550);
  const again = el("button", { class: "btn-big", onclick: start }, "🔄 Chơi lại");
  boardWrap.appendChild(el("div", { class: "center" }, [again]));
}

initPage();
buildLayout();
start();
