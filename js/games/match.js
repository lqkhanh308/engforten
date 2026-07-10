// ===========================================================================
// Nối hình với từ: bấm 1 hình rồi bấm từ tiếng Anh tương ứng để nối.
// Tap-based (không kéo-thả) cho bé dễ thao tác.
// ===========================================================================

import { wordsOf, sample, shuffle } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, buzz, toast } from "../ui.js";
import { categoryPicker, chipPicker } from "./common.js";

const app = document.getElementById("app");

let pool = wordsOf("all");
let count = 4;
let selected = null; // { el, word, side }
let done = 0;

const picker = categoryPicker((id) => {
  pool = wordsOf(id);
  start();
});
const sizePicker = chipPicker(
  [
    { id: 4, label: "4 cặp" },
    { id: 5, label: "5 cặp" },
    { id: 6, label: "6 cặp" },
  ],
  4,
  (n) => {
    count = n;
    start();
  }
);

const boardWrap = el("div", {});

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(picker.bar);
  app.appendChild(sizePicker.bar);
  app.appendChild(el("p", { class: "lead", text: "Bấm 1 hình rồi bấm từ đúng để nối!" }));
  app.appendChild(boardWrap);
}

function start() {
  selected = null;
  done = 0;

  const n = Math.min(count, pool.length);
  if (n < 2) {
    toast("Chủ đề này quá ít từ");
    return;
  }
  const words = sample(pool, n);

  const leftCol = el("div", { class: "match-col" }); // hình ảnh
  const rightCol = el("div", { class: "match-col" }); // từ tiếng Anh

  for (const w of shuffle(words)) {
    const item = el("button", { class: "match-item" }, [pictureEl(w)]);
    item._word = w;
    item._side = "pic";
    item.addEventListener("click", () => choose(item));
    leftCol.appendChild(item);
  }
  for (const w of shuffle(words)) {
    const item = el("button", { class: "match-item", text: w.en });
    item._word = w;
    item._side = "word";
    item.addEventListener("click", () => choose(item));
    rightCol.appendChild(item);
  }

  const board = el("div", { class: "match-board" }, [leftCol, rightCol]);
  boardWrap.innerHTML = "";
  boardWrap.appendChild(board);
}

function clearSelection() {
  if (selected) selected.el.classList.remove("selected");
  selected = null;
}

function choose(item) {
  if (item.classList.contains("done")) return;
  speakEn(item._word.en);

  // Chưa chọn gì -> chọn item này.
  if (!selected) {
    selected = { el: item, word: item._word, side: item._side };
    item.classList.add("selected");
    return;
  }

  // Bấm lại đúng item đang chọn -> bỏ chọn.
  if (selected.el === item) {
    clearSelection();
    return;
  }

  // Bấm cùng cột -> chuyển lựa chọn sang item mới.
  if (selected.side === item._side) {
    clearSelection();
    selected = { el: item, word: item._word, side: item._side };
    item.classList.add("selected");
    return;
  }

  // Khác cột -> kiểm tra ghép cặp.
  if (selected.word.id === item._word.id) {
    item.classList.add("done");
    selected.el.classList.add("done");
    selected.el.classList.remove("selected");
    selected = null;
    done++;
    speakEn(item._word.en);
    if (done === Math.min(count, pool.length)) win();
  } else {
    buzz(40);
    const a = selected.el;
    a.classList.add("wrong");
    item.classList.add("wrong");
    setTimeout(() => {
      a.classList.remove("wrong", "selected");
      item.classList.remove("wrong");
    }, 450);
    selected = null;
  }
}

function win() {
  celebrate();
  toast("Nối đúng hết rồi! 🎉", 1600);
  const again = el("button", { class: "btn-big", onclick: start }, "🔄 Chơi lại");
  boardWrap.appendChild(el("div", { class: "center" }, [again]));
}

initPage();
buildLayout();
start();
