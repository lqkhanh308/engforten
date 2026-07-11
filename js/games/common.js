// ===========================================================================
// common.js — Helper dùng chung cho các mini game (thanh chọn chủ đề / độ khó).
// ===========================================================================

import { CATEGORIES } from "../data.js";
import { el, buzz, loseSound } from "../ui.js";

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

export function loseScreen({ scoreText, onRetry }) {
  loseSound(); // kèn buồn "wah wah waaah" lúc màn thua hiện ra
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
