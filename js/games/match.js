// ===========================================================================
// Nối hình với từ: bấm 1 hình rồi bấm từ tiếng Anh tương ứng để nối.
// Tap-based (không kéo-thả) cho bé dễ thao tác.
// ===========================================================================

import { wordsOf, sample, shuffle } from "../data.js";
import { initPage, el, pictureEl, speakEn, celebrate, toast, praise } from "../ui.js";
import { categoryPicker, chipPicker, livesWidget, loseScreen, awardTickets } from "./common.js";

const app = document.getElementById("app");

let pool = wordsOf("all");
let count = 4;
let selected = null; // { el, word, side }
let done = 0;
let locked = false;

const picker = categoryPicker((id) => {
  pool = wordsOf(id);
  start();
});
const sizePicker = chipPicker(
  [
    { id: 4, label: "4 cặp" },
    { id: 6, label: "6 cặp" },
    { id: 10, label: "10 cặp" },
  ],
  4,
  (n) => {
    count = n;
    start();
  }
);

// Hết tim -> khoá bảng, chờ một nhịp cho bé thấy tim vỡ rồi mới hiện màn thua.
const lives = livesWidget(3, () => {
  locked = true;
  setTimeout(lose, 700);
});
const boardWrap = el("div", {});

function buildLayout() {
  app.innerHTML = "";
  app.appendChild(picker.bar);
  app.appendChild(sizePicker.bar);
  app.appendChild(el("div", { class: "scorebar" }, [lives.bar]));
  app.appendChild(el("p", { class: "lead", text: "Bấm 1 hình rồi bấm từ đúng để nối!" }));
  app.appendChild(boardWrap);
}

function lose() {
  boardWrap.innerHTML = "";
  boardWrap.appendChild(loseScreen({ scoreText: `Bé nối được ${done} cặp 🔗`, onRetry: start }));
  awardTickets(count >= 10 ? 3 : count >= 6 ? 2 : 1); // chơi xong 1 bảng -> +vé theo cỡ bảng
}

function start() {
  selected = null;
  done = 0;
  locked = false;
  lives.reset();

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
  if (locked || item.classList.contains("done")) return;
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
    lives.hit(); // nối sai -> mất 1 tim
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
  praise({ spoken: false }); // toast khen tiếng Anh, không đọc
  awardTickets(count >= 10 ? 3 : count >= 6 ? 2 : 1); // nối hết bảng -> +vé theo cỡ bảng
  const again = el("button", { class: "btn-big", onclick: start }, "🔄 Chơi lại");
  boardWrap.appendChild(el("div", { class: "center" }, [again]));
}

initPage();
buildLayout();
start();
