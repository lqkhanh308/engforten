// ===========================================================================
// common.js — Helper dùng chung cho các mini game (thanh chọn chủ đề / độ khó).
// ===========================================================================

import { CATEGORIES } from "../data.js";
import { el } from "../ui.js";

// Thanh chip lựa chọn (chủ đề, độ khó...). Trả về { bar, get() }.
export function chipPicker(options, currentId, onSelect) {
  const bar = el("div", { class: "picker" });
  let current = currentId;
  const buttons = [];
  for (const o of options) {
    const b = el("button", {
      class: "chip" + (o.id === current ? " active" : ""),
      text: o.label,
      onclick: () => {
        current = o.id;
        buttons.forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        onSelect(o.id);
      },
    });
    buttons.push(b);
    bar.appendChild(b);
  }
  return { bar, get: () => current };
}

// Thanh chọn chủ đề ("Tất cả" + từng chủ đề).
export function categoryPicker(onSelect) {
  const opts = [{ id: "all", label: "🌈 Tất cả" }];
  for (const c of CATEGORIES) opts.push({ id: c.id, label: `${c.emoji} ${c.vi}` });
  return chipPicker(opts, "all", onSelect);
}
