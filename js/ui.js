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
      toast("Đã về mặc định");
    },
  }, "↩️ Mặc định");

  const card = el("div", { class: "learn-card settings-card", role: "dialog", "aria-modal": "true" }, [
    el("button", { class: "modal-close", "aria-label": "Đóng", onclick: closeSettingsModal }, "✕"),
    el("h2", { class: "set-title", text: "⚙️ Cài đặt giọng đọc" }),
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
export function initPage() {
  registerServiceWorker();

  // Mở khoá TTS trong lần chạm/nhấn đầu tiên (bắt buộc cho iOS).
  const unlock = () => {
    unlockSpeech();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
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
