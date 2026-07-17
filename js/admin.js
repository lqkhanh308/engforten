// ===========================================================================
// admin.js — Trang QUẢN LÝ VÉ 🎫 dành cho PHỤ HUYNH (mở trực tiếp /admin.html,
// không có link trong menu game để bé không tự mò vào).
// Chỉnh số vé oẳn tù tì đang có: cộng/trừ nhanh hoặc đặt thẳng một con số.
// ===========================================================================

import { initPage, el, toast } from "./ui.js";
import { getTickets, setTickets } from "./games/common.js";

const app = document.getElementById("app");

const countEl = el("div", { class: "admin-count" });

function refresh() {
  countEl.textContent = `🎫 ${getTickets()}`;
}

function change(delta) {
  setTickets(getTickets() + delta);
  refresh();
  toast(delta > 0 ? `+${delta} vé` : `${delta} vé`);
}

function setTo(n) {
  setTickets(n);
  refresh();
  toast(`Đã đặt ${getTickets()} vé 🎫`);
}

function quickBtn(label, delta) {
  return el("button", { class: "chip admin-chip", onclick: () => change(delta) }, label);
}

app.appendChild(el("p", { class: "lead", text: "Trang dành cho phụ huynh — chỉnh số 🎫 lượt oẳn tù tì của bé (dùng ở game tổng Phiêu lưu)." }));
app.appendChild(countEl);
app.appendChild(
  el("div", { class: "admin-row" }, [quickBtn("−5", -5), quickBtn("−1", -1), quickBtn("+1", 1), quickBtn("+5", 5)])
);
app.appendChild(
  el("div", { class: "admin-row" }, [
    el("button", { class: "btn-big admin-zero", onclick: () => setTo(0) }, "🗑️ Xoá hết vé (về 0)"),
  ])
);

// ---- Bản đồ Phiêu lưu --------------------------------------------------------
// Key trùng với adventure.js (không import được vì file đó là script của trang,
// import sẽ chạy luôn logic game). Đổi key bên đó thì nhớ đổi ở đây.
const MAP_KEY = "engweb-memory-map";
const SCENES_KEY = "engweb-memory-map-scenes";

function resetMap() {
  try {
    localStorage.removeItem(MAP_KEY);
    localStorage.removeItem(SCENES_KEY);
  } catch (_) {}
  toast("Đã reset bản đồ về vạch xuất phát 🗺️", 1800);
}

app.appendChild(el("h2", { class: "section-title", text: "🗺️ Bản đồ Phiêu lưu" }));
app.appendChild(
  el("div", { class: "admin-row" }, [
    el("button", { class: "btn-big admin-zero", onclick: resetMap }, "↩️ Reset bản đồ về ban đầu"),
  ])
);

// ---- Độ khó oẳn tù tì --------------------------------------------------------
// Trùng KEY + giá trị id với adventure.js. Mức càng dễ, Rô bốt càng hay "nhường"
// để bé thắng nhiều hơn khi oẳn tù tì.
const RPS_LEVEL_KEY = "engweb-rps-level";
const RPS_LEVELS = [
  { id: "easy", label: "🙂 Dễ" },
  { id: "medium", label: "😃 Vừa" },
  { id: "normal", label: "😐 Bình thường" },
];
function getRpsLevel() {
  let v = null;
  try { v = localStorage.getItem(RPS_LEVEL_KEY); } catch (_) {}
  return RPS_LEVELS.some((l) => l.id === v) ? v : "easy"; // mặc định Dễ
}
function setRpsLevel(id) {
  try { localStorage.setItem(RPS_LEVEL_KEY, id); } catch (_) {}
}

const rpsRow = el("div", { class: "admin-row" });
function renderRpsLevel() {
  rpsRow.innerHTML = "";
  const cur = getRpsLevel();
  for (const l of RPS_LEVELS) {
    rpsRow.appendChild(
      el("button", {
        class: "chip admin-chip" + (l.id === cur ? " active" : ""),
        onclick: () => { setRpsLevel(l.id); renderRpsLevel(); toast(`Độ khó: ${l.label}`); },
      }, l.label)
    );
  }
}
renderRpsLevel();

app.appendChild(el("h2", { class: "section-title", text: "🎮 Độ khó oẳn tù tì" }));
app.appendChild(
  el("p", { class: "lead", text: "Mức Dễ: Rô bốt hay nhường để bé thắng nhiều hơn (~80%). Bình thường: chơi công bằng." })
);
app.appendChild(rpsRow);

// ---- Link trang test ----------------------------------------------------------
app.appendChild(el("h2", { class: "section-title", text: "🧪 Trang test (không lưu bước)" }));
app.appendChild(
  el("div", { class: "admin-row admin-links" }, [
    el("a", { class: "btn-big admin-link", href: "games/adventure.html?test=win" }, "🏰 Test màn về đích"),
  ])
);

initPage();
refresh();
