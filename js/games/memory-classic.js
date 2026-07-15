// ===========================================================================
// memory-classic.js — CHẾ ĐỘ CHƠI THƯỜNG của game lật thẻ:
// chọn chủ đề + độ khó, lật thoải mái không tính giờ. Luật bàn chơi nằm ở
// memory-board.js; file này chỉ lo UI của chế độ (picker, nút chơi lại).
// ===========================================================================

import { wordsOf } from "../data.js";
import { el, celebrate, praise } from "../ui.js";
import { categoryPicker, chipPicker, awardTickets } from "./common.js";
import { createBoard } from "./memory-board.js";

export function mountClassic(app, onExit) {
  let pool = wordsOf("all");
  let pairs = 4;

  const board = createBoard({ onWin: win });

  const picker = categoryPicker((id) => {
    pool = wordsOf(id);
    start();
  });
  const diff = chipPicker(
    [
      { id: 4, label: "🙂 Dễ" },
      { id: 8, label: "😃 Vừa" },
      { id: 12, label: "😎 Khó" },
    ],
    4,
    (n) => {
      pairs = n;
      start();
    }
  );

  function start() {
    board.start({ pool, pairs });
  }

  function win() {
    celebrate();
    // Chờ tiếng đọc từ của thẻ cuối (delay 450ms ở flip) bắt đầu trước,
    // rồi câu khen mới xếp hàng đọc nối sau — không bị cắt ngang.
    setTimeout(praise, 550);
    // Thắng ván = cộng vé oẳn tù tì cho game tổng, theo độ khó đang chơi.
    awardTickets(pairs === 12 ? 3 : pairs === 8 ? 2 : 1);
    board.el.appendChild(
      el("div", { class: "center" }, [el("button", { class: "btn-big", onclick: start }, "🔄 Chơi lại")])
    );
  }

  app.innerHTML = "";
  if (onExit) app.appendChild(el("button", { class: "backchip", onclick: onExit }, "↩️ Đổi chế độ"));
  app.appendChild(picker.bar);
  app.appendChild(diff.bar);
  app.appendChild(el("p", { class: "lead", text: "Lật 2 thẻ để tìm cặp giống nhau!" }));
  app.appendChild(board.el);
  start();
}
