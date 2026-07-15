// ===========================================================================
// common.js — Helper dùng chung cho các mini game (thanh chọn chủ đề / độ khó).
// ===========================================================================

import { CATEGORIES } from "../data.js";
import { el, buzz, loseSound, toast, celebrate, victorySound, speak } from "../ui.js";

// ---- Vé oẳn tù tì (tiền tệ chung của cả app) --------------------------------
// Chơi xong MỘT LẦN ở game bất kỳ -> cộng vé theo độ khó (dễ 1 / vừa 2 / khó 3;
// game không phân độ khó = 1). Vé đem tiêu ở game tổng "Phiêu lưu đến lâu đài":
// mỗi lượt oẳn tù tì với Siêu nhân Rô bốt tốn 1 vé.
const TICKETS_KEY = "engweb-rps-tickets";

export function getTickets() {
  try {
    const n = parseInt(localStorage.getItem(TICKETS_KEY), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch (_) {
    return 0;
  }
}

function setTickets(n) {
  try {
    localStorage.setItem(TICKETS_KEY, String(Math.max(0, n)));
  } catch (_) {}
}

// Cộng vé + toast báo cho bé biết. Gọi khi kết thúc một lần chơi.
export function awardTickets(n) {
  setTickets(getTickets() + n);
  toast(`🎫 +${n} lượt oẳn tù tì! (đang có ${getTickets()})`, 2200);
}

// Trừ vé khi vào đấu oẳn tù tì. Trả về false nếu không đủ (không trừ gì).
export function spendTickets(n) {
  const have = getTickets();
  if (have < n) return false;
  setTickets(have - n);
  return true;
}

// Thanh chip lựa chọn (chủ đề, độ khó...). Trả về { bar, get() }.
export function chipPicker(options, currentId, onSelect) {
  const bar = el("div", { class: "picker" });
  let current = currentId;
  const buttons = [];
  for (const o of options) {
    const b = el("button", {
      class: "chip" + (o.id === current ? " active" : ""),
      text: o.label,
      onclick: () => {
        current = o.id;
        buttons.forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        onSelect(o.id);
      },
    });
    buttons.push(b);
    bar.appendChild(b);
  }
  return { bar, get: () => current };
}

// Thanh chọn chủ đề ("Tất cả" + từng chủ đề).
// exclude: danh sách id chủ đề cần ẩn (game nào không hợp chủ đề đó).
export function categoryPicker(onSelect, { exclude = [] } = {}) {
  const opts = [{ id: "all", label: "🌈 Tất cả" }];
  for (const c of CATEGORIES) {
    if (!exclude.includes(c.id)) opts.push({ id: c.id, label: `${c.emoji} ${c.vi}` });
  }
  return chipPicker(opts, "all", onSelect);
}

// ---- Hệ mạng sống (tim) ---------------------------------------------------
// Sai 1 lần mất 1 tim; hết tim là thua. Còn 1 tim thì tim đập + viền màn hình
// đỏ nhẹ cho kịch tính. Trả về { bar, reset(), hit() -> số tim còn lại }.
export function livesWidget(count = 3, onDead) {
  const bar = el("span", { class: "lives", "aria-label": "Mạng còn lại" });
  let remaining = count;

  function render() {
    bar.innerHTML = "";
    for (let i = 0; i < count; i++) {
      bar.appendChild(el("span", { class: "life" + (i >= remaining ? " lost" : ""), text: i < remaining ? "❤️" : "🤍" }));
    }
    bar.classList.toggle("last-one", remaining === 1);
    document.body.classList.toggle("danger", remaining === 1);
  }

  function reset() {
    remaining = count;
    render();
  }

  function hit() {
    if (remaining <= 0) return 0;
    remaining--;
    render();
    // Tim vừa mất "vỡ" ra một nhịp rồi mới thành tim trắng.
    const broken = bar.children[remaining];
    broken.textContent = "💔";
    broken.classList.add("breaking");
    setTimeout(() => { broken.textContent = "🤍"; broken.classList.remove("breaking"); }, 700);
    buzz(remaining === 0 ? 200 : 80);
    if (remaining === 0) {
      document.body.classList.remove("danger");
      if (typeof onDead === "function") onDead();
    }
    return remaining;
  }

  render();
  return { bar, reset, hit };
}

// Màn thua nhẹ nhàng: khuyến khích + hiện điểm + nút chơi lại.
const LOSE_MSGS = [
  "Suýt được rồi! Thử lại nhé 💪",
  "Không sao đâu, làm lại nào! 🌈",
  "Cố lên, lần này sẽ được! 🚀",
  "Bé giỏi lắm, chơi thêm lần nữa nha! 🌟",
];

const LOSE_SPEAKS = ["Oh no! Try again!", "Almost! One more time!", "Don't give up!"];

export function loseScreen({ scoreText, onRetry }) {
  loseSound(); // kèn buồn "wah wah waaah" lúc màn thua hiện ra
  // Đọc câu động viên bằng ngữ điệu "xịu xuống" — chờ kèn buồn xong mới đọc.
  const say = LOSE_SPEAKS[Math.floor(Math.random() * LOSE_SPEAKS.length)];
  setTimeout(() => speak(say, { lang: "en-US", mood: "sad" }), 1700);
  const msg = LOSE_MSGS[Math.floor(Math.random() * LOSE_MSGS.length)];
  const kids = [
    el("div", { class: "lose-emoji", text: "💔" }),
    el("div", { class: "lose-title", text: "Ôi, hết tim mất rồi!" }),
    el("div", { class: "lose-msg", text: msg }),
  ];
  if (scoreText) kids.push(el("div", { class: "lose-score", text: scoreText }));
  kids.push(el("button", { class: "btn-big", onclick: onRetry }, "🔄 Chơi lại"));
  return el("div", { class: "lose-screen center" }, kids);
}

// Màn THẮNG cho các game có mốc điểm (đạt đủ sao là thắng): kèn fanfare +
// pháo hoa + CỘNG VÉ oẳn tù tì theo độ khó. Vé chỉ phát khi THẮNG — thua
// thì chỉ có màn động viên, không có vé.
const WIN_SPEAKS = ["You win! Hooray!", "Fantastic! You did it!", "Yay! You are a star!"];

export function winScreen({ scoreText, tickets, onRetry }) {
  victorySound();
  celebrate();
  awardTickets(tickets);
  // Đọc câu chúc mừng bằng ngữ điệu reo vui — chờ kèn fanfare xong mới đọc.
  const say = WIN_SPEAKS[Math.floor(Math.random() * WIN_SPEAKS.length)];
  setTimeout(() => speak(say, { lang: "en-US", mood: "happy" }), 2100);
  const kids = [
    el("div", { class: "lose-emoji", text: "🏆" }),
    el("div", { class: "lose-title", text: "Bé thắng rồi! 🎉" }),
  ];
  if (scoreText) kids.push(el("div", { class: "lose-score", text: scoreText }));
  kids.push(el("div", { class: "win-tickets", text: `🎫 +${tickets} lượt oẳn tù tì!` }));
  kids.push(el("button", { class: "btn-big", onclick: onRetry }, "🔄 Chơi lại"));
  return el("div", { class: "lose-screen win-screen center" }, kids);
}

// ---- Thanh đếm ngược (chế độ tính giờ) -------------------------------------
// Thanh cạn dần từ 100% -> 0%; chuyển vàng khi còn nửa, đỏ khi sắp hết.
// Trả về { bar, start(seconds), stop() }. Hết giờ gọi onTimeout.
export function timerBar(onTimeout) {
  const fill = el("div", { class: "timer-fill" });
  const bar = el("div", { class: "timerbar" }, [fill]);
  bar.hidden = true;
  let timer = null;
  let endAt = 0;
  let total = 0;

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    bar.hidden = true;
  }

  function start(seconds) {
    stop();
    total = seconds * 1000;
    endAt = Date.now() + total;
    bar.hidden = false;
    fill.style.width = "100%";
    fill.classList.remove("warn", "crit");
    timer = setInterval(() => {
      const left = Math.max(0, endAt - Date.now());
      fill.style.width = (left / total) * 100 + "%";
      fill.classList.toggle("warn", left < total * 0.5);
      fill.classList.toggle("crit", left < total * 0.25);
      if (left <= 0) {
        stop();
        onTimeout();
      }
    }, 100);
  }

  return { bar, start, stop };
}
