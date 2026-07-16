// ===========================================================================
// speak.js — Đọc từ vựng bằng Web Speech API (TTS có sẵn của trình duyệt).
// Không cần file âm thanh, chạy offline.
//
// Lưu ý iOS Safari:
//  1) Danh sách giọng (voices) nạp BẤT ĐỒNG BỘ -> phải nghe 'voiceschanged'.
//  2) TTS chỉ phát được sau khi người dùng CHẠM lần đầu -> cần "unlock".
//     Gọi unlockSpeech() trong sự kiện chạm/đầu tiên (xem ui.js).
// ===========================================================================

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

let voices = [];
let unlocked = false;
const voicesListeners = [];

function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices() || [];
  for (const cb of voicesListeners) cb(voices);
}

if (synth) {
  loadVoices();
  // Safari/Chrome nạp voices trễ -> cập nhật khi có sự kiện.
  if (typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", loadVoices);
  } else {
    synth.onvoiceschanged = loadVoices;
  }
}

// Đăng ký callback khi danh sách giọng thay đổi (iOS nạp trễ).
export function onVoicesChanged(cb) {
  voicesListeners.push(cb);
}

// ---- Cài đặt giọng (lưu localStorage, dùng chung mọi trang) ---------------

const SETTINGS_KEY = "engweb-voice-settings";
export const DEFAULT_SETTINGS = { voiceURI: "", rate: 0.85, pitch: 1.05 };

export function getVoiceSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const s = JSON.parse(raw);
    return {
      voiceURI: typeof s.voiceURI === "string" ? s.voiceURI : DEFAULT_SETTINGS.voiceURI,
      rate: Number.isFinite(s.rate) ? s.rate : DEFAULT_SETTINGS.rate,
      pitch: Number.isFinite(s.pitch) ? s.pitch : DEFAULT_SETTINGS.pitch,
    };
  } catch (_) {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveVoiceSettings(partial) {
  const next = { ...getVoiceSettings(), ...partial };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (_) {}
  return next;
}

export function resetVoiceSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (_) {}
  return { ...DEFAULT_SETTINGS };
}

// Danh sách giọng tiếng Anh có trên thiết bị.
export function listEnglishVoices() {
  if (!voices.length) loadVoices();
  return voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
}

// Trình duyệt có hỗ trợ TTS không?
export function isSpeechSupported() {
  return !!synth && typeof window.SpeechSynthesisUtterance === "function";
}

// Đang đọc (hoặc có câu chờ đọc) không?
export function isSpeaking() {
  return !!synth && (synth.speaking || synth.pending);
}

// Chọn giọng phù hợp nhất cho ngôn ngữ (vd "en", "vi").
function pickVoice(lang) {
  if (!voices.length) loadVoices();
  const want = lang.toLowerCase();
  // Ưu tiên khớp đầy đủ (en-us), rồi khớp tiền tố (en).
  return (
    voices.find((v) => v.lang && v.lang.toLowerCase() === want) ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(want.split("-")[0])) ||
    null
  );
}

// "Mở khoá" TTS trong lần chạm đầu tiên (bắt buộc trên iOS).
export function unlockSpeech() {
  if (!synth || unlocked) return;
  try {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    synth.speak(u);
    synth.cancel(); // huỷ ngay, chỉ cần "chạm" vào engine
    unlocked = true;
  } catch (_) {
    /* bỏ qua nếu không hỗ trợ */
  }
}

// "Cảm xúc" giả lập: Web Speech API không có tham số cảm xúc thật, nhưng đổi
// cao độ + tốc độ theo ngữ cảnh thì tai bé vẫn cảm nhận rõ. Giá trị là HỆ SỐ
// NHÂN với cài đặt người dùng (⚙️) nên vẫn tôn trọng tuỳ chỉnh giọng của bé.
const MOODS = {
  happy: { rate: 1.1, pitch: 1.3 }, // reo vui: cao + nhanh hơn (câu khen)
  sad: { rate: 0.85, pitch: 0.75 }, // xịu xuống: trầm + chậm (màn thua)
  question: { rate: 0.95, pitch: 1.12 }, // lên giọng nhẹ như đang hỏi
};

/**
 * Đọc một đoạn text.
 * @param {string} text  nội dung cần đọc
 * @param {object} opts  { lang = "en-US", rate, pitch, append = false, mood }
 *                       append = true -> xếp hàng đọc TIẾP SAU câu đang đọc
 *                       (mặc định cắt câu đang đọc để tránh chồng tiếng).
 *                       mood = "happy" | "sad" | "question" -> ngữ điệu giả lập.
 * @returns {Promise<void>} resolve khi đọc xong (hoặc bị bỏ qua)
 */
export function speak(text, opts = {}) {
  return new Promise((resolve) => {
    if (!isSpeechSupported() || !text) return resolve();
    // rate/pitch mặc định lấy từ cài đặt người dùng.
    const s = getVoiceSettings();
    let { lang = "en-US", rate = s.rate, pitch = s.pitch, append = false } = opts;
    const mood = MOODS[opts.mood];
    if (mood) {
      // Kẹp trong khoảng an toàn để giọng không bị méo trên các máy khác nhau.
      rate = Math.min(1.6, Math.max(0.5, rate * mood.rate));
      pitch = Math.min(2, Math.max(0.3, pitch * mood.pitch));
    }

    // Dừng câu đang đọc để tránh chồng tiếng (trừ khi muốn đọc nối tiếp).
    if (!append) {
      try {
        synth.cancel();
      } catch (_) {}
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate; // chậm hơn cho bé dễ nghe
    u.pitch = pitch; // hơi cao, vui tai
    // Giọng tiếng Anh: ưu tiên giọng người dùng đã chọn; mất giọng đó
    // (đổi thiết bị) thì fallback về tự động.
    let v = null;
    if (s.voiceURI && lang.toLowerCase().startsWith("en")) {
      if (!voices.length) loadVoices();
      v = voices.find((x) => x.voiceURI === s.voiceURI) || null;
    }
    if (!v) v = pickVoice(lang);
    if (v) u.voice = v;

    // Chỉ resolve MỘT lần, qua bất kỳ đường nào tới trước.
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safety);
      resolve();
    };
    u.onend = done;
    u.onerror = done;

    // VAN AN TOÀN (iOS Safari): onend/onerror NHIỀU KHI KHÔNG BAO GIỜ BẮN
    // (im lặng, kẹt engine...) -> promise treo -> code chờ speak().then() bị
    // đứng luôn. Ước lượng thời lượng đọc theo độ dài text rồi tự resolve.
    const estMs = 900 + (text.length / Math.max(0.5, rate)) * 90;
    const safety = setTimeout(done, Math.min(8000, estMs));

    // iOS/Chrome: engine hay "ngủ" sau cancel() hoặc để lâu, và trạng thái
    // .paused không đáng tin -> gọi resume() cả TRƯỚC và SAU speak cho chắc phát tiếng.
    try { synth.resume(); } catch (_) {}
    synth.speak(u);
    try { synth.resume(); } catch (_) {}
  });
}

// Tiện ích: đọc tiếng Anh.
export function speakEn(text) {
  return speak(text, { lang: "en-US" });
}

// Tiện ích: đọc tiếng Việt (nếu thiết bị có giọng vi-VN; nếu không sẽ bỏ qua êm).
export function speakVi(text) {
  // Chỉ đọc nếu thực sự có giọng tiếng Việt, tránh đọc sai bằng giọng Anh.
  if (!pickVoice("vi")) return Promise.resolve();
  return speak(text, { lang: "vi-VN", rate: 0.85, pitch: 1.0 });
}

// Có giọng tiếng Việt trên thiết bị không?
export function hasVietnameseVoice() {
  return !!pickVoice("vi");
}
