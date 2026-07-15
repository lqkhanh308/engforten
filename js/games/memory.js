// ===========================================================================
// memory.js — TRANG game lật thẻ: vào thẳng chế độ chơi thường.
// (Chế độ "Phiêu lưu bản đồ" đã tách thành GAME TỔNG riêng: games/adventure.html
// — thắng ván lật thẻ ở đây sẽ được cộng 🎫 lượt oẳn tù tì cho game tổng.)
// ===========================================================================

import { initPage } from "../ui.js";
import { mountClassic } from "./memory-classic.js";

initPage();
mountClassic(document.getElementById("app"));
