// ===========================================================================
// adventure.js — GAME TỔNG "Phiêu lưu đến lâu đài" (trang riêng, to nhất menu):
//   1) Chơi CÁC GAME KHÁC để tích luỹ 🎫 lượt oẳn tù tì
//      (dễ 1 / vừa 2 / khó 3; game không phân độ khó = 1 — xem common.js).
//   2) Vào đây tiêu vé: chọn "Oẳn tù tì 1 lượt" (1🎫) hoặc "3 lượt" (3🎫);
//      không đủ vé thì nút mờ đi.
//   3) Mỗi lượt oẳn tù tì THẮNG Siêu nhân Rô bốt = bé đi 1 bước trên bản đồ.
//   4) Đi hết bản đồ (MAP_LEN bước tới lâu đài 🏰) -> ăn mừng hoành tráng:
//      pháo hoa + vỗ tay + kèn chúc mừng + câu khen đọc to.
// Tiến độ + vé lưu localStorage — tắt app mở lại vẫn giữ nguyên.
// ===========================================================================

import {
  initPage, el, speak, speakEn, celebrate, megaCelebrate, toast, buzz,
  matchSound, drawSound, sadSound, starSound,
} from "../ui.js";
import { getTickets, spendTickets } from "./common.js";

const app = document.getElementById("app");

// ---- Cấu hình bản đồ (chỉnh ở đây khi muốn thay đổi luật) -------------------
const MAP_KEY = "engweb-memory-map"; // GIỮ NGUYÊN tên key qua các phiên bản!
const MAP_LEN = 20; // số bước để tới lâu đài
// Đường đi kiểu cờ tỷ phú: các ĐIỂM DỪNG có cảnh (ô to) cách nhau 3 BƯỚC ĐI
// chấm tròn nhỏ. Vị trí 0 = nhà, MAP_LEN = lâu đài (ô đặc biệt, to phát sáng).
// LƯU Ý bố cục: 21 vị trí / 7 cột = đúng 3 hàng đầy, hàng cuối đi xuôi nên
// lâu đài nằm sát RÌA PHẢI dưới cùng. Nếu đổi MAP_LEN/COLS, muốn giữ lâu đài
// ở rìa phải thì cần: MAP_LEN % COLS === COLS - 1 và floor(MAP_LEN/COLS) chẵn.
const STOP_POS = [0, 4, 8, 12, 16]; // vị trí các điểm dừng; lâu đài luôn ở MAP_LEN
// Các BỘ CẢNH theo chủ đề — thắng xong bấm "Phiêu lưu bản đồ mới" là random
// một bộ KHÁC bộ hiện tại (riêng lâu đài 🏰 giữ nguyên). Mỗi bộ đúng 5 icon
// theo thứ tự STOP_POS: xuất phát -> 4 cảnh trên đường.
const SCENE_SETS = [
  { name: "Đồng quê", icons: ["🏠", "🌳", "🌉", "🦄", "🌈"] },
  { name: "Sa mạc", icons: ["⛺", "🌵", "🐫", "🏜️", "🌅"] },
  { name: "Biển đảo", icons: ["⛵", "🐚", "🐬", "🏝️", "🌊"] },
  { name: "Rừng núi", icons: ["🛖", "🌲", "🍄", "🦌", "⛰️"] },
  { name: "Vũ trụ", icons: ["🚀", "🌙", "👽", "🪐", "⭐"] },
  { name: "Xứ tuyết", icons: ["🏠", "❄️", "⛄", "🐧", "🎿"] },
];
const SCENES_KEY = "engweb-memory-map-scenes"; // bộ cảnh đang dùng (lưu cùng tiến độ)
const COLS = 7; // số cột của đường zic-zac (hàng chẵn đi xuôi, hàng lẻ đi ngược)
// 2 lựa chọn tiêu vé ở màn chính.
const RPS_OPTIONS = [
  { tries: 1, label: "✊ Oẳn tù tì 1 lượt" },
  { tries: 3, label: "🔥 Oẳn tù tì 3 lượt" },
];

function getSceneIdx() {
  try {
    const n = parseInt(localStorage.getItem(SCENES_KEY), 10);
    return Number.isFinite(n) && SCENE_SETS[n] ? n : 0;
  } catch (_) {
    return 0;
  }
}
// Random một bộ cảnh KHÁC bộ hiện tại — gọi khi bắt đầu phiêu lưu mới.
function pickNewSceneSet() {
  const cur = getSceneIdx();
  let next = Math.floor(Math.random() * (SCENE_SETS.length - 1));
  if (next >= cur) next++; // né đúng bộ đang dùng
  try {
    localStorage.setItem(SCENES_KEY, String(next));
  } catch (_) {}
}
// Chỉ dùng ở trang test=win: xem trước một bộ cảnh mà KHÔNG ghi localStorage
// (bản đồ thật của bé giữ nguyên). null = dùng bộ cảnh đã lưu như bình thường.
let previewSceneIdx = null;

// Bảng "vị trí -> icon" của ván hiện tại (lâu đài cố định ở cuối).
function currentStops() {
  const idx = previewSceneIdx !== null ? previewSceneIdx : getSceneIdx();
  const set = SCENE_SETS[idx].icons;
  const stops = { [MAP_LEN]: "🏰" };
  STOP_POS.forEach((p, i) => {
    stops[p] = set[i];
  });
  return stops;
}

// ---- Lưu / đọc tiến độ ------------------------------------------------------
function getStep() {
  try {
    const n = parseInt(localStorage.getItem(MAP_KEY), 10);
    return Number.isFinite(n) ? Math.max(0, Math.min(n, MAP_LEN)) : 0;
  } catch (_) {
    return 0;
  }
}
function saveStep(n) {
  try {
    localStorage.setItem(MAP_KEY, String(n));
  } catch (_) {}
}

// ---- Oẳn tù tì --------------------------------------------------------------
const RPS = [
  { id: "rock", emoji: "✊", beats: "scissors" },
  { id: "paper", emoji: "✋", beats: "rock" },
  { id: "scissors", emoji: "✌️", beats: "paper" },
];

// Trình duyệt CHẶN âm thanh trước cú chạm đầu tiên. Cờ này cho biết người dùng
// đã chạm trang chưa — màn victory dựa vào đó để "ăn mừng lại" khi có tiếng được.
let userInteracted = false;
window.addEventListener("pointerdown", () => { userInteracted = true; }, { once: true, capture: true });

// ---- Đường kẻ nối các ô (SVG "bản đồ kho báu") ------------------------------
const SVG_NS = "http://www.w3.org/2000/svg";

// Dựng chuỗi path SVG đi qua các điểm, BO CONG ở chỗ đổi hướng (khúc quẹo).
function roundedPath(pts, radius) {
  if (pts.length < 2) return "";
  const f = (n) => Math.round(n * 10) / 10;
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1], p = pts[i], next = pts[i + 1];
    const v1 = { x: p.x - prev.x, y: p.y - prev.y };
    const v2 = { x: next.x - p.x, y: next.y - p.y };
    const l1 = Math.hypot(v1.x, v1.y), l2 = Math.hypot(v2.x, v2.y);
    // Ba điểm thẳng hàng -> đi thẳng qua, chỉ bo cong khi thật sự đổi hướng.
    if (Math.abs(v1.x * v2.y - v1.y * v2.x) < 0.01) {
      d += ` L ${f(p.x)} ${f(p.y)}`;
      continue;
    }
    const r1 = Math.min(radius, l1 / 2), r2 = Math.min(radius, l2 / 2);
    const a = { x: p.x - (v1.x / l1) * r1, y: p.y - (v1.y / l1) * r1 };
    const b = { x: p.x + (v2.x / l2) * r2, y: p.y + (v2.y / l2) * r2 };
    d += ` L ${f(a.x)} ${f(a.y)} Q ${f(p.x)} ${f(p.y)} ${f(b.x)} ${f(b.y)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${f(last.x)} ${f(last.y)}`;
  return d;
}

// Vẽ (hoặc vẽ lại) đường nối phía SAU các ô: lớp nét đứt mờ = cả lộ trình,
// lớp nét liền xanh = đoạn bé đã đi qua. Gọi sau khi .map-path đã vào DOM.
function drawTrail(container, step) {
  const old = container.querySelector(".map-trail-svg");
  if (old) old.remove();

  const nodes = [...container.children].filter(
    (n) => n.classList.contains("map-tile") || n.classList.contains("map-dot")
  );
  const box = container.getBoundingClientRect();
  if (!box.width || nodes.length < 2) return;

  // Tâm từng ô, theo toạ độ tương đối với .map-path.
  const pts = nodes.map((n) => {
    const r = n.getBoundingClientRect();
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
  });

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "map-trail-svg");
  svg.setAttribute("viewBox", `0 0 ${Math.round(box.width)} ${Math.round(box.height)}`);

  const base = document.createElementNS(SVG_NS, "path");
  base.setAttribute("class", "map-trail");
  base.setAttribute("d", roundedPath(pts, 18));
  svg.appendChild(base);

  if (step > 0) {
    const done = document.createElementNS(SVG_NS, "path");
    done.setAttribute("class", "map-trail-done");
    done.setAttribute("d", roundedPath(pts.slice(0, step + 1), 18));
    svg.appendChild(done);
  }
  container.prepend(svg);
}

// Chế độ TEST (?test=win): vào thẳng màn lâu đài, KHÔNG lưu bước / KHÔNG tốn vé.
const testParam = new URLSearchParams(location.search).get("test");
const testMode = testParam !== null;

// Tiêu đề bản đồ đổi theo BỘ CẢNH đang chơi (icon xuất phát + tên cảnh).
function mapTitle() {
  const idx = previewSceneIdx !== null ? previewSceneIdx : getSceneIdx();
  const s = SCENE_SETS[idx];
  return `${s.icons[0]} Vượt ${s.name} tới lâu đài 🏰`;
}

// ---- Màn 1: BẢN ĐỒ + VÉ -----------------------------------------------------
function renderMap() {
  const step = getStep();
  app.innerHTML = "";
  app.appendChild(el("h2", { class: "map-title center", text: mapTitle() }));

  app.appendChild(mapGridEl(step));

  if (step >= MAP_LEN) return renderVictory();

  const tickets = getTickets();
  app.appendChild(el("div", { class: "ticket-bar", text: `🎫 Lượt oẳn tù tì đang có: ${tickets}` }));
  app.appendChild(
    el("p", { class: "lead", text: "Chơi các trò chơi khác để kiếm lượt 🎫, rồi về đây oẳn tù tì với Siêu nhân Rô bốt — mỗi lần thắng là đi 1 bước tới lâu đài!" })
  );
  const btns = el("div", { class: "map-actions" });
  for (const opt of RPS_OPTIONS) {
    const enough = tickets >= opt.tries;
    const b = el("button", { class: "btn-big map-level", onclick: () => startRps(opt.tries) }, [
      el("span", { text: opt.label }),
      el("small", { text: enough ? `Tốn ${opt.tries} 🎫` : `Cần ${opt.tries} 🎫 — chưa đủ` }),
    ]);
    b.disabled = !enough; // không đủ vé -> nút mờ, không bấm được
    btns.appendChild(b);
  }
  app.appendChild(btns);
}

// Bấm nút oẳn: trừ vé rồi vào màn đấu (test thì miễn phí).
function startRps(tries) {
  if (!testMode && !spendTickets(tries)) {
    toast("Chưa đủ lượt — chơi game để kiếm thêm nhé! 🎫", 1800);
    renderMap();
    return;
  }
  renderRps(tries);
}

// Vẽ đường đi: điểm dừng = ô cảnh to, bước đi = chấm tròn; bé 🦸 đứng ở vị trí
// hiện tại. Đường xếp ZIC-ZAC như bàn cờ: hàng chẵn đi xuôi, hàng lẻ đi ngược
// để lối đi liền mạch; lâu đài (ô cuối) to và phát sáng nổi bật.
function mapGridEl(step) {
  const stops = currentStops();
  const path = el("div", { class: "map-path" });
  for (let i = 0; i <= MAP_LEN; i++) {
    const isStop = stops[i] != null;
    const state = (i < step ? " done" : "") + (i === step ? " current" : "");
    const castle = i === MAP_LEN ? " castle" : "";
    const node = el("div", { class: (isStop ? "map-tile" : "map-dot") + castle + state });
    if (isStop) node.appendChild(el("span", { class: "map-scene", text: stops[i] }));
    if (i === step) node.appendChild(el("span", { class: "map-char", text: "🦸" }));
    else if (isStop && i < step) node.appendChild(el("span", { class: "map-check", text: "✔️" }));

    const row = Math.floor(i / COLS);
    const pos = i % COLS;
    node.style.gridRowStart = row + 1;
    node.style.gridColumnStart = (row % 2 === 0 ? pos : COLS - 1 - pos) + 1;
    path.appendChild(node);
  }

  // Vẽ đường nối sau khi các ô đã vào DOM (renderMap append xong mới tới rAF),
  // và tự vẽ lại khi đổi cỡ màn hình / xoay ngang dọc.
  requestAnimationFrame(() => drawTrail(path, step));
  if (window.ResizeObserver) {
    new ResizeObserver(() => drawTrail(path, step)).observe(path);
  }
  return path;
}

// ---- Màn 2: OẲN TÙ TÌ với Siêu nhân Rô bốt ----------------------------------
function renderRps(tries) {
  let left = tries; // số lượt còn lại
  let won = 0; // số lần thắng -> số bước đi
  let busy = false;

  const robotFace = el("div", { class: "rps-robot", text: "🤖" });
  const triesEl = el("div", { class: "rps-tries" });
  const resultEl = el("div", { class: "rps-result", text: "Chọn ✊ ✋ hoặc ✌️ nào!" });
  const optsEl = el("div", { class: "rps-opts" });

  function updateTries() {
    triesEl.textContent = `Lượt còn lại: ${"🎫".repeat(left)}${left === 0 ? "—" : ""}  •  Thắng: ${won} bước`;
  }

  for (const opt of RPS) {
    optsEl.appendChild(el("button", { class: "rps-btn", "aria-label": opt.id, onclick: () => play(opt) }, opt.emoji));
  }

  // Bảng kết quả to, mỗi kết quả một màu/biểu tượng riêng cho bé phân biệt:
  // thắng = xanh 🏆, hòa = vàng 🤝, thua = đỏ nhạt 🤖.
  // Kèm MẶT CẢM XÚC to đùng để bé chưa biết đọc vẫn hiểu ngay kết quả.
  const FACES = { win: "😆", draw: "😐", lose: "😢" };
  function showResult(kind, mine, bot, icon, text) {
    resultEl.className = `rps-result ${kind}`;
    resultEl.innerHTML = "";
    resultEl.appendChild(el("div", { class: "rps-vs", text: `Bé ${mine.emoji}   ⚡   ${bot.emoji} Rô bốt` }));
    resultEl.appendChild(el("div", { class: "rps-face", text: FACES[kind] }));
    resultEl.appendChild(el("div", { class: "rps-verdict", text: `${icon} ${text}` }));
  }
  function resetResult(text) {
    resultEl.className = "rps-result";
    resultEl.textContent = text;
  }

  function play(mine) {
    if (busy || left <= 0) return;
    busy = true;
    resetResult("Oẳn... tù... tì!");
    robotFace.classList.add("rps-shake");
    buzz(30);

    setTimeout(() => {
      robotFace.classList.remove("rps-shake");
      const bot = RPS[Math.floor(Math.random() * RPS.length)];
      robotFace.textContent = bot.emoji;

      let draw = false;
      let sentence; // câu tiếng Anh đọc to kết quả — bé học luôn win/tie/lose
      if (mine.id === bot.id) {
        // Hòa -> chơi lại, KHÔNG mất lượt.
        draw = true;
        showResult("draw", mine, bot, "🤝", "Hòa rồi! Oẳn lại nào");
        drawSound();
        sentence = "Thien ties with Super Robot!";
      } else if (mine.beats === bot.id) {
        won++;
        left--;
        showResult("win", mine, bot, "🏆", "Bé thắng! +1 bước");
        matchSound();
        celebrate();
        sentence = "Thien beats Super Robot!";
      } else {
        left--;
        showResult("lose", mine, bot, "🤖", "Rô bốt thắng lần này!");
        robotFace.classList.add("rps-happy"); // rô bốt nhún nhảy khoái chí
        sadSound();
        buzz(80);
        sentence = "Thien loses to Super Robot!";
      }
      updateTries();

      // Chờ tiếng hiệu ứng vang nhịp đầu (400ms) -> đọc câu kết quả ->
      // ĐỌC XONG mới cho oẳn tiếp. Máy không có giọng đọc (promise về ngay)
      // thì vẫn dừng tối thiểu 2-2.6s để bé kịp nhìn kết quả.
      // QUAN TRỌNG (iOS Safari): speechSynthesis nhiều khi KHÔNG bắn onend ->
      // promise đọc treo mãi -> finishRps không chạy -> kẹt màn ott, không về
      // bản đồ. Chặn tối đa 3.5s: đọc xong sớm thì tốt, treo thì vẫn đi tiếp.
      const spoken = new Promise((done) => {
        let settled = false;
        const finish = () => { if (!settled) { settled = true; done(); } };
        setTimeout(() => speakEn(sentence).then(finish, finish), 400);
        setTimeout(finish, 3500); // van an toàn cho iOS
      });
      const minWait = new Promise((done) => setTimeout(done, draw ? 2000 : 2600));
      Promise.all([spoken, minWait]).then(() => {
        // Nghỉ một nhịp ngắn sau câu nói rồi mới quay lại.
        setTimeout(() => {
          robotFace.textContent = "🤖";
          robotFace.classList.remove("rps-happy");
          busy = false;
          if (left <= 0) finishRps(won);
          else resetResult("Chọn ✊ ✋ hoặc ✌️ nào!");
        }, 350);
      });
    }, 900);
  }

  updateTries();
  app.innerHTML = "";
  app.appendChild(el("div", { class: "rps-box center" }, [
    el("h2", { class: "map-title", text: "Oẳn tù tì với Siêu nhân Rô bốt!" }),
    robotFace,
    resultEl,
    optsEl,
    triesEl,
  ]));
}

// ---- Sau oẳn tù tì: đi bước trên bản đồ (hoạt cảnh bé bay từng ô) ------------
function finishRps(won) {
  const from = getStep();
  const to = Math.min(from + won, MAP_LEN);
  // Chế độ test: xem đủ hoạt cảnh đi bước nhưng KHÔNG lưu — bản đồ thật giữ nguyên.
  if (!testMode) saveStep(to);
  else toast("🧪 Chế độ test — không lưu bước", 1800);

  if (to === from) {
    renderMap();
    toast("Chưa đi được bước nào, chơi tiếp nhé! 💪", 1600);
    return;
  }

  // Màn "đang đi": chỉ tiêu đề + bản đồ ở vị trí CŨ, không nút bấm —
  // để bé tập trung xem hoạt cảnh, xong mới về màn bản đồ đầy đủ.
  app.innerHTML = "";
  app.appendChild(el("h2", { class: "map-title center", text: mapTitle() }));
  app.appendChild(mapGridEl(from));
  app.appendChild(el("p", { class: "lead", text: `Bé Thiên tiến ${to - from} bước! 🎉` }));

  setTimeout(
    () =>
      animateWalk(from, to, () => {
        if (to >= MAP_LEN) renderVictory();
        else renderMap();
      }),
    600
  );
}

// Bé 🦸 BAY VỒNG CUNG từng ô một: ô thường "ting" nhẹ, đáp xuống ĐIỂM DỪNG
// (ô cảnh to) thì ô nảy tưng + toé sao ✨ + chuông lấp lánh, nghỉ lâu hơn chút.
function animateWalk(from, to, done) {
  const stops = currentStops();
  let cur = from;

  const pathNodes = () => {
    const path = app.querySelector(".map-path");
    if (!path) return null;
    return {
      path,
      nodes: [...path.children].filter((n) => n.classList.contains("map-tile") || n.classList.contains("map-dot")),
    };
  };

  function hopNext() {
    const found = pathNodes();
    if (!found) return; // người dùng rời màn hình giữa chừng -> dừng êm
    const { path, nodes } = found;
    const nodeA = nodes[cur];
    const nodeB = nodes[cur + 1];
    if (!nodeA || !nodeB) return;

    // Tạo "bé đang bay" tại tâm ô cũ, đích là tâm ô mới (CSS var --dx/--dy).
    const box = path.getBoundingClientRect();
    const ra = nodeA.getBoundingClientRect();
    const rb = nodeB.getBoundingClientRect();
    const walker = el("span", { class: "map-walker", "aria-hidden": "true", text: "🦸" });
    walker.style.left = ra.left + ra.width / 2 - box.left + "px";
    walker.style.top = ra.top + ra.height / 2 - box.top + "px";
    walker.style.setProperty("--dx", rb.left + rb.width / 2 - (ra.left + ra.width / 2) + "px");
    walker.style.setProperty("--dy", rb.top + rb.height / 2 - (ra.top + ra.height / 2) + "px");
    // Trong lúc bay thì bé đứng ở ô cũ biến mất (chính là 1 đứa thôi mà!).
    const standing = path.querySelector(".map-char");
    if (standing) standing.remove();
    path.appendChild(walker);

    // 560ms = thời lượng animation charLeap bên CSS.
    setTimeout(() => {
      cur++;
      const isStop = stops[cur] != null || cur === MAP_LEN;
      buzz(isStop ? 60 : 30);
      const p2 = app.querySelector(".map-path");
      if (p2) p2.replaceWith(mapGridEl(cur));
      if (isStop) landOnStop(cur);
      else matchSound();

      if (cur < to) setTimeout(hopNext, isStop ? 700 : 240);
      else setTimeout(done, isStop ? 1000 : 800);
    }, 560);
  }

  hopNext();
}

// Hiệu ứng đáp xuống điểm dừng: ô nảy tưng + 6 ngôi sao ✨ toé ra + chuông.
function landOnStop(idx) {
  starSound();
  const found = app.querySelector(".map-path");
  if (!found) return;
  const nodes = [...found.children].filter((n) => n.classList.contains("map-tile") || n.classList.contains("map-dot"));
  const tile = nodes[idx];
  if (!tile) return;
  tile.classList.add("stop-land");
  for (let i = 0; i < 6; i++) {
    const s = el("span", { class: "tile-spark", "aria-hidden": "true", text: "✨" });
    s.style.setProperty("--sx", Math.cos((i / 6) * Math.PI * 2) * 36 + "px");
    s.style.setProperty("--sy", Math.sin((i / 6) * Math.PI * 2) * 36 + "px");
    s.style.animationDelay = i * 0.04 + "s";
    tile.appendChild(s);
  }
  setTimeout(() => tile.classList.remove("stop-land"), 900);
}

// ---- Màn 3: VỀ ĐÍCH — ăn mừng hoành tráng ------------------------------------
function renderVictory() {
  app.innerHTML = "";
  app.appendChild(mapGridEl(MAP_LEN));

  const panel = el("div", { class: "map-victory center" }, [
    el("div", { class: "victory-cup", text: "🏆" }),
    el("h2", { class: "map-title", text: "Bé đã tới lâu đài! Tuyệt vời!" }),
    el("p", { class: "lead", text: "Cả vương quốc chúc mừng bé! 👑" }),
  ]);

  if (!testMode) {
    // Phiêu lưu mới = về vạch xuất phát + đổi sang bộ cảnh khác cho mới mẻ.
    panel.appendChild(
      el("button", { class: "btn-big", onclick: () => { saveStep(0); pickNewSceneSet(); renderMap(); } }, "🔄 Phiêu lưu bản đồ mới")
    );
  } else {
    // Chế độ test: xem lại ăn mừng (âm thanh cần cú chạm đầu tiên mới phát)
    // + danh sách các bản đồ để XEM TRƯỚC từng bộ cảnh (không lưu gì).
    panel.appendChild(
      el("button", { class: "btn-big", onclick: celebrateVictory }, "🔁 Xem lại ăn mừng (test)")
    );
    panel.appendChild(el("h2", { class: "section-title center", text: "🗺️ Xem trước các bản đồ" }));
    const list = el("div", { class: "scene-list" });
    SCENE_SETS.forEach((s, i) => {
      const chip = el("button", { class: "chip", onclick: () => previewScene(i, list, chip) }, `${s.icons[0]} ${s.name}`);
      list.appendChild(chip);
    });
    panel.appendChild(list);
  }

  app.appendChild(panel);
  celebrateVictory();

  // Màn victory hiện NGAY LÚC TẢI TRANG (test=win, hoặc bé thắng hôm trước rồi
  // hôm sau mở lại app) -> chưa có cú chạm nào -> đợt ăn mừng trên bị trình
  // duyệt chặn tiếng. Chờ cú chạm đầu tiên rồi ăn mừng lại cho có âm thanh.
  if (!userInteracted) {
    window.addEventListener(
      "pointerdown",
      (e) => {
        setTimeout(() => {
          // Chỉ ăn mừng lại nếu vẫn đang ở màn victory và cú chạm không phải
          // là bấm nút (nút replay/xem bản đồ tự lo phần của nó).
          if (app.querySelector(".victory-cup") && !e.target.closest("button")) celebrateVictory();
        }, 200);
      },
      { once: true }
    );
  }
}

// Pháo hoa + kèn + câu chúc mừng — gom một chỗ để gọi lại được.
// Nhịp màn ăn mừng ~7s: kèn fanfare mở màn ~1.5s -> đọc lời chúc ->
// giây ~4.2 nối thêm câu tung hô (append để không cắt câu trước),
// khớp với đợt pháo hoa cuối nổ dồn ở giây ~5.
function celebrateVictory() {
  megaCelebrate();
  setTimeout(() => speak("Congratulations! You did it! Amazing!", { mood: "happy" }), 1500);
  setTimeout(() => speak("Thien is the champion! Hooray!", { append: true, mood: "happy" }), 4200);
}

// Trang test=win: xem trước một bộ cảnh NGAY TẠI CHỖ — chỉ thay bản đồ phía
// trên, không chuyển màn. Vẽ ở vạch xuất phát cho rõ cảnh (màn victory mọi ô
// đều bị làm mờ "đã đi qua"). Không ghi localStorage.
function previewScene(i, list, chip) {
  previewSceneIdx = i;
  const path = app.querySelector(".map-path");
  if (path) path.replaceWith(mapGridEl(0));
  list.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
}

initPage();
// Lối tắt TEST (không lưu bước): ?test=win -> màn ăn mừng lâu đài + xem trước
// các bản đồ. (Test ott dùng trang admin tăng vé rồi chơi thật.)
if (testParam === "win") {
  renderVictory();
} else {
  renderMap();
}
