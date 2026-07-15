// ===========================================================================
// memory-board.js — "ĐỘNG CƠ" bàn lật thẻ, dùng chung cho mọi chế độ chơi
// (chơi thường, phiêu lưu bản đồ...). Chứa toàn bộ luật bàn chơi:
//   - lật 2 thẻ tìm cặp, combo 🔥, cặp thẻ SAO ⭐, thẻ MA 👻 (số lượng do
//     chế độ truyền vào qua start({ ghosts }))
// KHÔNG chứa UI của chế độ (nút chơi lại, thưởng, timer...) — chế độ nào tự lo
// qua callback onWin. Nhờ vậy thêm chế độ mới không phải đụng vào luật bàn chơi.
//
// Cách dùng:
//   const board = createBoard({ onWin: () => {...} });
//   wrap.appendChild(board.el);
//   board.start({ pool, pairs, ghosts, star }); // ván mới (ghosts = số thẻ ma,
//                                               //  star = có cặp thẻ sao không)
//   board.freeze();                 // khoá bảng (vd: hết giờ)
// ===========================================================================

import { sample, shuffle } from "../data.js";
import {
  el, pictureEl, speakEn, celebrate, buzz, toast,
  matchSound, comboSound, starSound, ghostSound,
} from "../ui.js";

// Thẻ đặc biệt (không phải từ vựng).
export const STAR = { id: "__star__", en: "Lucky star!", vi: "Ngôi sao may mắn", emoji: "⭐" };
export const GHOST = { id: "__ghost__", en: "", vi: "Ma nghịch ngợm", emoji: "👻" };

export function createBoard({ onWin } = {}) {
  const root = el("div", {});
  let first = null;
  let locked = false;
  let frozen = false; // khoá cứng từ bên ngoài (hết giờ...)
  let matched = 0;
  let totalPairs = 0;
  let streak = 0; // số cặp ghép đúng liên tiếp -> combo

  function start({ pool, pairs, ghosts = 0, star = true }) {
    first = null;
    locked = false;
    frozen = false;
    matched = 0;
    streak = 0;

    const n = Math.min(pairs, pool.length);
    if (n < 2) {
      toast("Chủ đề này quá ít từ");
      return false;
    }
    const chosen = sample(pool, n);
    // Chế độ truyền vào: star = có thêm 1 cặp thẻ SAO không; ghosts = số thẻ
    // MA (lẻ, không có cặp) — mỗi thẻ ma là một lần bị trêu tráo bài.
    const cards = [...chosen, ...chosen];
    if (star) cards.push(STAR, STAR);
    for (let i = 0; i < ghosts; i++) cards.push(GHOST);
    totalPairs = n + (star ? 1 : 0);
    const deck = shuffle(cards);

    // Bàn nhiều thẻ thì thêm cột cho lùn bớt: huge (>=24 thẻ) / big (17-23 thẻ);
    // riêng bàn 16 thẻ (mức Vừa) xếp vuông vắn đúng 4 hàng x 4 cột.
    const grid = el("div", {
      class: "memory-grid" + (deck.length >= 24 ? " big huge" : deck.length === 16 ? " square4" : deck.length >= 16 ? " big" : ""),
    });
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
    root.innerHTML = "";
    root.appendChild(grid);
    return true;
  }

  function flip(card) {
    if (locked || frozen) return;
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
        if (matched === totalPairs && typeof onWin === "function") onWin();
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
      const hidden = [...root.querySelectorAll(".mem-card")].filter(
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
        // Ruột đổi thì "áo" đổi theo: nền vàng của thẻ SAO phải đi cùng ngôi sao,
        // không thì thẻ thường bị nhuộm vàng còn thẻ sao thật lộ vị trí.
        a.classList.toggle("mem-star", a._word.id === STAR.id);
        b.classList.toggle("mem-star", b._word.id === STAR.id);
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

  function freeze() {
    frozen = true;
  }

  return { el: root, start, freeze };
}
