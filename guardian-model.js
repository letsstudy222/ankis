"use strict";
// Pure progression rules. No DOM, storage, clock or network side effects.
(() => {
  const catalog = [
    {
      id: "ship-scout",
      slot: "ship",
      name: "Mũi tên Khởi Hành",
      price: 0,
      art: "scout",
      color: "#9ce6c0",
      description: "Tàu trinh sát đầu tiên của bạn.",
    },
    {
      id: "ship-kite",
      slot: "ship",
      name: "Cánh Én Bạc",
      price: 180,
      art: "kite",
      color: "#9bd6ff",
      description: "Hai cánh rộng, buồng lái xanh băng.",
    },
    {
      id: "ship-manta",
      slot: "ship",
      name: "Cá Đuối Tinh Vân",
      price: 750,
      art: "manta",
      color: "#c4afff",
      description: "Tàu lượn hình cá đuối, đuôi phát sáng.",
    },
    {
      id: "ship-phoenix",
      slot: "ship",
      name: "Phượng Hoàng Mặt Trời",
      price: 2800,
      art: "phoenix",
      color: "#ffd486",
      description: "Sải cánh vàng dành cho chuyến đi dài.",
    },
    {
      id: "sky-midnight",
      slot: "sky",
      name: "Đêm Khởi Hành",
      price: 0,
      art: "midnight",
      color: "#7764a1",
      description: "Bầu trời tím quen thuộc.",
    },
    {
      id: "sky-ocean",
      slot: "sky",
      name: "Biển Sao Lam",
      price: 150,
      art: "ocean",
      color: "#559fd5",
      description: "Một đại dương xanh giữa không gian.",
    },
    {
      id: "sky-aurora",
      slot: "sky",
      name: "Cực Quang",
      price: 650,
      art: "aurora",
      color: "#74e4c5",
      description: "Dải sáng xanh tím trôi sau tàu.",
    },
    {
      id: "sky-solar",
      slot: "sky",
      name: "Vành Nhật Thực",
      price: 1600,
      art: "solar",
      color: "#f7ad73",
      description: "Bay qua quầng sáng của một mặt trời xa.",
    },
    {
      id: "target-meteor",
      slot: "target",
      name: "Thiên Thạch",
      price: 0,
      art: "meteor",
      color: "#b3a5d9",
      description: "Đá vũ trụ mang theo nghĩa của từ.",
    },
    {
      id: "target-jelly",
      slot: "target",
      name: "Sứa Phiêu Lưu",
      price: 220,
      art: "jelly",
      color: "#f3a6d3",
      description: "Sứa hồng mềm mại trôi về phía bạn.",
    },
    {
      id: "target-ufo",
      slot: "target",
      name: "Đĩa Bay Tí Hon",
      price: 800,
      art: "ufo",
      color: "#b7e39a",
      description: "Một vị khách ngộ nghĩnh từ thiên hà khác.",
    },
    {
      id: "trail-mint",
      slot: "trail",
      name: "Tia Bạc Hà",
      price: 0,
      art: "mint",
      color: "#9ce6c0",
      description: "Tia bắn khởi đầu.",
    },
    {
      id: "trail-rose",
      slot: "trail",
      name: "Tia Hồng Tinh Tú",
      price: 180,
      art: "rose",
      color: "#ffa5d2",
      description: "Tia sáng hồng và lửa đuôi đồng màu.",
    },
    {
      id: "trail-gold",
      slot: "trail",
      name: "Tia Hoàng Kim",
      price: 950,
      art: "gold",
      color: "#ffda84",
      description: "Ánh vàng cho những đường bắn chuẩn xác.",
    },
  ];
  const pets = [
    { id: "fox", name: "Hồ Ly Tinh Vân", days: 0, words: 0, color: "#c4afff" },
    {
      id: "axolotl",
      name: "Kỳ Nhông Ngân Hà",
      days: 7,
      words: 40,
      color: "#f6b2d7",
    },
    {
      id: "dragon",
      name: "Long Vũ Cực Quang",
      days: 21,
      words: 80,
      color: "#93e3c5",
    },
  ];
  const sectors = [
    {
      id: "dock",
      name: "Bến Khởi Hành",
      clears: 0,
      days: 0,
      words: 0,
      coins: 0,
    },
    {
      id: "moon",
      name: "Vườn Trăng",
      clears: 60,
      days: 3,
      words: 10,
      coins: 50,
    },
    {
      id: "reef",
      name: "Rạn San Hô Sao",
      clears: 180,
      days: 7,
      words: 25,
      coins: 100,
    },
    {
      id: "nebula",
      name: "Thư Viện Tinh Vân",
      clears: 450,
      days: 14,
      words: 45,
      coins: 180,
    },
    {
      id: "rings",
      name: "Cổng Vành Đai",
      clears: 1000,
      days: 30,
      words: 65,
      coins: 350,
    },
    {
      id: "dawn",
      name: "Bình Minh Vĩnh Cửu",
      clears: 2200,
      days: 60,
      words: 90,
      coins: 700,
    },
  ];
  const defaults = {
    ship: "ship-scout",
    sky: "sky-midnight",
    target: "target-meteor",
    trail: "trail-mint",
  };
  const dayState = (date) => ({ date, words: {}, missions: [] });
  const create = () => ({
    version: 1,
    xp: 0,
    coins: 0,
    totalClears: 0,
    cleanClears: 0,
    bestScore: 0,
    bestCombo: 0,
    activeDays: [],
    vocabulary: {},
    owned: Object.values(defaults),
    equipment: { ...defaults },
    pet: "fox",
    petName: "",
    sectors: ["dock"],
    day: dayState(""),
  });
  const integer = (v) => Number.isSafeInteger(v) && v >= 0 && v <= 1e12;
  const object = (v) => v && typeof v === "object" && !Array.isArray(v);
  const dayString = (d) =>
    typeof d === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(d) &&
    !Number.isNaN(Date.parse(d));
  const unique = (a) => new Set(a).size === a.length;
  const level = (xp) => Math.floor((Math.sqrt(4225 + 60 * xp) - 65) / 30) + 1;
  const threshold = (l) => 15 * (l - 1) ** 2 + 65 * (l - 1);
  const distinct = (s) => Object.keys(s.vocabulary).length;
  const petAvailable = (s, id) => {
    if (s.nursery) return !!s.nursery.pets[id]?.hatched;
    const p = pets.find((p) => p.id === id);
    return !!p && s.activeDays.length >= p.days && distinct(s) >= p.words;
  };
  const unlocked = (s, item) => true;
  function valid(s, wordList) {
    if (
      !object(s) ||
      s.version !== 1 ||
      ![
        "xp",
        "coins",
        "totalClears",
        "cleanClears",
        "bestScore",
        "bestCombo",
      ].every((k) => integer(s[k]))
    )
      return false;
    if (
      !Array.isArray(s.activeDays) ||
      !unique(s.activeDays) ||
      !s.activeDays.every(dayString)
    )
      return false;
    const allowed = new Set(wordList);
    if (
      !object(s.vocabulary) ||
      !Object.entries(s.vocabulary).every(
        ([w, n]) => allowed.has(w) && integer(n) && n > 0,
      )
    )
      return false;
    if (
      !Array.isArray(s.owned) ||
      !unique(s.owned) ||
      !s.owned.every((id) => catalog.some((i) => i.id === id)) ||
      !Object.values(defaults).every((id) => s.owned.includes(id))
    )
      return false;
    if (
      !object(s.equipment) ||
      !Object.keys(defaults).every(
        (slot) =>
          catalog.some((i) => i.id === s.equipment[slot] && i.slot === slot) &&
          s.owned.includes(s.equipment[slot]),
      )
    )
      return false;
    if (
      !pets.some((p) => p.id === s.pet) ||
      typeof s.petName !== "string" ||
      s.petName.length > 24
    )
      return false;
    if (
      !Array.isArray(s.sectors) ||
      !unique(s.sectors) ||
      !s.sectors.includes("dock") ||
      !s.sectors.every((id) => sectors.some((x) => x.id === id))
    )
      return false;
    if (
      !object(s.day) ||
      (s.day.date !== "" && !dayString(s.day.date)) ||
      !object(s.day.words) ||
      !Array.isArray(s.day.missions) ||
      !unique(s.day.missions) ||
      !s.day.missions.every((id) => ["five", "fifteen", "due"].includes(id))
    )
      return false;
    return Object.entries(s.day.words).every(
      ([w, r]) =>
        allowed.has(w) &&
        object(r) &&
        integer(r.clean) &&
        r.clean <= 3 &&
        typeof r.due === "boolean" &&
        typeof r.effort === "boolean",
    );
  }
  function today(s, date) {
    if (s.day.date !== date) s.day = dayState(date);
    return s.day;
  }
  function missions(s) {
    const list = Object.values(s.day.words);
    return [
      {
        id: "five",
        title: "Khởi động 5 vì sao",
        description: "Gõ đúng 5 từ khác nhau",
        value: list.filter((r) => r.clean > 0).length,
        target: 5,
        coins: 10,
      },
      {
        id: "fifteen",
        title: "Mở rộng quỹ đạo",
        description: "Gõ đúng 15 từ khác nhau",
        value: list.filter((r) => r.clean > 0).length,
        target: 15,
        coins: 20,
      },
      {
        id: "due",
        title: "Đúng lúc, nhớ lâu",
        description: "Gõ đúng 3 từ đến hạn khác nhau",
        value: list.filter((r) => r.due).length,
        target: 3,
        coins: 15,
      },
    ];
  }
  function stage(s) {
    if (s.nursery) return globalThis.GuardianNursery.stage(s);
    const l = level(s.xp),
      d = s.activeDays.length;
    const stages = [
      { name: "Trứng Tinh Tú", level: 1, days: 0 },
      { name: "Mầm Sao", level: 2, days: 2 },
      { name: "Bạn Đồng Hành", level: 8, days: 7 },
      { name: "Vệ Binh Trưởng Thành", level: 16, days: 21 },
      { name: "Huyền Thoại Thiên Hà", level: 28, days: 45 },
    ];
    let index = 0;
    for (let i = 1; i < stages.length; i++)
      if (l >= stages[i].level && d >= stages[i].days) index = i;
    return { index, ...stages[index], next: stages[index + 1] || null };
  }
  function badges(s) {
    return [
      {
        id: "first",
        name: "Tia sáng đầu tiên",
        value: s.cleanClears,
        target: 1,
      },
      { id: "combo", name: "Nhịp điệu 20", value: s.bestCombo, target: 20 },
      { id: "words", name: "Người gom 50 từ", value: distinct(s), target: 50 },
      {
        id: "days",
        name: "30 ngày đồng hành",
        value: s.activeDays.length,
        target: 30,
      },
      {
        id: "voyager",
        name: "Nhà du hành bình minh",
        value: s.sectors.includes("dawn") ? 1 : 0,
        target: 1,
      },
    ];
  }
  function buy(s, id) {
    const item = catalog.find((i) => i.id === id);
    if (!item) return { ok: false, message: "Không tìm thấy vật phẩm." };
    if (s.owned.includes(id)) return equip(s, id);
    if (s.coins < item.price)
      return {
        ok: false,
        message: "Chưa đủ xu. Tiếp tục học để tích lũy nhé.",
      };
    s.coins -= item.price;
    s.owned.push(id);
    s.equipment[item.slot] = id;
    return { ok: true, message: "Đã mua và trang bị " + item.name + "." };
  }
  function equip(s, id) {
    const item = catalog.find((i) => i.id === id);
    if (!item || !s.owned.includes(id))
      return { ok: false, message: "Bạn chưa sở hữu vật phẩm này." };
    s.equipment[item.slot] = id;
    return { ok: true, message: "Đã trang bị " + item.name + "." };
  }
  function reward(s, { word, clean, due, score, combo, date }) {
    today(s, date);
    s.totalClears++;
    s.bestScore = Math.max(s.bestScore, score);
    s.bestCombo = Math.max(s.bestCombo, combo);
    const beforeLevel = level(s.xp),
      beforeStage = stage(s).index,
      entry =
        s.day.words[word] ||
        (s.day.words[word] = { clean: 0, due: false, effort: false });
    let xp = 0,
      coins = 0;
    const notices = [];
    if (clean) {
      s.cleanClears++;
      s.vocabulary[word] = (s.vocabulary[word] || 0) + 1;
      const n = entry.clean;
      xp = [8, 3, 1][n] || 0;
      coins = [3, 1, 0][n] || 0;
      if (n === 0 && due) {
        xp += 4;
        coins += 2;
        entry.due = true;
      }
      entry.clean = Math.min(3, n + 1);
    } else if (!entry.effort && entry.clean === 0) {
      xp = 1;
      entry.effort = true;
    }
    s.xp += xp;
    s.coins += coins;
    if (
      Object.values(s.day.words).filter((r) => r.clean > 0).length >= 5 &&
      !s.activeDays.includes(date)
    ) {
      s.activeDays.push(date);
      notices.push("Thêm 1 ngày đồng hành");
    }
    for (const m of missions(s))
      if (m.value >= m.target && !s.day.missions.includes(m.id)) {
        s.day.missions.push(m.id);
        s.coins += m.coins;
        coins += m.coins;
        notices.push("Nhiệm vụ: " + m.title);
      }
    for (const sector of sectors)
      if (
        !s.sectors.includes(sector.id) &&
        s.cleanClears >= sector.clears &&
        s.activeDays.length >= sector.days &&
        distinct(s) >= sector.words
      ) {
        s.sectors.push(sector.id);
        s.coins += sector.coins;
        coins += sector.coins;
        notices.push("Đã đến " + sector.name);
      }
    if (level(s.xp) > beforeLevel)
      notices.push("Trạm Sao lên cấp " + level(s.xp));
    if (stage(s).index > beforeStage)
      notices.push("Tiến hóa: " + stage(s).name);
    return { xp, coins, notices };
  }
  globalThis.GuardianModel = {
    catalog,
    pets,
    sectors,
    defaults,
    create,
    valid,
    today,
    level,
    threshold,
    distinct,
    stage,
    missions,
    badges,
    buy,
    equip,
    reward,
    petAvailable,
    unlocked,
  };
})();
