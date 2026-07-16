// ===========================================================================
// ui.js — Helper dùng chung cho mọi trang:
//   - el()            : tạo phần tử DOM gọn
//   - ROOT            : tiền tố đường dẫn về thư mục gốc (xử lý trang trong /games/)
//   - pictureEl()     : ô hình ảnh có FALLBACK emoji khi thiếu file ảnh
//   - openLearnModal(): thẻ học to (ảnh + EN + VI + loa, tự đọc EN)
//   - celebrate()     : hiệu ứng khen khi làm đúng
//   - toast()         : thông báo nhỏ
//   - initPage()      : đăng ký service worker + mở khoá TTS + nối nút Home/Back
// ===========================================================================

import {
  speak,
  speakEn,
  speakVi,
  unlockSpeech,
  hasVietnameseVoice,
  isSpeaking,
  getVoiceSettings,
  saveVoiceSettings,
  resetVoiceSettings,
  listEnglishVoices,
  onVoicesChanged,
  DEFAULT_SETTINGS,
} from "./speak.js";

// Trang nằm trong /games/ thì cần lùi 1 cấp để về gốc.
const inGames = location.pathname.replace(/\\/g, "/").includes("/games/");
export const ROOT = inGames ? "../" : "./";

// Tạo phần tử DOM: el("div", {class:"x", onclick:fn}, [child|string])
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "dataset") {
      Object.assign(node.dataset, v);
    } else {
      node.setAttribute(k, v);
    }
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

// Ô hình ảnh: hiển thị emoji trước, nếu tải được file ảnh thật thì thay bằng ảnh.
// Nhờ vậy không bao giờ có "ảnh vỡ", và thêm ảnh sau là tự dùng.
export function pictureEl(word, { className = "" } = {}) {
  const wrap = el("div", { class: `pic ${className}`.trim() });
  const emoji = el("span", { class: "pic-emoji", "aria-hidden": "true", text: word.emoji || "❓" });
  wrap.appendChild(emoji);

  if (word.image) {
    const img = el("img", { class: "pic-img", alt: word.en, loading: "lazy" });
    img.style.display = "none";
    img.addEventListener("load", () => {
      img.style.display = "";
      emoji.style.display = "none";
    });
    img.addEventListener("error", () => img.remove());
    img.src = ROOT + word.image; // word.image là đường dẫn tương đối gốc
    wrap.appendChild(img);
  }
  return wrap;
}

// ---- Thẻ học to (modal) --------------------------------------------------
let modalEl = null;

export function openLearnModal(word) {
  closeLearnModal();

  const pic = pictureEl(word, { className: "pic-lg" });

  const speakerBtn = el(
    "button",
    { class: "btn-speak", "aria-label": "Đọc lại", onclick: () => speakEn(word.en) },
    "🔊"
  );

  const viRow = el("div", { class: "learn-vi-row" }, [
    el("span", { class: "learn-vi", text: word.vi }),
  ]);
  // Nếu thiết bị có giọng tiếng Việt -> thêm nút đọc VI.
  if (hasVietnameseVoice()) {
    viRow.appendChild(
      el("button", { class: "btn-speak btn-speak-sm", "aria-label": "Đọc tiếng Việt", onclick: () => speakVi(word.vi) }, "🔈")
    );
  }

  const card = el("div", { class: "learn-card", role: "dialog", "aria-modal": "true" }, [
    el("button", { class: "modal-close", "aria-label": "Đóng", onclick: closeLearnModal }, "✕"),
    pic,
    el("div", { class: "learn-en-row" }, [
      el("h2", { class: "learn-en", text: word.en }),
      speakerBtn,
    ]),
    viRow,
  ]);

  modalEl = el("div", { class: "modal-overlay", onclick: (e) => { if (e.target === modalEl) closeLearnModal(); } }, [card]);
  document.body.appendChild(modalEl);
  // animation vào
  requestAnimationFrame(() => modalEl.classList.add("show"));

  // Tự đọc tiếng Anh khi mở thẻ.
  speakEn(word.en);

  // Đóng bằng phím Esc.
  document.addEventListener("keydown", onEsc);
}

function onEsc(e) {
  if (e.key === "Escape") closeLearnModal();
}

export function closeLearnModal() {
  document.removeEventListener("keydown", onEsc);
  if (modalEl) {
    modalEl.remove();
    modalEl = null;
  }
}

// ---- Theme (giao diện: màu sắc + layout) -----------------------------------
const THEME_KEY = "engweb-theme";

export const THEMES = [
  { id: "candy", name: "Kẹo hồng", emoji: "🍭", dots: ["#ff5fa2", "#ffd6e8", "#fef6ff"] },
  { id: "ocean", name: "Biển xanh", emoji: "🌊", dots: ["#00a8cf", "#cdeeff", "#e0f5ff"] },
  { id: "forest", name: "Khu rừng", emoji: "🌿", dots: ["#5da05e", "#e2f1cf", "#f4f9ec"] },
  { id: "night", name: "Ban đêm", emoji: "🌙", dots: ["#ff7ab8", "#3b3b60", "#17172c"] },
  { id: "sunset", name: "Hoàng hôn", emoji: "🌅", dots: ["#ff7043", "#ffe3c9", "#fff3e0"] },
  { id: "unicorn", name: "Kỳ lân", emoji: "🦄", dots: ["#bf5ae0", "#ffd9f0", "#f6ecff"] },
];

export function getTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return THEMES.some((x) => x.id === t) ? t : "candy";
  } catch (_) {
    return "candy";
  }
}

export function applyTheme(id) {
  // Theme mặc định = không có attribute (giữ nguyên :root gốc).
  if (id === "candy") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", id);
}

export function saveTheme(id) {
  try {
    localStorage.setItem(THEME_KEY, id);
  } catch (_) {}
  applyTheme(id);
}

// Áp dụng theme đã lưu ngay khi nạp module (trước khi trang render).
applyTheme(getTheme());

// ---- Modal cài đặt giọng đọc ----------------------------------------------
let settingsEl = null;

export function openSettingsModal() {
  closeSettingsModal();
  closeLearnModal();

  const s = getVoiceSettings();

  // Dropdown giọng tiếng Anh ("" = tự động chọn).
  const voiceSelect = el("select", {
    class: "set-select",
    id: "setVoice",
    onchange: () => saveVoiceSettings({ voiceURI: voiceSelect.value }),
  });
  function fillVoices() {
    const current = getVoiceSettings().voiceURI;
    voiceSelect.innerHTML = "";
    voiceSelect.appendChild(el("option", { value: "", text: "Tự động" }));
    for (const v of listEnglishVoices()) {
      voiceSelect.appendChild(
        el("option", { value: v.voiceURI, text: `${v.name} (${v.lang})` })
      );
    }
    voiceSelect.value = current;
    // Giọng đã lưu không còn trên thiết bị -> hiển thị "Tự động".
    if (voiceSelect.value !== current) voiceSelect.value = "";
  }
  fillVoices();
  onVoicesChanged(() => { if (voiceSelect.isConnected) fillVoices(); });

  // Thanh trượt: tạo hàng (label + range + số hiển thị).
  function sliderRow(labelText, id, min, max, value, key) {
    const out = el("span", { class: "set-val", text: value.toFixed(2) });
    const range = el("input", {
      type: "range", class: "set-range", id,
      min: String(min), max: String(max), step: "0.05", value: String(value),
      oninput: () => {
        const n = parseFloat(range.value);
        out.textContent = n.toFixed(2);
        saveVoiceSettings({ [key]: n });
      },
    });
    return {
      row: el("div", { class: "set-row" }, [
        el("label", { class: "set-label", for: id, text: labelText }),
        el("div", { class: "set-control" }, [range, out]),
      ]),
      range,
      out,
    };
  }

  const rateRow = sliderRow("🐢 Tốc độ", "setRate", 0.5, 1.3, s.rate, "rate");
  const pitchRow = sliderRow("🎵 Cao độ", "setPitch", 0.7, 1.4, s.pitch, "pitch");

  const testBtn = el(
    "button",
    { class: "btn-big set-test", onclick: () => speakEn("Hello! Nice to meet you!") },
    "🔊 Nghe thử"
  );
  const resetBtn = el("button", {
    class: "btn-big set-reset",
    onclick: () => {
      resetVoiceSettings();
      voiceSelect.value = "";
      rateRow.range.value = String(DEFAULT_SETTINGS.rate);
      rateRow.out.textContent = DEFAULT_SETTINGS.rate.toFixed(2);
      pitchRow.range.value = String(DEFAULT_SETTINGS.pitch);
      pitchRow.out.textContent = DEFAULT_SETTINGS.pitch.toFixed(2);
      saveTheme("candy");
      themeGrid.querySelectorAll(".theme-opt").forEach((b, i) => {
        b.classList.toggle("active", THEMES[i].id === "candy");
      });
      toast("Đã về mặc định");
    },
  }, "↩️ Mặc định");

  // Ô chọn theme: bấm là đổi giao diện ngay + lưu.
  const themeGrid = el("div", { class: "theme-grid" });
  for (const t of THEMES) {
    const dots = el("div", { class: "theme-dots" }, t.dots.map((c) => {
      const s = el("span");
      s.style.background = c;
      return s;
    }));
    const btn = el(
      "button",
      {
        class: "theme-opt" + (getTheme() === t.id ? " active" : ""),
        onclick: () => {
          saveTheme(t.id);
          themeGrid.querySelectorAll(".theme-opt").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        },
      },
      [el("span", { text: `${t.emoji} ${t.name}` }), dots]
    );
    themeGrid.appendChild(btn);
  }

  // CỔNG PHỤ HUYNH -> hộp mật khẩu (đúng PARENT_PASS mới sang admin quản lý vé).
  // Cần lối vào từ TRONG app vì PWA trên iPhone không có thanh địa chỉ +
  // localStorage tách biệt với Safari (chỉnh vé từ Safari app không nhận).
  // CÓ 2 CÁCH MỞ cho chắc ăn trên mọi máy:
  //   1) GIỮ ĐÈ 3 giây vào tiêu đề "⚙️ Cài đặt" (thanh gradient chạy báo tiến trình)
  //   2) CHẠM NHANH 5 lần vào tiêu đề
  // Vì mở hộp rồi vẫn phải nhập mật khẩu nên đây chỉ là "hiện hộp", bé không phá được.
  //
  // LƯU Ý iOS: tiêu đề nằm trong .settings-card cuộn được -> khi chạm-giữ, iOS
  // hay bắn pointercancel/touchcancel để "thăm dò cuộn" -> TUYỆT ĐỐI KHÔNG dùng
  // các sự kiện cancel đó để huỷ bộ đếm (đó là thứ từng giết timer làm cổng
  // không mở trên PWA). Chỉ huỷ khi thả tay (touchend/pointerup) hoặc nhích tay
  // đi quá ngưỡng (người dùng thực sự cuộn). Chạm nhanh dùng 'click' cho ổn định.
  const setTitle = el("h2", { class: "set-title", text: "⚙️ Cài đặt" });
  let holdTimer = null;
  let startXY = null;
  let taps = 0;
  let tapTimer = null;

  const cancelHold = () => {
    setTitle.classList.remove("holding");
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    startXY = null;
  };
  const openGate = () => {
    cancelHold();
    taps = 0;
    clearTimeout(tapTimer);
    openParentGate();
  };
  const beginHold = (x, y) => {
    if (holdTimer) return; // pointer + touch có thể cùng bắn -> chỉ 1 bộ đếm
    startXY = { x, y };
    setTitle.classList.add("holding");
    holdTimer = setTimeout(openGate, 3000);
  };
  const moveHold = (x, y) => {
    // Nhích > 12px coi như cuộn/kéo -> huỷ giữ (để bé vẫn cuộn modal bình thường).
    if (startXY && Math.hypot(x - startXY.x, y - startXY.y) > 12) cancelHold();
  };

  setTitle.addEventListener("contextmenu", (e) => e.preventDefault());
  // Lối 2: chạm nhanh 5 lần (click chạy ổn định trên mọi trình duyệt/PWA).
  setTitle.addEventListener("click", () => {
    taps++;
    clearTimeout(tapTimer);
    if (taps >= 5) return openGate();
    tapTimer = setTimeout(() => { taps = 0; }, 1500);
  });
  // Chuột (desktop): pointer events.
  setTitle.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") beginHold(e.clientX, e.clientY); });
  setTitle.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") moveHold(e.clientX, e.clientY); });
  setTitle.addEventListener("pointerup", (e) => { if (e.pointerType === "mouse") cancelHold(); });
  // Cảm ứng (iOS/Android): touch events — KHÔNG bắt *cancel.
  setTitle.addEventListener("touchstart", (e) => { const t = e.touches[0]; if (t) beginHold(t.clientX, t.clientY); }, { passive: true });
  setTitle.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) moveHold(t.clientX, t.clientY); }, { passive: true });
  setTitle.addEventListener("touchend", cancelHold);

  const card = el("div", { class: "learn-card settings-card", role: "dialog", "aria-modal": "true" }, [
    el("button", { class: "modal-close", "aria-label": "Đóng", onclick: closeSettingsModal }, "✕"),
    setTitle,
    el("div", { class: "set-row" }, [
      el("label", { class: "set-label", text: "🎨 Giao diện" }),
      themeGrid,
    ]),
    el("div", { class: "set-row" }, [
      el("label", { class: "set-label", for: "setVoice", text: "🗣️ Giọng tiếng Anh" }),
      voiceSelect,
    ]),
    rateRow.row,
    pitchRow.row,
    el("div", { class: "set-actions" }, [testBtn, resetBtn]),
  ]);

  settingsEl = el(
    "div",
    { class: "modal-overlay", onclick: (e) => { if (e.target === settingsEl) closeSettingsModal(); } },
    [card]
  );
  document.body.appendChild(settingsEl);
  requestAnimationFrame(() => settingsEl.classList.add("show"));
  document.addEventListener("keydown", onEscSettings);
}

// Bước 2 của cổng phụ huynh (sau khi giữ 3s): hộp nhập MẬT KHẨU — đúng mới
// sang trang admin. Bàn phím số (inputmode) cho dễ gõ trên điện thoại.
const PARENT_PASS = "300890";

function openParentGate() {
  const input = el("input", {
    class: "gate-input",
    type: "password",
    inputmode: "numeric",
    autocomplete: "off",
    placeholder: "Mật khẩu",
    "aria-label": "Mật khẩu phụ huynh",
  });
  const tryOpen = () => {
    if (input.value === PARENT_PASS) {
      location.href = ROOT + "admin.html";
    } else {
      buzz(80);
      toast("Sai mật khẩu rồi!");
      input.value = "";
      input.focus();
    }
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryOpen();
  });
  const overlay = el(
    "div",
    { class: "modal-overlay", onclick: (e) => { if (e.target === overlay) overlay.remove(); } },
    [
      el("div", { class: "learn-card gate-card", role: "dialog", "aria-modal": "true" }, [
        el("button", { class: "modal-close", "aria-label": "Đóng", onclick: () => overlay.remove() }, "✕"),
        el("h2", { class: "set-title", text: "👨‍👩‍👧 Phụ huynh" }),
        input,
        el("button", { class: "btn-big", onclick: tryOpen }, "🔓 Mở trang quản lý"),
      ]),
    ]
  );
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.classList.add("show");
    input.focus();
  });
}

function onEscSettings(e) {
  if (e.key === "Escape") closeSettingsModal();
}

export function closeSettingsModal() {
  document.removeEventListener("keydown", onEscSettings);
  if (settingsEl) {
    settingsEl.remove();
    settingsEl = null;
  }
}

// ---- Phản hồi tích cực ---------------------------------------------------

// Rung nhẹ (Android hỗ trợ; iOS bỏ qua êm).
export function buzz(ms = 30) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch (_) {}
}

// Hiệu ứng "pháo hoa" emoji bay lên khi làm đúng.
export function celebrate() {
  const icons = ["⭐", "🎉", "✨", "🌟", "🎈", "💫"];
  const layer = el("div", { class: "celebrate" });
  for (let i = 0; i < 14; i++) {
    const s = el("span", { class: "confetti", text: icons[i % icons.length] });
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 18 + Math.random() * 26 + "px";
    s.style.animationDelay = Math.random() * 0.25 + "s";
    s.style.animationDuration = 0.9 + Math.random() * 0.8 + "s";
    layer.appendChild(s);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 2000);
}

// ---- Âm thanh hiệu ứng (WebAudio, không cần file, chạy offline) ------------
let audioCtx = null;

// Tạo/đánh thức AudioContext. Gọi lần đầu trong cú chạm của người dùng
// (initPage lo việc này) để iOS cho phép phát tiếng.
function getAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

// Kèn "wah wah waaah" đi xuống khi thua — buồn nhưng vui nhộn, không đáng sợ.
export function loseSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.02;
    // 3 nốt tụt dần; nốt cuối kéo dài và trượt xuống thêm cho "não nề".
    const notes = [
      { f: 415, at: 0, dur: 0.28 },
      { f: 370, at: 0.32, dur: 0.28 },
      { f: 311, at: 0.64, dur: 0.8, slideTo: 233 },
    ];
    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.f, t0 + n.at);
      if (n.slideTo) osc.frequency.linearRampToValueAtTime(n.slideTo, t0 + n.at + n.dur);
      // Vào/ra êm để không bị "click".
      gain.gain.setValueAtTime(0, t0 + n.at);
      gain.gain.linearRampToValueAtTime(0.22, t0 + n.at + 0.04);
      gain.gain.setValueAtTime(0.22, t0 + n.at + n.dur - 0.1);
      gain.gain.linearRampToValueAtTime(0, t0 + n.at + n.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + n.at);
      osc.stop(t0 + n.at + n.dur + 0.05);
    }
  } catch (_) {
    /* Không có WebAudio thì thôi, thua vẫn hiện màn hình bình thường. */
  }
}

// Phát một chuỗi nốt ngắn — nền cho các hiệu ứng vui (ghép đúng, combo, thẻ sao...).
// notes: [{ f: tần số Hz, at: bắt đầu (giây), dur: độ dài, slideTo?: trượt tới Hz }]
function playNotes(notes, { type = "sine", vol = 0.2 } = {}) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.02;
    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(n.f, t0 + n.at);
      if (n.slideTo) osc.frequency.linearRampToValueAtTime(n.slideTo, t0 + n.at + n.dur);
      // Vào/ra êm để không bị "click".
      gain.gain.setValueAtTime(0, t0 + n.at);
      gain.gain.linearRampToValueAtTime(vol, t0 + n.at + 0.02);
      gain.gain.setValueAtTime(vol, t0 + n.at + Math.max(0.03, n.dur - 0.06));
      gain.gain.linearRampToValueAtTime(0, t0 + n.at + n.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + n.at);
      osc.stop(t0 + n.at + n.dur + 0.05);
    }
  } catch (_) {}
}

// "Ting-ting" gọn khi ghép đúng một cặp.
export function matchSound() {
  playNotes(
    [
      { f: 523, at: 0, dur: 0.12 },
      { f: 784, at: 0.12, dur: 0.22 },
    ],
    { vol: 0.16 }
  );
}

// Hợp âm chạy lên khi combo — combo càng cao tông càng cao cho "nóng máy".
export function comboSound(level = 2) {
  const base = 440 * Math.pow(1.12, Math.min(level, 6));
  playNotes(
    [
      { f: base, at: 0, dur: 0.1 },
      { f: base * 1.25, at: 0.09, dur: 0.1 },
      { f: base * 1.5, at: 0.18, dur: 0.1 },
      { f: base * 2, at: 0.27, dur: 0.28 },
    ],
    { type: "triangle", vol: 0.18 }
  );
}

// Chuông lấp lánh khi tìm được cặp ngôi sao may mắn.
export function starSound() {
  playNotes(
    [
      { f: 1047, at: 0, dur: 0.12 },
      { f: 1319, at: 0.1, dur: 0.12 },
      { f: 1568, at: 0.2, dur: 0.12 },
      { f: 2093, at: 0.3, dur: 0.4 },
      { f: 1568, at: 0.42, dur: 0.3 },
    ],
    { type: "triangle", vol: 0.15 }
  );
}

// Kèn fanfare "ta-da-da-daaa" chúc mừng chiến thắng lớn (về đích bản đồ...).
export function victorySound() {
  playNotes(
    [
      { f: 523, at: 0, dur: 0.14 },
      { f: 523, at: 0.16, dur: 0.14 },
      { f: 523, at: 0.32, dur: 0.14 },
      { f: 659, at: 0.48, dur: 0.34 },
      { f: 523, at: 0.86, dur: 0.16 },
      { f: 659, at: 1.04, dur: 0.5 },
      { f: 784, at: 1.3, dur: 0.7 },
    ],
    { type: "triangle", vol: 0.2 }
  );
  // Lớp chuông lấp lánh phủ lên trên cho lộng lẫy.
  playNotes(
    [
      { f: 1568, at: 1.35, dur: 0.15 },
      { f: 2093, at: 1.52, dur: 0.15 },
      { f: 2637, at: 1.69, dur: 0.4 },
    ],
    { vol: 0.1 }
  );
}

// Tiếng VỖ TAY rào rào (~4.5s): dựng bằng nhiễu trắng — mỗi "tiếng vỗ" là một
// xung nhiễu tắt nhanh, rải ngẫu nhiên dày đặc rồi lọc band-pass cho giống tay vỗ.
export function applauseSound(duration = 4.5) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * duration);
    const buf = ctx.createBuffer(1, len, rate);
    const data = buf.getChannelData(0);
    const claps = Math.floor(duration * 26); // ~26 tiếng vỗ mỗi giây (cả "khán phòng")
    for (let c = 0; c < claps; c++) {
      const start = Math.floor(Math.random() * (len - rate * 0.06));
      const clapLen = Math.floor(rate * (0.015 + Math.random() * 0.03));
      const amp = 0.12 + Math.random() * 0.3;
      for (let i = 0; i < clapLen; i++) {
        data[start + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / (clapLen * 0.35));
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1900;
    bp.Q.value = 0.7;
    const g = ctx.createGain();
    const t0 = ctx.currentTime + 0.05;
    // Vào nhanh, giữ, rồi nhỏ dần ở giây cuối cho tự nhiên.
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.6, t0 + 0.25);
    g.gain.setValueAtTime(0.6, t0 + duration - 1);
    g.gain.linearRampToValueAtTime(0, t0 + duration);
    src.connect(bp);
    bp.connect(g);
    g.connect(ctx.destination);
    src.start(t0);
  } catch (_) {}
}

// Kèn fanfare DÀI 3 bè (~3.4s) + điệp khúc chốt hạ ở giây ~4.8 — chỉ dùng cho
// megaCelebrate, hoành tráng hơn hẳn victorySound() của mini game.
function grandFanfare() {
  // Bè kèn chính: chủ đề "ta-da-da-daaa" mở rộng, kết ở nốt cao ngân dài.
  playNotes(
    [
      { f: 523, at: 0, dur: 0.14 },
      { f: 523, at: 0.16, dur: 0.14 },
      { f: 523, at: 0.32, dur: 0.14 },
      { f: 659, at: 0.48, dur: 0.34 },
      { f: 523, at: 0.86, dur: 0.16 },
      { f: 659, at: 1.04, dur: 0.34 },
      { f: 784, at: 1.42, dur: 0.5 },
      { f: 659, at: 1.96, dur: 0.18 },
      { f: 784, at: 2.16, dur: 0.18 },
      { f: 1047, at: 2.36, dur: 1.0 },
    ],
    { type: "triangle", vol: 0.2 }
  );
  // Bè trầm đỡ bên dưới cho "dày tiếng" như ban nhạc thật.
  playNotes(
    [
      { f: 131, at: 0, dur: 0.44 },
      { f: 196, at: 0.48, dur: 0.5 },
      { f: 131, at: 1.04, dur: 0.44 },
      { f: 196, at: 1.42, dur: 0.5 },
      { f: 262, at: 2.36, dur: 1.0 },
    ],
    { type: "sine", vol: 0.22 }
  );
  // Chuông lấp lánh phủ trên nốt kết.
  playNotes(
    [
      { f: 1568, at: 2.4, dur: 0.15 },
      { f: 2093, at: 2.58, dur: 0.15 },
      { f: 2637, at: 2.76, dur: 0.5 },
    ],
    { vol: 0.1 }
  );
  // Điệp khúc CHỐT HẠ chạy lên (khớp đợt pháo hoa cuối ~giây 5).
  playNotes(
    [
      { f: 784, at: 4.8, dur: 0.12 },
      { f: 1047, at: 4.94, dur: 0.12 },
      { f: 1319, at: 5.08, dur: 0.12 },
      { f: 1568, at: 5.22, dur: 0.9 },
    ],
    { type: "triangle", vol: 0.18 }
  );
  playNotes([{ f: 392, at: 4.8, dur: 1.3 }], { type: "sine", vol: 0.18 });
}

// Tiếng PHÁO HOA thật: mỗi quả = tiếng rít bay lên + tiếng "ĐÙNG" trầm
// (nhiễu trắng lọc lowpass, tắt dần) — rải suốt màn ăn mừng.
function fireworkSoundShow(times = [0.9, 2.1, 3.3, 4.3, 5.3]) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    for (const t of times) {
      // Tiếng rít vút lên...
      playNotes([{ f: 350, at: t, dur: 0.45, slideTo: 1100 }], { vol: 0.06 });
      // ...rồi "ĐÙNG" sau 0.5s.
      const dur = 0.6;
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.18));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 420;
      const g = ctx.createGain();
      g.gain.value = 0.55;
      src.connect(lp).connect(g).connect(ctx.destination);
      src.start(ctx.currentTime + t + 0.5);
    }
  } catch (_) {}
}

// Ăn mừng HOÀNH TRÁNG (về đích lâu đài...): chớp sáng vàng mở màn + kèn fanfare
// dài 3 bè + VỖ TAY + pháo hoa CÓ TIẾNG ĐÙNG + mưa sao dày, kéo dài ~7 giây,
// kết bằng ĐỢT PHÁO CUỐI nổ dồn to nhất. Hơn hẳn celebrate() của mini game.
export function megaCelebrate() {
  grandFanfare();
  applauseSound(7);
  fireworkSoundShow();

  const layer = el("div", { class: "celebrate mega" });

  // Chớp sáng vàng loé lên mở màn.
  layer.appendChild(el("span", { class: "mega-flash", "aria-hidden": "true" }));

  // Mưa sao + confetti rơi dày suốt ~7 giây (có 👑 cho đúng chất lâu đài).
  const rain = ["⭐", "🌟", "✨", "🎉", "🎊", "💫", "🌠", "🎈", "👑"];
  for (let i = 0; i < 110; i++) {
    const s = el("span", { class: "confetti", text: rain[i % rain.length] });
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 26 + Math.random() * 42 + "px";
    s.style.animationDelay = Math.random() * 5.2 + "s";
    s.style.animationDuration = 1.3 + Math.random() * 1.1 + "s";
    layer.appendChild(s);
  }
  // Pháo hoa nổ tại chỗ rải đều suốt ~6 giây.
  const bursts = ["🎆", "💥", "🎇", "✨"];
  for (let i = 0; i < 24; i++) {
    const b = el("span", { class: "burst", text: bursts[i % bursts.length] });
    b.style.left = 5 + Math.random() * 90 + "vw";
    b.style.top = 8 + Math.random() * 70 + "vh";
    b.style.fontSize = 46 + Math.random() * 58 + "px";
    b.style.animationDelay = i * 0.22 + "s";
    layer.appendChild(b);
  }
  // ĐỢT CUỐI: 8 quả CỰC TO nổ dồn dập từ giây ~5.2 — cao trào rồi mới hạ màn.
  for (let i = 0; i < 8; i++) {
    const b = el("span", { class: "burst finale", text: i % 2 ? "🎆" : "💥" });
    b.style.left = 5 + Math.random() * 90 + "vw";
    b.style.top = 8 + Math.random() * 65 + "vh";
    b.style.fontSize = 90 + Math.random() * 70 + "px";
    b.style.animationDelay = 5.2 + i * 0.15 + "s";
    layer.appendChild(b);
  }

  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 7800);
}

// Tiếng ma trêu "u-u-hi-hi" khi thẻ ma tráo bài.
export function ghostSound() {
  playNotes(
    [
      { f: 260, at: 0, dur: 0.35, slideTo: 420 },
      { f: 440, at: 0.4, dur: 0.11 },
      { f: 490, at: 0.54, dur: 0.11 },
      { f: 540, at: 0.68, dur: 0.2 },
    ],
    { vol: 0.2 }
  );
}

// "Boop-boop" trung tính — dùng khi hòa (oẳn tù tì...), không vui không buồn.
export function drawSound() {
  playNotes(
    [
      { f: 440, at: 0, dur: 0.14 },
      { f: 440, at: 0.2, dur: 0.14 },
    ],
    { type: "triangle", vol: 0.16 }
  );
}

// "Tèn... tèn..." tụt ngắn khi thua MỘT LƯỢT nhỏ (oẳn tù tì) —
// nhẹ hơn kèn loseSound() dành cho thua cả ván.
export function sadSound() {
  playNotes(
    [
      { f: 330, at: 0, dur: 0.18 },
      { f: 262, at: 0.22, dur: 0.4, slideTo: 215 },
    ],
    { vol: 0.2 }
  );
}

// Câu khen tiếng Anh ngẫu nhiên: luôn hiện toast; spoken = true thì đọc to
// (dùng append để câu khen đọc TIẾP SAU từ vựng vừa đọc, không cắt ngang).
const PRAISES = ["Good job!", "Great!", "Excellent!", "Well done!", "Amazing!", "Perfect!", "Super!", "You did it!"];

export function praise({ spoken = true } = {}) {
  const p = PRAISES[Math.floor(Math.random() * PRAISES.length)];
  toast(`${p} 🎉`);
  if (!spoken) return Promise.resolve();
  // mood happy: đọc kiểu reo vui (cao + nhanh hơn giọng thường).
  return speak(p, { lang: "en-US", append: true, mood: "happy" });
}

// Thông báo nhỏ giữa màn hình.
export function toast(msg, ms = 1200) {
  const t = el("div", { class: "toast", text: msg });
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 250);
  }, ms);
}

// ---- Khởi tạo trang ------------------------------------------------------

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  // SW nằm ở gốc -> kiểm soát toàn bộ app.
  navigator.serviceWorker.register(ROOT + "sw.js").catch(() => {
    /* Không có https/localhost thì bỏ qua êm (vẫn chạy được, chỉ thiếu offline-cache). */
  });
}

// Gọi 1 lần ở đầu mỗi trang.
// onSpeechReady: (tuỳ chọn) gọi sau lần chạm đầu tiên — lúc TTS vừa được mở
// khoá. Trình duyệt chặn TTS trước khi người dùng tương tác, nên câu đọc lúc
// mới vào trang bị nuốt; game truyền callback này để ĐỌC LẠI câu hỏi hiện tại.
export function initPage(onSpeechReady) {
  registerServiceWorker();

  // Mở khoá TTS + WebAudio trong lần chạm/nhấn đầu tiên (bắt buộc cho iOS).
  const unlock = () => {
    unlockSpeech();
    getAudioCtx();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    // Chờ một nhịp cho engine sẵn sàng sau cú cancel() trong unlockSpeech.
    // Nếu cú chạm đầu tiên đã kích hoạt tiếng đọc khác (vd: chạm trả lời
    // luôn) thì thôi, không đọc đè lên.
    if (typeof onSpeechReady === "function") {
      setTimeout(() => {
        if (!isSpeaking()) onSpeechReady();
      }, 150);
    }
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });

  // Nối các nút điều hướng dùng data-attribute.
  document.querySelectorAll("[data-home]").forEach((node) => {
    node.setAttribute("href", ROOT + "index.html");
  });
  document.querySelectorAll("[data-back]").forEach((node) => {
    node.addEventListener("click", (e) => {
      e.preventDefault();
      if (history.length > 1) history.back();
      else location.href = ROOT + "index.html";
    });
  });
  document.querySelectorAll("[data-settings]").forEach((node) => {
    node.addEventListener("click", (e) => {
      e.preventDefault();
      openSettingsModal();
    });
  });
}

// Tiện cho game: phát âm tiếng Anh ngắn gọn.
export { speak, speakEn, speakVi };
