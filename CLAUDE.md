# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Web học tiếng Anh cho bé từ 3 tuổi (PWA offline, mobile-first cho iPhone). Vanilla JS (ES modules), không framework, không build step, không dependency, không backend.

## Chạy & kiểm thử

Không có lint/test tự động. App dùng ES module + service worker nên **phải chạy qua web server** (không mở `file://`):

```powershell
npx serve .                    # hoặc: python -m http.server 8000
node --check js/games/xxx.js   # check nhanh cú pháp sau khi sửa JS
```

- Test offline: DevTools → Network → tick Offline → reload.
- URL test game tổng (không tốn vé, không lưu tiến độ): `games/adventure.html?test=rps` (oẳn tù tì), `?test=win` (màn về đích).
- `admin.html`: trang phụ huynh quản lý vé 🎫 (cố ý không có link trong app). Lối vào từ trong app: **giữ đè 3 giây HOẶC chạm nhanh 5 lần vào tiêu đề "⚙️ Cài đặt" rồi nhập mật khẩu** (cổng phụ huynh trong ui.js — mật khẩu ở hằng `PARENT_PASS`). LƯU Ý: phần bắt cử chỉ giữ **không được** dùng `pointercancel`/`touchcancel` để huỷ bộ đếm — iOS PWA bắn các sự kiện đó giữa chừng (tiêu đề nằm trong `.settings-card` cuộn được) làm timer chết, cổng không mở; chỉ huỷ khi thả tay hoặc nhích tay quá ngưỡng. Lối vào này BẮT BUỘC phải giữ vì trên iPhone, PWA cài từ màn hình chính có localStorage **tách biệt** với Safari — chỉnh vé từ Safari thì app cài không nhận.

## Quy tắc BẮT BUỘC khi sửa code

1. **Sửa xong bất kỳ file nào (HTML/CSS/JS/ảnh) → tăng `CACHE_VERSION` trong [sw.js](sw.js)**, nếu thêm file mới thì thêm vào `APP_SHELL`. Quên bước này là người dùng dính cache cũ vĩnh viễn.
2. **Thay đổi layout phải áp dụng cho TOÀN BỘ theme.** Có 6 theme (mặc định Kẹo hồng + ocean, forest, night, sunset, unicorn) — mỗi theme chỉ ghi đè **biến CSS** ở `:root[data-theme="..."]` đầu [css/styles.css](css/styles.css) (màu, `--radius`, `--card-minh`, `--grid-cols-*`). Layout component nằm ở khối CSS dùng chung phía dưới → ưu tiên sửa ở khối chung / qua biến; nếu buộc phải override theo theme thì phải làm đủ cho cả 6 theme và thử với bo góc/cỡ thẻ/số cột khác nhau.
3. **Không đổi tên các key localStorage** (mất tiến độ/vé của bé): `engweb-rps-tickets` (vé), `engweb-memory-map` + `engweb-memory-map-scenes` (tiến độ phiêu lưu), `engweb-theme`, `engweb-voice-settings`.
4. UX cho bé 3 tuổi: mọi thao tác là **tap** (không kéo-thả), nút/chữ to, có tiếng đọc + hiệu ứng khen. UI text và comment viết **tiếng Việt**.
5. **Có điểm lưu ý mới trong dự án → cập nhật ngay vào CLAUDE.md này.**

## Kiến trúc

- **[js/data.js](js/data.js)** — nguồn từ vựng DUY NHẤT (`CATEGORIES[]`, mỗi từ `{id, en, vi, emoji}`). Thêm/sửa từ ở đây là trang học + mọi game tự cập nhật. Ảnh thật (tuỳ chọn) theo quy ước `assets/images/<category>/<id>.webp`; `pictureEl()` trong ui.js tự fallback emoji khi thiếu ảnh — không bao giờ có ảnh vỡ.
- **[js/ui.js](js/ui.js)** — helper chung mọi trang: `el()` tạo DOM, `pictureEl()`, `speakEn()`, `celebrate()`/`toast()`/`praise()`, âm thanh (WebAudio), theme, `initPage()` (đăng ký SW + unlock TTS + nút Home).
- **[js/speak.js](js/speak.js)** — TTS bằng Web Speech API (offline). Lưu ý iOS Safari: voices nạp bất đồng bộ (`voiceschanged`) và chỉ phát sau lần chạm đầu (`unlockSpeech()` — initPage đã lo).
- **Mỗi mini game = 1 trang HTML riêng** trong `games/` + 1 module trong `js/games/`. Không có SPA/router.
- **[js/games/common.js](js/games/common.js)** — xương sống các game: `categoryPicker`/`chipPicker` (chọn chủ đề/độ khó), `livesWidget` (3 tim ❤️, sai mất tim, hết tim thua), `loseScreen`/`winScreen`, `timerBar` (chế độ tính giờ), và **hệ vé 🎫** `awardTickets/spendTickets`.
- **Kinh tế vé (meta-game):** THẮNG mini game → cộng vé theo độ khó (dễ 1 / vừa 2 / khó 3; thua = 0 vé). Vé tiêu ở **game tổng [js/games/adventure.js](js/games/adventure.js)** (oẳn tù tì với robot, thắng 1 lượt = đi 1 bước tới lâu đài). Game mới thêm vào phải gọi `awardTickets()` khi thắng để tham gia hệ này.
- **Lật thẻ tách 2 tầng:** [js/games/memory-board.js](js/games/memory-board.js) là "động cơ" luật bàn chơi (lật cặp, combo 🔥, thẻ sao ⭐, thẻ ma 👻) dùng chung; [js/games/memory-classic.js](js/games/memory-classic.js) chỉ là UI chế độ chơi thường. Thêm chế độ chơi mới = dùng lại `createBoard()`, không đụng vào luật.

## Lưu ý layout đã đúc kết

- Bảng game nhiều ô phải **lọt màn hình điện thoại, bé không phải cuộn**: nối hình 10 cặp dùng class `match-board.compact`; lật thẻ ≥16 thẻ thêm class `big` (5 cột), ≥24 thẻ thêm `huge` (6 cột) — set trong JS lúc tạo bàn, style ở styles.css.
- Emoji/hình bên trong phải nhỏ theo cỡ ô (các rule `.pic-emoji` theo từng context trong styles.css).
