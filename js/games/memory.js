// ===========================================================================
// Lật thẻ tìm cặp (memory): lật 2 thẻ tìm 2 hình giống nhau. Khớp -> đọc từ.
// ===========================================================================

import { wordsOf, sample, shuffle } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, buzz, toast, praise } from "../ui.js";
import { categoryPicker, chipPicker } from "./common.js";

const app = document.getElementById("app");

let pool = wordsOf("all");
let pairs = 4;
let first = null;
let locked = false;
let matched = 0;

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

  const n = Math.min(pairs, pool.length);
  if (n < 2) {
    toast("Chủ đề này quá ít từ");
    return;
  }
  const chosen = sample(pool, n);
  const deck = shuffle([...chosen, ...chosen]); // mỗi từ 2 thẻ

  const grid = el("div", { class: "memory-grid" + (deck.length >= 16 ? " big" : "") });
  for (const w of deck) {
    const back = el("div", { class: "mem-face mem-back", text: "❓" });
    const front = el("div", { class: "mem-face mem-front" }, [pictureEl(w)]);
    const inner = el("div", { class: "mem-inner" }, [back, front]);
    const card = el("button", { class: "mem-card", "aria-label": "Lật thẻ" }, [inner]);
    card._word = w;
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
  // Chờ thẻ lật xong (transition 0.4s) rồi mới đọc từ.
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
      if (matched === Math.min(pairs, pool.length)) win();
    }, 350);
  } else {
    buzz(40);
    setTimeout(() => {
      first.classList.remove("flipped");
      card.classList.remove("flipped");
      first = null;
      locked = false;
    }, 850);
  }
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
