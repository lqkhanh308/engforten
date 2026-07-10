# Web học tiếng Anh cho bé từ 3 tuổi (offline, PWA, iPhone-friendly)

## Context (Vì sao làm)
Bé từ 3 tuổi cần một app học từ vựng tiếng Anh **trực quan, bấm-là-học**, dùng được **hoàn toàn offline** và **chạy mượt trên iPhone**. Repo `d:\Khanh\LinhTinh\EngWeb` hiện đang trống → xây mới từ đầu.

Quyết định đã chốt với người dùng:
- **Hình ảnh:** dùng **file ảnh thật** (trong `assets/images/`), nhưng có **fallback emoji** để app chạy được ngay cả khi chưa có đủ ảnh.
- **Âm thanh:** **Web Speech API (TTS trình duyệt)** đọc EN (và VI nếu thiết bị hỗ trợ) — không cần file mp3.
- **Mini game:** đủ cả 4 — *Chọn đúng hình*, *Lật thẻ tìm cặp*, *Nối hình với từ*, *Đố vui trắc nghiệm*. Mỗi game là **1 trang HTML riêng**.
- **Triển khai:** **PWA** cài về màn hình chính iPhone, sau khi cài chạy offline như app.

Kết quả mong muốn: mở `index.html` → lưới chủ đề (động vật, trái cây, màu sắc…), bấm vào 1 hình → hiện thẻ to với **EN + VI + nút loa (auto đọc)**; từ trang chủ vào được 4 mini game; toàn bộ chạy offline sau khi cài.

## Tech stack & nguyên tắc
- **Vanilla HTML + CSS + JS thuần**, không framework, không build step → dễ bảo trì, offline tối đa, chỉ là static files.
- **Mobile-first**, tap target lớn (≥64px), font to, màu tươi, bo tròn — hợp bé 3 tuổi.
- Dữ liệu từ vựng tập trung 1 chỗ (`js/data.js`) → cả trang học lẫn 4 game đều đọc chung, thêm từ là tất cả tự giàu lên.
- **Không backend.** PWA + service worker cache toàn bộ → chạy offline sau lần cài đầu.

## Cấu trúc thư mục (tạo mới)
```
EngWeb/
├── index.html                 # Trang chủ: lưới chủ đề + menu vào 4 game
├── manifest.webmanifest       # PWA manifest (name, icons, standalone)
├── sw.js                      # Service worker: cache-first app shell + runtime cache ảnh
├── css/
│   └── styles.css             # Style chung, mobile-first, responsive
├── js/
│   ├── data.js                # Bộ dữ liệu từ vựng (categories → words: en, vi, image, emoji)
│   ├── speak.js               # Wrapper Web Speech API (đọc EN/VI, xử lý quirk iOS)
│   ├── ui.js                  # Helper chung: tạo card, modal học từ, nút Home/Back
│   ├── app.js                 # Logic trang chủ: render chủ đề + thẻ học (click ảnh → VI/EN)
│   └── games/
│       ├── tap-picture.js     # Chọn đúng hình
│       ├── memory.js          # Lật thẻ tìm cặp
│       ├── match.js           # Nối hình với từ
│       └── quiz.js            # Đố vui trắc nghiệm
├── games/
│   ├── tap-picture.html
│   ├── memory.html
│   ├── match.html
│   └── quiz.html
├── assets/
│   ├── images/
│   │   ├── animals/ fruits/ colors/ ...   # ảnh thật theo chủ đề (user thêm dần)
│   │   └── icons/  icon-192.png icon-512.png  # icon cho PWA
│   └── (audio/ — không cần vì dùng TTS)
└── README.md                  # Cách chạy/serve, thêm ảnh, cài lên iPhone
```

## Data model (`js/data.js`)
Một mảng category; mỗi từ có cả đường dẫn ảnh thật **và** emoji fallback:
```js
export const CATEGORIES = [
  {
    id: "animals", en: "Animals", vi: "Động vật", emoji: "🐾",
    words: [
      { id: "dog", en: "Dog", vi: "Con chó", image: "assets/images/animals/dog.webp", emoji: "🐶" },
      { id: "cat", en: "Cat", vi: "Con mèo", image: "assets/images/animals/cat.webp", emoji: "🐱" },
      // ...
    ],
  },
  // fruits, colors, numbers, vehicles, body, family, shapes ...
];
```
- **Quy ước ảnh:** `assets/images/<category>/<wordId>.webp` (khuyến nghị webp để nhẹ, cache offline gọn).
- **Fallback:** `<img>` có `onerror` → ẩn ảnh, hiện emoji. Nhờ vậy app chạy đẹp ngay cả khi ảnh chưa đủ; thêm ảnh sau là tự dùng.
- **Bộ khởi tạo:** ~7–8 chủ đề, mỗi chủ đề ~8–12 từ (Animals, Fruits, Colors, Numbers, Vehicles, Body, Family, Shapes).

## Trang chủ & học từ vựng — `index.html` + `js/app.js`
- Lưới các **chủ đề** (card to có emoji/ảnh + tên VI/EN).
- Chọn chủ đề → lưới các **từ** (card ảnh, nhãn tối giản).
- **Bấm vào 1 hình → mở thẻ học to (modal/flip):** ảnh lớn + **EN** (to) + **VI** + nút 🔊. Mở thẻ là **tự đọc EN** một lần; bấm loa đọc lại; (tuỳ chọn) loa nhỏ đọc VI.
- Nút **Home** và mũi tên **Back** to, rõ ở mọi màn.

## 4 mini game (mỗi game 1 trang riêng, đọc chung `data.js`)
Tất cả đều: không tính giờ, không "thua", phản hồi tích cực (animation/▲ vui khi đúng, nhắc nhẹ khi sai), ít lựa chọn, target to, có chọn chủ đề (hoặc "Tất cả").

1. **Chọn đúng hình** (`games/tap-picture.html` + `js/games/tap-picture.js`)
   - Đọc/hiện 1 từ EN → 3–4 ảnh để chọn → bấm đúng ảnh. Đúng: khen + đọc từ; sai: rung nhẹ, cho thử lại.
2. **Lật thẻ tìm cặp** (`memory.html` + `memory.js`)
   - Lưới thẻ úp (bắt đầu 6 thẻ / 3 cặp cho bé nhỏ, tăng dần). Cặp = ảnh↔ảnh hoặc ảnh↔từ. Khớp cặp → đọc từ.
3. **Nối hình với từ** (`match.html` + `match.js`)
   - Cột ảnh ↔ cột từ EN. **Bấm ảnh rồi bấm từ** để nối (tap-based, dễ cho bé hơn kéo-thả). Nối đúng → đường nối + đọc từ.
4. **Đố vui trắc nghiệm** (`quiz.html` + `quiz.js`)
   - Hiện ảnh + từ → hỏi EN↔VI, 3 lựa chọn, có điểm sao. Mỗi câu đọc từ bằng TTS.

## TTS — `js/speak.js` (lưu ý quirk iOS)
- Hàm `speak(text, lang)` dùng `speechSynthesis` + `SpeechSynthesisUtterance`.
- Voices nạp **bất đồng bộ** → lắng nghe `voiceschanged`, chọn voice theo `lang` (`en-US`, `vi-VN`).
- **iOS Safari yêu cầu TTS được kích hoạt bởi tương tác người dùng lần đầu** → "unlock" bằng cách phát một utterance rỗng/ngắn trong lần chạm đầu tiên (gắn ở `index.html`), sau đó đọc tự do.
- Tốc độ chậm (`rate ~0.85`) cho bé dễ nghe; nếu thiếu voice VI thì chỉ đọc EN (degrade gracefully).

## PWA & Offline — `manifest.webmanifest` + `sw.js`
- **Manifest:** `name`, `short_name`, `display: standalone`, `theme_color`, `background_color`, `start_url: "./index.html"`, icons 192/512.
- **Service worker:**
  - **App shell (cache-first):** precache HTML/CSS/JS/`data.js`/manifest/icons với `CACHE_VERSION` (bump khi sửa).
  - **Ảnh `assets/images/*` (runtime cache):** lần đầu xem (online) → cache lại → lần sau offline vẫn có. Ảnh thêm sau tự được cache khi xem lần đầu.
  - Đăng ký SW ở mỗi trang (1 dòng trong từng HTML, hoặc gom vào `ui.js`).
- **Lưu ý quan trọng (offline + iPhone):** Service worker chỉ chạy trong **secure context** = `https://` hoặc `localhost`. Để **cài lên iPhone**:
  1. Deploy thư mục static lên 1 host HTTPS miễn phí **một lần** (GitHub Pages / Netlify / Cloudflare Pages), **hoặc** dùng tunnel HTTPS (ngrok) khi test.
  2. Mở bằng **Safari trên iPhone** → **Add to Home Screen**.
  3. Sau khi cài, app **chạy hoàn toàn offline** (không cần mạng, không backend).
  - App **không có server/backend** — HTTPS chỉ cần cho **lần cài đầu/đăng ký SW**, không phải để chạy.

## Responsive & UI cho bé
- `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Layout CSS Grid/Flex, card co giãn theo màn; safe-area iPhone (notch) bằng `env(safe-area-inset-*)`.
- Nút/thẻ rất to, khoảng cách rộng tránh bấm nhầm; màu tương phản cao, font tròn dễ đọc; animation nhẹ khi đúng.

## Files sẽ tạo (đại diện)
- Gốc: `index.html`, `manifest.webmanifest`, `sw.js`, `README.md`.
- `css/styles.css`; `js/data.js`, `js/speak.js`, `js/ui.js`, `js/app.js`.
- `games/*.html` (4 file) + `js/games/*.js` (4 file) — cùng một khung: nạp `data.js`, render game, dùng `speak()` + nút Home/Back từ `ui.js`.
- `assets/images/<category>/` (cấu trúc rỗng + vài ảnh mẫu) và `assets/icons/` (icon PWA).

## Verification (cách kiểm thử end-to-end)
1. **Chạy local (SW cần localhost/https):**
   - PowerShell: `npx serve .` (hoặc `python -m http.server 8000`) rồi mở `http://localhost:3000` (hoặc `:8000`).
2. **Trang học:** trang chủ hiện lưới chủ đề → vào 1 chủ đề → **bấm 1 hình** → thẻ to hiện **EN + VI** và **tự đọc EN**; nút 🔊 đọc lại. Tắt mạng (DevTools → Offline) reload vẫn chạy.
3. **4 mini game:** mở từng `games/*.html`, chơi thử: chọn đúng hình, lật cặp, nối hình-từ, trả lời quiz — feedback đúng/sai + TTS hoạt động.
4. **Responsive:** DevTools → iPhone (Safari/responsive) kiểm tra bố cục, tap target, safe-area; thử cả dọc/ngang.
5. **PWA/offline thật trên iPhone:** deploy lên host HTTPS (hoặc ngrok) → Safari iPhone → Add to Home Screen → **bật Airplane mode** → mở app từ màn hình chính, học từ + chơi game offline.
6. **Fallback ảnh:** xoá/đổi tên 1 file ảnh → card hiển thị **emoji** thay thế, không vỡ layout.

## Giả định
- Dùng vanilla, không build tool, không thư viện ngoài (để offline tối đa).
- Bộ từ vựng khởi tạo là tập mẫu; người dùng bổ sung ảnh/từ theo quy ước `assets/images/<category>/<wordId>.webp`.
- VI TTS phụ thuộc thiết bị; thiếu thì chỉ đọc EN.
