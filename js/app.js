// ===========================================================================
// app.js — Trang chủ: lưới chủ đề + menu mini game, và màn học từ vựng.
// Bấm vào 1 hình -> mở thẻ học to (EN + VI + tự đọc).
// ===========================================================================

import { CATEGORIES, wordsOf } from "./data.js";
import { initPage, el, pictureEl, openLearnModal } from "./ui.js";

const app = document.getElementById("app");
const titleEl = document.getElementById("title");
const backBtn = document.getElementById("backBtn");

const GAMES = [
  { href: "games/tap-picture.html", emoji: "👆", name: "Chọn đúng hình" },
  { href: "games/memory.html", emoji: "🃏", name: "Lật thẻ tìm cặp" },
  { href: "games/match.html", emoji: "🔗", name: "Nối hình với từ" },
  { href: "games/quiz.html", emoji: "❓", name: "Đố vui" },
];

// ---- Màn hình: Trang chủ -------------------------------------------------
function renderHome() {
  titleEl.textContent = "🎈 Bé Học Tiếng Anh";
  backBtn.hidden = true;
  app.innerHTML = "";

  app.appendChild(el("p", { class: "lead", text: "Chọn một chủ đề để học — bấm vào hình để nghe và xem nghĩa." }));

  // Lưới chủ đề
  const grid = el("div", { class: "grid" });
  for (const cat of CATEGORIES) {
    grid.appendChild(
      el("button", { class: "card", onclick: () => renderCategory(cat.id) }, [
        el("div", { class: "pic" }, [el("span", { class: "pic-emoji", text: cat.emoji })]),
        el("div", { class: "label-en", text: cat.en }),
        el("div", { class: "label-vi", text: cat.vi }),
      ])
    );
  }
  app.appendChild(grid);

  // Menu mini game
  app.appendChild(el("h2", { class: "section-title", text: "🎮 Trò chơi" }));
  const menu = el("div", { class: "menu" });
  for (const g of GAMES) {
    menu.appendChild(
      el("a", { href: g.href }, [
        el("span", { class: "game-emoji", text: g.emoji }),
        el("span", { text: g.name }),
      ])
    );
  }
  app.appendChild(menu);
}

// ---- Màn hình: Một chủ đề (lưới từ vựng) ---------------------------------
function renderCategory(catId) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  if (!cat) return renderHome();

  titleEl.textContent = `${cat.emoji} ${cat.vi}`;
  backBtn.hidden = false;
  app.innerHTML = "";

  app.appendChild(el("p", { class: "lead", text: "Bấm vào hình để nghe phát âm và xem nghĩa." }));

  const grid = el("div", { class: "grid" });
  for (const word of wordsOf(catId)) {
    grid.appendChild(
      el("button", { class: "card", onclick: () => openLearnModal(word) }, [
        pictureEl(word),
        el("div", { class: "label-en", text: word.en }),
        el("div", { class: "label-vi", text: word.vi }),
      ])
    );
  }
  app.appendChild(grid);
}

// ---- Khởi tạo ------------------------------------------------------------
backBtn.addEventListener("click", (e) => {
  e.preventDefault();
  renderHome();
});

initPage();
renderHome();
