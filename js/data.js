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
      { id: "zebra", en: "Zebra", vi: "Ngựa vằn", emoji: "🦓" },
      { id: "panda", en: "Panda", vi: "Gấu trúc", emoji: "🐼" },
      { id: "koala", en: "Koala", vi: "Gấu túi", emoji: "🐨" },
      { id: "fox", en: "Fox", vi: "Con cáo", emoji: "🦊" },
      { id: "wolf", en: "Wolf", vi: "Chó sói", emoji: "🐺" },
      { id: "owl", en: "Owl", vi: "Cú mèo", emoji: "🦉" },
      { id: "dolphin", en: "Dolphin", vi: "Cá heo", emoji: "🐬" },
      { id: "whale", en: "Whale", vi: "Cá voi", emoji: "🐳" },
      { id: "shark", en: "Shark", vi: "Cá mập", emoji: "🦈" },
      { id: "octopus", en: "Octopus", vi: "Bạch tuộc", emoji: "🐙" },
      { id: "crab", en: "Crab", vi: "Con cua", emoji: "🦀" },
      { id: "snail", en: "Snail", vi: "Ốc sên", emoji: "🐌" },
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
      { id: "racecar", en: "Race car", vi: "Xe đua", emoji: "🏎️" },
      { id: "cablecar", en: "Cable car", vi: "Cáp treo", emoji: "🚠" },
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
  {
    id: "weather",
    en: "Weather",
    vi: "Thời tiết",
    emoji: "⛅",
    words: [
      { id: "sun", en: "Sun", vi: "Mặt trời", emoji: "☀️" },
      { id: "cloud", en: "Cloud", vi: "Đám mây", emoji: "☁️" },
      { id: "rain", en: "Rain", vi: "Mưa", emoji: "🌧️" },
      { id: "snow", en: "Snow", vi: "Tuyết", emoji: "❄️" },
      { id: "snowman", en: "Snowman", vi: "Người tuyết", emoji: "⛄" },
      { id: "wind", en: "Wind", vi: "Gió", emoji: "💨" },
      { id: "storm", en: "Storm", vi: "Bão", emoji: "⛈️" },
      { id: "lightning", en: "Lightning", vi: "Tia chớp", emoji: "⚡" },
      { id: "moon", en: "Moon", vi: "Mặt trăng", emoji: "🌙" },
      { id: "umbrella", en: "Umbrella", vi: "Cái ô", emoji: "☂️" },
      { id: "tornado", en: "Tornado", vi: "Lốc xoáy", emoji: "🌪️" },
      { id: "fog", en: "Fog", vi: "Sương mù", emoji: "🌫️" },
    ],
  },
  {
    id: "actions",
    en: "Actions",
    vi: "Hành động",
    emoji: "🏃",
    words: [
      { id: "run", en: "Run", vi: "Chạy", emoji: "🏃" },
      { id: "walk", en: "Walk", vi: "Đi bộ", emoji: "🚶" },
      { id: "jump", en: "Jump", vi: "Nhảy", emoji: "🤸" },
      { id: "swim", en: "Swim", vi: "Bơi", emoji: "🏊" },
      { id: "dance", en: "Dance", vi: "Nhảy múa", emoji: "💃" },
      { id: "sing", en: "Sing", vi: "Hát", emoji: "🎤" },
      { id: "eat", en: "Eat", vi: "Ăn", emoji: "😋" },
      { id: "drink", en: "Drink", vi: "Uống", emoji: "🥤" },
      { id: "sleep", en: "Sleep", vi: "Ngủ", emoji: "😴" },
      { id: "cry", en: "Cry", vi: "Khóc", emoji: "😢" },
      { id: "laugh", en: "Laugh", vi: "Cười", emoji: "😄" },
      { id: "clap", en: "Clap", vi: "Vỗ tay", emoji: "👏" },
      { id: "hug", en: "Hug", vi: "Ôm", emoji: "🤗" },
      { id: "kiss", en: "Kiss", vi: "Hôn", emoji: "😘" },
      { id: "read", en: "Read", vi: "Đọc sách", emoji: "📚" },
      { id: "write", en: "Write", vi: "Viết", emoji: "✍️" },
    ],
  },
  {
    id: "jobs",
    en: "Jobs",
    vi: "Nghề nghiệp",
    emoji: "👮",
    words: [
      { id: "doctor", en: "Doctor", vi: "Bác sĩ", emoji: "👨‍⚕️" },
      { id: "teacher", en: "Teacher", vi: "Cô giáo", emoji: "👩‍🏫" },
      { id: "police", en: "Police officer", vi: "Cảnh sát", emoji: "👮" },
      { id: "firefighter", en: "Firefighter", vi: "Lính cứu hỏa", emoji: "👨‍🚒" },
      { id: "farmer", en: "Farmer", vi: "Nông dân", emoji: "👨‍🌾" },
      { id: "chef", en: "Chef", vi: "Đầu bếp", emoji: "👨‍🍳" },
      { id: "pilot", en: "Pilot", vi: "Phi công", emoji: "👨‍✈️" },
      { id: "singer", en: "Singer", vi: "Ca sĩ", emoji: "👩‍🎤" },
      { id: "astronaut", en: "Astronaut", vi: "Phi hành gia", emoji: "👨‍🚀" },
      { id: "artist", en: "Artist", vi: "Họa sĩ", emoji: "👩‍🎨" },
      { id: "scientist", en: "Scientist", vi: "Nhà khoa học", emoji: "👨‍🔬" },
      { id: "builder", en: "Builder", vi: "Thợ xây", emoji: "👷" },
      { id: "nurse", en: "Nurse", vi: "Y tá", emoji: "👩‍⚕️" },
      { id: "mechanic", en: "Mechanic", vi: "Thợ sửa xe", emoji: "👨‍🔧" },
    ],
  },
  {
    id: "things",
    en: "Things",
    vi: "Đồ vật",
    emoji: "🎒",
    words: [
      { id: "book", en: "Book", vi: "Quyển sách", emoji: "📖" },
      { id: "chair", en: "Chair", vi: "Cái ghế", emoji: "🪑" },
      { id: "bed", en: "Bed", vi: "Cái giường", emoji: "🛏️" },
      { id: "clock", en: "Clock", vi: "Đồng hồ", emoji: "⏰" },
      { id: "phone", en: "Phone", vi: "Điện thoại", emoji: "📱" },
      { id: "tv", en: "TV", vi: "Ti vi", emoji: "📺" },
      { id: "key", en: "Key", vi: "Chìa khóa", emoji: "🔑" },
      { id: "scissors", en: "Scissors", vi: "Cái kéo", emoji: "✂️" },
      { id: "pencil", en: "Pencil", vi: "Bút chì", emoji: "✏️" },
      { id: "cup", en: "Cup", vi: "Cái cốc", emoji: "☕" },
      { id: "bag", en: "Bag", vi: "Cái ba lô", emoji: "🎒" },
      { id: "door", en: "Door", vi: "Cái cửa", emoji: "🚪" },
      { id: "lightbulb", en: "Light bulb", vi: "Bóng đèn", emoji: "💡" },
      { id: "soap", en: "Soap", vi: "Xà phòng", emoji: "🧼" },
      { id: "toothbrush", en: "Toothbrush", vi: "Bàn chải đánh răng", emoji: "🪥" },
      { id: "spoon", en: "Spoon", vi: "Cái thìa", emoji: "🥄" },
      { id: "crayon", en: "Crayon", vi: "Bút sáp màu", emoji: "🖍️" },
    ],
  },
  {
    id: "food",
    en: "Food",
    vi: "Đồ ăn",
    emoji: "🍚",
    words: [
      { id: "rice", en: "Rice", vi: "Cơm", emoji: "🍚" },
      { id: "bread", en: "Bread", vi: "Bánh mì", emoji: "🍞" },
      { id: "egg", en: "Egg", vi: "Quả trứng", emoji: "🥚" },
      { id: "milk", en: "Milk", vi: "Sữa", emoji: "🥛" },
      { id: "cheese", en: "Cheese", vi: "Phô mai", emoji: "🧀" },
      { id: "icecream", en: "Ice cream", vi: "Kem", emoji: "🍦" },
      { id: "cake", en: "Cake", vi: "Bánh ngọt", emoji: "🍰" },
      { id: "pizza", en: "Pizza", vi: "Bánh pizza", emoji: "🍕" },
      { id: "cookie", en: "Cookie", vi: "Bánh quy", emoji: "🍪" },
      { id: "candy", en: "Candy", vi: "Kẹo", emoji: "🍬" },
      { id: "noodles", en: "Noodles", vi: "Mì", emoji: "🍜" },
      { id: "honey", en: "Honey", vi: "Mật ong", emoji: "🍯" },
    ],
  },
  {
    id: "clothes",
    en: "Clothes",
    vi: "Quần áo",
    emoji: "👕",
    words: [
      { id: "shirt", en: "Shirt", vi: "Cái áo", emoji: "👕" },
      { id: "pants", en: "Pants", vi: "Cái quần", emoji: "👖" },
      { id: "dress", en: "Dress", vi: "Cái váy", emoji: "👗" },
      { id: "hat", en: "Hat", vi: "Cái mũ", emoji: "🧢" },
      { id: "shoes", en: "Shoes", vi: "Đôi giày", emoji: "👟" },
      { id: "socks", en: "Socks", vi: "Đôi tất", emoji: "🧦" },
      { id: "coat", en: "Coat", vi: "Áo khoác", emoji: "🧥" },
      { id: "scarf", en: "Scarf", vi: "Khăn quàng", emoji: "🧣" },
      { id: "gloves", en: "Gloves", vi: "Găng tay", emoji: "🧤" },
      { id: "boots", en: "Boots", vi: "Đôi bốt", emoji: "👢" },
    ],
  },
  {
    id: "vegetables",
    en: "Vegetables",
    vi: "Rau củ",
    emoji: "🥕",
    words: [
      { id: "carrot", en: "Carrot", vi: "Cà rốt", emoji: "🥕" },
      { id: "potato", en: "Potato", vi: "Khoai tây", emoji: "🥔" },
      { id: "corn", en: "Corn", vi: "Bắp ngô", emoji: "🌽" },
      { id: "cucumber", en: "Cucumber", vi: "Dưa leo", emoji: "🥒" },
      { id: "pumpkin", en: "Pumpkin", vi: "Bí đỏ", emoji: "🎃" },
      { id: "mushroom", en: "Mushroom", vi: "Cây nấm", emoji: "🍄" },
      { id: "broccoli", en: "Broccoli", vi: "Súp lơ xanh", emoji: "🥦" },
      { id: "eggplant", en: "Eggplant", vi: "Cà tím", emoji: "🍆" },
      { id: "onion", en: "Onion", vi: "Củ hành", emoji: "🧅" },
      { id: "garlic", en: "Garlic", vi: "Củ tỏi", emoji: "🧄" },
      { id: "pepper", en: "Pepper", vi: "Ớt chuông", emoji: "🫑" },
    ],
  },
  {
    id: "places",
    en: "Places",
    vi: "Nơi chốn",
    emoji: "🏫",
    words: [
      { id: "house", en: "House", vi: "Ngôi nhà", emoji: "🏠" },
      { id: "school", en: "School", vi: "Trường học", emoji: "🏫" },
      { id: "park", en: "Park", vi: "Công viên", emoji: "🏞️" },
      { id: "playground", en: "Playground", vi: "Sân chơi", emoji: "🛝" },
      { id: "hospital", en: "Hospital", vi: "Bệnh viện", emoji: "🏥" },
      { id: "store", en: "Store", vi: "Cửa hàng", emoji: "🏪" },
      { id: "beach", en: "Beach", vi: "Bãi biển", emoji: "🏖️" },
      { id: "bridge", en: "Bridge", vi: "Cây cầu", emoji: "🌉" },
    ],
  },
  {
    id: "sports",
    en: "Sports",
    vi: "Thể thao",
    emoji: "🏀",
    // Lưu ý: không có "Soccer ⚽" vì emoji ⚽ đã là "Ball" bên Đồ chơi
    // (trùng emoji giữa 2 từ vựng làm game lật thẻ ra 2 cặp cùng hình).
    words: [
      { id: "basketball", en: "Basketball", vi: "Bóng rổ", emoji: "🏀" },
      { id: "tennis", en: "Tennis", vi: "Quần vợt", emoji: "🎾" },
      { id: "baseball", en: "Baseball", vi: "Bóng chày", emoji: "⚾" },
      { id: "volleyball", en: "Volleyball", vi: "Bóng chuyền", emoji: "🏐" },
      { id: "football", en: "Football", vi: "Bóng bầu dục", emoji: "🏈" },
      { id: "badminton", en: "Badminton", vi: "Cầu lông", emoji: "🏸" },
      { id: "pingpong", en: "Ping pong", vi: "Bóng bàn", emoji: "🏓" },
      { id: "bowling", en: "Bowling", vi: "Bowling", emoji: "🎳" },
      { id: "golf", en: "Golf", vi: "Đánh gôn", emoji: "⛳" },
    ],
  },
  {
    id: "toys",
    en: "Toys",
    vi: "Đồ chơi",
    emoji: "🧸",
    // ball + teddybear + balloon chuyển từ Đồ vật sang đây (id giữ nguyên).
    words: [
      { id: "ball", en: "Ball", vi: "Quả bóng", emoji: "⚽" },
      { id: "teddybear", en: "Teddy bear", vi: "Gấu bông", emoji: "🧸" },
      { id: "balloon", en: "Balloon", vi: "Bóng bay", emoji: "🎈" },
      { id: "robot", en: "Robot", vi: "Rô bốt", emoji: "🤖" },
      { id: "kite", en: "Kite", vi: "Cánh diều", emoji: "🪁" },
      { id: "puzzle", en: "Puzzle", vi: "Ghép hình", emoji: "🧩" },
      { id: "doll", en: "Doll", vi: "Búp bê", emoji: "🪆" },
      { id: "dice", en: "Dice", vi: "Xúc xắc", emoji: "🎲" },
      { id: "yoyo", en: "Yo-yo", vi: "Con quay yo-yo", emoji: "🪀" },
      { id: "blocks", en: "Blocks", vi: "Khối xếp hình", emoji: "🧱" },
      { id: "videogame", en: "Video game", vi: "Trò chơi điện tử", emoji: "🎮" },
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
