# 🎈 Tiếng Anh Cho Bé Thiên

Web học tiếng Anh cho bé **từ 3 tuổi**, học qua **hình ảnh** và **mini game**, chạy
**hoàn toàn offline**, **responsive trên iPhone** và cài được như app (PWA).

- Bấm vào hình → hiện **tiếng Anh + tiếng Việt** và **tự đọc** (phát âm bằng giọng có sẵn của máy).
- 8 mini game, **mỗi game một trang riêng**:
  - 👆 **Chọn đúng hình** — nghe/đọc 1 từ rồi bấm vào hình đúng
  - 🃏 **Lật thẻ tìm cặp** — memory game (thư giãn, không thua; ghép đúng liên
    tiếp được **Combo 🔥**, mỗi ván có **cặp thẻ sao may mắn ⭐**, mức Khó có
    **2 thẻ ma 👻** lật trúng là nó tráo 2 thẻ đang úp — mỗi thứ có âm thanh riêng)
  - 🔗 **Nối hình với từ** — bấm hình rồi bấm từ để nối
  - ❓ **Đố vui** — trắc nghiệm EN↔VI, có điểm sao
  - 🫧 **Bắt bong bóng** — nghe từ rồi chạm nổ bong bóng chứa hình đúng
  - 🌗 **Tìm bóng đen** — chọn silhouette đúng của hình (kiểu Montessori)
  - 🔢 **Đếm số** — đếm 1-5 hình rồi bấm số đúng, học đếm tiếng Anh
  - 🎨 **Tìm màu** — nghe tên màu tiếng Anh rồi chạm ô màu đúng
- **Quy tắc thua (cho kịch tính):** mỗi lượt có **3 tim ❤️** — bấm sai mất 1 tim,
  còn 1 tim thì tim đập + viền màn hình ửng đỏ, hết tim là hiện màn thua
  nhẹ nhàng (khen động viên + nút chơi lại). Riêng **Bắt bong bóng** và **Đố vui**
  có thêm chế độ **⏱️ Tính giờ**: thanh đếm ngược cạn dần, hết giờ cũng mất tim.
  Lật thẻ giữ nguyên kiểu thư giãn, không có thua.

Không cần internet, không cần tài khoản, không có server/backend.

---

## 1. Chạy thử trên máy tính

App dùng JavaScript module + service worker nên **cần chạy qua một web server**
(không mở trực tiếp `file://`). Mở thư mục này rồi chạy **một trong các cách**:

```powershell
# Cách A: Node (nếu đã cài Node.js)
npx serve .
# rồi mở địa chỉ hiện ra, ví dụ http://localhost:3000

# Cách B: Python
python -m http.server 8000
# rồi mở http://localhost:8000
```

> Service worker chỉ hoạt động ở `localhost` hoặc `https://`. Mở `localhost` là đủ
> để chạy + test offline trên máy tính.

**Test offline:** mở DevTools → tab Network → tick **Offline** → bấm reload. Trang vẫn chạy.

---

## 2. Thêm hình ảnh thật

Mặc định mỗi từ hiển thị **emoji**. Khi bạn bỏ file ảnh vào đúng chỗ, app **tự dùng ảnh**
thay cho emoji (nếu thiếu ảnh thì vẫn hiện emoji, không bị vỡ).

Quy ước đường dẫn:

```
assets/images/<chủ_đề>/<id_từ>.webp
```

Ví dụ cho từ `dog` thuộc chủ đề `animals`:

```
assets/images/animals/dog.webp
```

- `<chủ_đề>` và `<id_từ>` lấy đúng theo `id` trong [js/data.js](js/data.js).
- Khuyến nghị **.webp** (nhẹ, cache offline gọn). Ảnh vuông, nền trong/đơn giản là đẹp nhất.
- Sau khi thêm ảnh, **tăng `CACHE_VERSION`** trong [sw.js](sw.js) để bản cài lại cập nhật.

---

## 3. Thêm / sửa từ vựng

Chỉ cần sửa [js/data.js](js/data.js) — cả trang học lẫn 4 game tự dùng dữ liệu mới:

```js
{ id: "dog", en: "Dog", vi: "Con chó", emoji: "🐶" }
```

Thêm một chủ đề mới = thêm một object có `id`, `en`, `vi`, `emoji`, `words[]`.

---

## 4. Cài lên iPhone (PWA, dùng offline)

Service worker (để chạy offline) **chỉ đăng ký được trên HTTPS hoặc localhost**.
iPhone không mở `localhost` của máy khác, nên làm **một lần** như sau:

1. **Đưa web lên một host HTTPS miễn phí** (chỉ là file tĩnh):
   - GitHub Pages, Netlify, Cloudflare Pages, Vercel… (kéo-thả cả thư mục là xong), **hoặc**
   - Khi chỉ muốn test nhanh: dùng tunnel HTTPS như `ngrok http 8000` rồi mở link `https://...`.
2. Trên **iPhone mở bằng Safari** link HTTPS đó.
3. Bấm **Share (↑) → Add to Home Screen / Thêm vào MH chính**.
4. Mở app từ màn hình chính. Sau lần đầu, **bật Airplane mode vẫn chạy** — học từ + chơi
   game offline hoàn toàn.

> App không cần mạng để chạy. HTTPS chỉ cần cho **lần cài đầu** (đăng ký service worker).

---

## 5. Cấu trúc dự án

```
EngWeb/
├── index.html              # Trang chủ: lưới chủ đề + menu game
├── manifest.webmanifest    # Khai báo PWA
├── sw.js                   # Service worker (offline cache)
├── css/styles.css          # Giao diện mobile-first
├── js/
│   ├── data.js             # Dữ liệu từ vựng (sửa ở đây)
│   ├── speak.js            # Phát âm (Web Speech API)
│   ├── ui.js               # Helper chung + modal học từ
│   ├── app.js              # Logic trang chủ
│   └── games/              # Logic 4 game + common.js
├── games/                  # 4 trang HTML của 4 game
└── assets/
    ├── images/<chủ_đề>/    # Ảnh thật (bạn thêm vào)
    └── icons/              # Icon PWA
```

## Ghi chú về phát âm (TTS)

- Dùng giọng đọc có sẵn trên thiết bị (offline). Giọng **tiếng Anh** có sẵn trên hầu hết
  iPhone/Android/PC.
- Giọng **tiếng Việt** tuỳ thiết bị; nếu máy không có, app sẽ chỉ đọc tiếng Anh (không đọc sai).
- Trên iPhone, tiếng phát ra sau **lần chạm đầu tiên** của bé (yêu cầu của Safari) — đã xử lý sẵn.
