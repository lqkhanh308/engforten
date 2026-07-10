// ===========================================================================
// Bộ dữ liệu từ vựng dùng chung cho trang học + 4 mini game.
//
// Mỗi từ:
//   id    : khoá duy nhất trong chủ đề (cũng là tên file ảnh)
//   en    : từ tiếng Anh (hiển thị + đọc TTS)
//   vi    : nghĩa tiếng Việt
//   emoji : ký tự emoji dùng làm FALLBACK khi chưa có file ảnh
//   image : đường dẫn ảnh thật (tuỳ chọn). Quy ước:
//             assets/images/<category>/<id>.webp
//           Nếu file không tồn tại, app tự hiển thị emoji thay thế.
//
// Thêm từ mới: chỉ cần thêm vào đây, cả trang học lẫn các game sẽ tự cập nhật.
// ===========================================================================

export const CATEGORIES = [
  {
    id: "animals",
    en: "Animals",
    vi: "Động vật",
    emoji: "🐾",
    words: [
      { id: "dog", en: "Dog", vi: "Con chó", emoji: "🐶" },
      { id: "cat", en: "Cat", vi: "Con mèo", emoji: "🐱" },
      { id: "cow", en: "Cow", vi: "Con bò", emoji: "🐮" },
      { id: "pig", en: "Pig", vi: "Con lợn", emoji: "🐷" },
      { id: "duck", en: "Duck", vi: "Con vịt", emoji: "🦆" },
      { id: "fish", en: "Fish", vi: "Con cá", emoji: "🐟" },
      { id: "bird", en: "Bird", vi: "Con chim", emoji: "🐦" },
      { id: "lion", en: "Lion", vi: "Sư tử", emoji: "🦁" },
      { id: "elephant", en: "Elephant", vi: "Con voi", emoji: "🐘" },
      { id: "monkey", en: "Monkey", vi: "Con khỉ", emoji: "🐵" },
      { id: "rabbit", en: "Rabbit", vi: "Con thỏ", emoji: "🐰" },
      { id: "bear", en: "Bear", vi: "Con gấu", emoji: "🐻" },
      { id: "horse", en: "Horse", vi: "Con ngựa", emoji: "🐴" },
      { id: "sheep", en: "Sheep", vi: "Con cừu", emoji: "🐑" },
      { id: "chicken", en: "Chicken", vi: "Con gà", emoji: "🐔" },
      { id: "tiger", en: "Tiger", vi: "Con hổ", emoji: "🐯" },
      { id: "frog", en: "Frog", vi: "Con ếch", emoji: "🐸" },
      { id: "turtle", en: "Turtle", vi: "Con rùa", emoji: "🐢" },
      { id: "bee", en: "Bee", vi: "Con ong", emoji: "🐝" },
      { id: "butterfly", en: "Butterfly", vi: "Con bướm", emoji: "🦋" },
      { id: "giraffe", en: "Giraffe", vi: "Hươu cao cổ", emoji: "🦒" },
      { id: "penguin", en: "Penguin", vi: "Chim cánh cụt", emoji: "🐧" },
      { id: "snake", en: "Snake", vi: "Con rắn", emoji: "🐍" },
      { id: "mouse", en: "Mouse", vi: "Con chuột", emoji: "🐭" },
    ],
  },
  {
    id: "fruits",
    en: "Fruits",
    vi: "Trái cây",
    emoji: "🍎",
    words: [
      { id: "apple", en: "Apple", vi: "Quả táo", emoji: "🍎" },
      { id: "banana", en: "Banana", vi: "Quả chuối", emoji: "🍌" },
      { id: "orange", en: "Orange", vi: "Quả cam", emoji: "🍊" },
      { id: "grape", en: "Grape", vi: "Quả nho", emoji: "🍇" },
      { id: "watermelon", en: "Watermelon", vi: "Dưa hấu", emoji: "🍉" },
      { id: "strawberry", en: "Strawberry", vi: "Dâu tây", emoji: "🍓" },
      { id: "mango", en: "Mango", vi: "Quả xoài", emoji: "🥭" },
      { id: "pineapple", en: "Pineapple", vi: "Quả dứa", emoji: "🍍" },
      { id: "lemon", en: "Lemon", vi: "Quả chanh", emoji: "🍋" },
      { id: "cherry", en: "Cherry", vi: "Quả anh đào", emoji: "🍒" },
      { id: "peach", en: "Peach", vi: "Quả đào", emoji: "🍑" },
      { id: "pear", en: "Pear", vi: "Quả lê", emoji: "🍐" },
      { id: "coconut", en: "Coconut", vi: "Quả dừa", emoji: "🥥" },
      { id: "kiwi", en: "Kiwi", vi: "Quả kiwi", emoji: "🥝" },
      { id: "avocado", en: "Avocado", vi: "Quả bơ", emoji: "🥑" },
      { id: "tomato", en: "Tomato", vi: "Quả cà chua", emoji: "🍅" },
      { id: "melon", en: "Melon", vi: "Dưa lưới", emoji: "🍈" },
      { id: "blueberry", en: "Blueberry", vi: "Quả việt quất", emoji: "🫐" },
    ],
  },
  {
    id: "colors",
    en: "Colors",
    vi: "Màu sắc",
    emoji: "🎨",
    words: [
      { id: "red", en: "Red", vi: "Màu đỏ", emoji: "🔴" },
      { id: "blue", en: "Blue", vi: "Màu xanh dương", emoji: "🔵" },
      { id: "green", en: "Green", vi: "Màu xanh lá", emoji: "🟢" },
      { id: "yellow", en: "Yellow", vi: "Màu vàng", emoji: "🟡" },
      { id: "orange", en: "Orange", vi: "Màu cam", emoji: "🟠" },
      { id: "purple", en: "Purple", vi: "Màu tím", emoji: "🟣" },
      { id: "pink", en: "Pink", vi: "Màu hồng", emoji: "🌸" },
      { id: "black", en: "Black", vi: "Màu đen", emoji: "⚫" },
      { id: "white", en: "White", vi: "Màu trắng", emoji: "⚪" },
      { id: "brown", en: "Brown", vi: "Màu nâu", emoji: "🟤" },
      { id: "rainbow", en: "Rainbow", vi: "Cầu vồng", emoji: "🌈" },
    ],
  },
  {
    id: "numbers",
    en: "Numbers",
    vi: "Số đếm",
    emoji: "🔢",
    words: [
      { id: "one", en: "One", vi: "Số một", emoji: "1️⃣" },
      { id: "two", en: "Two", vi: "Số hai", emoji: "2️⃣" },
      { id: "three", en: "Three", vi: "Số ba", emoji: "3️⃣" },
      { id: "four", en: "Four", vi: "Số bốn", emoji: "4️⃣" },
      { id: "five", en: "Five", vi: "Số năm", emoji: "5️⃣" },
      { id: "six", en: "Six", vi: "Số sáu", emoji: "6️⃣" },
      { id: "seven", en: "Seven", vi: "Số bảy", emoji: "7️⃣" },
      { id: "eight", en: "Eight", vi: "Số tám", emoji: "8️⃣" },
      { id: "nine", en: "Nine", vi: "Số chín", emoji: "9️⃣" },
      { id: "ten", en: "Ten", vi: "Số mười", emoji: "🔟" },
      { id: "zero", en: "Zero", vi: "Số không", emoji: "0️⃣" },
    ],
  },
  {
    id: "vehicles",
    en: "Vehicles",
    vi: "Phương tiện",
    emoji: "🚗",
    words: [
      { id: "car", en: "Car", vi: "Ô tô", emoji: "🚗" },
      { id: "bus", en: "Bus", vi: "Xe buýt", emoji: "🚌" },
      { id: "train", en: "Train", vi: "Tàu hỏa", emoji: "🚆" },
      { id: "airplane", en: "Airplane", vi: "Máy bay", emoji: "✈️" },
      { id: "bicycle", en: "Bicycle", vi: "Xe đạp", emoji: "🚲" },
      { id: "boat", en: "Boat", vi: "Thuyền", emoji: "⛵" },
      { id: "truck", en: "Truck", vi: "Xe tải", emoji: "🚚" },
      { id: "motorbike", en: "Motorbike", vi: "Xe máy", emoji: "🏍️" },
      { id: "helicopter", en: "Helicopter", vi: "Trực thăng", emoji: "🚁" },
      { id: "rocket", en: "Rocket", vi: "Tên lửa", emoji: "🚀" },
      { id: "ship", en: "Ship", vi: "Tàu thủy", emoji: "🚢" },
      { id: "firetruck", en: "Fire truck", vi: "Xe cứu hỏa", emoji: "🚒" },
      { id: "policecar", en: "Police car", vi: "Xe cảnh sát", emoji: "🚓" },
      { id: "ambulance", en: "Ambulance", vi: "Xe cứu thương", emoji: "🚑" },
      { id: "tractor", en: "Tractor", vi: "Máy kéo", emoji: "🚜" },
      { id: "taxi", en: "Taxi", vi: "Xe taxi", emoji: "🚕" },
      { id: "scooter", en: "Scooter", vi: "Xe scooter", emoji: "🛴" },
    ],
  },
  {
    id: "body",
    en: "Body",
    vi: "Cơ thể",
    emoji: "🧒",
    words: [
      { id: "eye", en: "Eye", vi: "Con mắt", emoji: "👁️" },
      { id: "ear", en: "Ear", vi: "Cái tai", emoji: "👂" },
      { id: "nose", en: "Nose", vi: "Cái mũi", emoji: "👃" },
      { id: "mouth", en: "Mouth", vi: "Cái miệng", emoji: "👄" },
      { id: "hand", en: "Hand", vi: "Bàn tay", emoji: "✋" },
      { id: "foot", en: "Foot", vi: "Bàn chân", emoji: "🦶" },
      { id: "tooth", en: "Tooth", vi: "Cái răng", emoji: "🦷" },
      { id: "hair", en: "Hair", vi: "Tóc", emoji: "💇" },
      { id: "leg", en: "Leg", vi: "Cái chân", emoji: "🦵" },
      { id: "arm", en: "Arm", vi: "Cánh tay", emoji: "💪" },
      { id: "face", en: "Face", vi: "Khuôn mặt", emoji: "😊" },
      { id: "finger", en: "Finger", vi: "Ngón tay", emoji: "👆" },
      { id: "tongue", en: "Tongue", vi: "Cái lưỡi", emoji: "👅" },
      { id: "brain", en: "Brain", vi: "Bộ não", emoji: "🧠" },
    ],
  },
  {
    id: "family",
    en: "Family",
    vi: "Gia đình",
    emoji: "👨‍👩‍👧‍👦",
    words: [
      { id: "father", en: "Father", vi: "Bố", emoji: "👨" },
      { id: "mother", en: "Mother", vi: "Mẹ", emoji: "👩" },
      { id: "brother", en: "Brother", vi: "Anh trai", emoji: "👦" },
      { id: "sister", en: "Sister", vi: "Chị gái", emoji: "👧" },
      { id: "baby", en: "Baby", vi: "Em bé", emoji: "👶" },
      { id: "grandfather", en: "Grandfather", vi: "Ông", emoji: "👴" },
      { id: "grandmother", en: "Grandmother", vi: "Bà", emoji: "👵" },
      { id: "family", en: "Family", vi: "Gia đình", emoji: "👨‍👩‍👧‍👦" },
    ],
  },
  {
    id: "shapes",
    en: "Shapes",
    vi: "Hình khối",
    emoji: "🔷",
    words: [
      { id: "circle", en: "Circle", vi: "Hình tròn", emoji: "⭕" },
      { id: "square", en: "Square", vi: "Hình vuông", emoji: "🟦" },
      { id: "triangle", en: "Triangle", vi: "Hình tam giác", emoji: "🔺" },
      { id: "star", en: "Star", vi: "Ngôi sao", emoji: "⭐" },
      { id: "heart", en: "Heart", vi: "Trái tim", emoji: "❤️" },
      { id: "diamond", en: "Diamond", vi: "Hình thoi", emoji: "🔷" },
    ],
  },
];

// --- Tiện ích dùng chung --------------------------------------------------

// Đường dẫn ảnh thật theo quy ước (kể cả khi file chưa tồn tại).
export function imagePath(categoryId, wordId) {
  return `assets/images/${categoryId}/${wordId}.webp`;
}

// Tìm 1 chủ đề theo id.
export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

// Gộp tất cả từ của mọi chủ đề (đính kèm categoryId + đường dẫn ảnh).
export function allWords() {
  const out = [];
  for (const cat of CATEGORIES) {
    for (const w of cat.words) {
      out.push({ ...w, categoryId: cat.id, image: imagePath(cat.id, w.id) });
    }
  }
  return out;
}

// Lấy danh sách từ của 1 chủ đề ("all" = tất cả), đã đính kèm đường dẫn ảnh.
export function wordsOf(categoryId) {
  if (!categoryId || categoryId === "all") return allWords();
  const cat = getCategory(categoryId);
  if (!cat) return [];
  return cat.words.map((w) => ({
    ...w,
    categoryId: cat.id,
    image: imagePath(cat.id, w.id),
  }));
}

// Xáo trộn mảng (Fisher–Yates) — trả về mảng mới.
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Lấy ngẫu nhiên n phần tử khác nhau từ mảng.
export function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Lấy n "mồi nhử" (từ khác) không trùng với từ đúng — ưu tiên cùng chủ đề.
export function distractors(correctWord, n, pool) {
  const source = pool && pool.length ? pool : allWords();
  const others = source.filter((w) => w.id !== correctWord.id);
  return sample(others, Math.min(n, others.length));
}
