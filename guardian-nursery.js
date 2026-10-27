"use strict";
// Collection, incubation and disclosed gacha rules, independent from the DOM.
(() => {
  const M = globalThis.GuardianModel;
  const tiers = {
    normal: {
      name: "Normal",
      color: "#75e59c",
      rate: 55,
      duplicateXP: 40,
      hatch: 30,
    },
    rare: {
      name: "Rare",
      color: "#69baff",
      rate: 30,
      duplicateXP: 100,
      hatch: 60,
    },
    epic: {
      name: "Epic",
      color: "#c293ff",
      rate: 12,
      duplicateXP: 240,
      hatch: 100,
    },
    legend: {
      name: "Legend",
      color: "#ff9560",
      rate: 2.5,
      duplicateXP: 600,
      hatch: 160,
    },
    rainbow: {
      name: "Rainbow",
      color: "#ffe7fa",
      rate: 0.5,
      duplicateXP: 1600,
      hatch: 240,
    },
  };
  const pets = [
    [
      "fox",
      "Hồ Ly Tinh Vân",
      "normal",
      "fox",
      "#bba2ff",
      0,
      "Người bạn đầu tiên, tinh nghịch và thích đuổi theo sao băng.",
    ],
    [
      "sprout",
      "Mầm Lá Sao",
      "normal",
      "sprout",
      "#80e4ad",
      400,
      "Một khu vườn nhỏ mọc lên từ những từ bạn đã nhớ.",
    ],
    [
      "rabbit",
      "Thỏ Kẹo Mây",
      "normal",
      "rabbit",
      "#ffc0df",
      600,
      "Đôi tai dài bắt được cả tiếng thì thầm của mặt trăng.",
    ],
    [
      "cat",
      "Mèo Trăng Non",
      "normal",
      "cat",
      "#a5caff",
      800,
      "Ngủ trên vành trăng, tỉnh dậy khi nghe bạn gõ chữ.",
    ],
    [
      "turtle",
      "Rùa Ngọc Lục",
      "normal",
      "turtle",
      "#76ddc7",
      1000,
      "Chậm rãi, bền bỉ, mang một hành tinh trên lưng.",
    ],
    [
      "penguin",
      "Cánh Cụt Băng Sao",
      "normal",
      "penguin",
      "#8dd8ff",
      1200,
      "Một mảnh băng sao nằm yên trên chiếc khăn quàng nhỏ.",
    ],
    [
      "hedgehog",
      "Nhím Hạt Dẻ Sao",
      "normal",
      "hedgehog",
      "#e8b17a",
      1400,
      "Gom những hạt dẻ lấp lánh sau mỗi buổi học.",
    ],
    [
      "raccoon",
      "Gấu Mèo Sao Băng",
      "normal",
      "raccoon",
      "#b3a6ff",
      1600,
      "Chiếc đuôi sọc vẽ đường bay cho những ngôi sao nhỏ.",
    ],
    [
      "otter",
      "Rái Cá San Hô",
      "normal",
      "otter",
      "#f7b59c",
      1800,
      "Ôm viên ngọc san hô, bơi qua những từ vừa nhớ.",
    ],
    [
      "seahorse",
      "Hải Mã Ngọc Lam",
      "normal",
      "seahorse",
      "#74dfd4",
      2000,
      "Đuôi cuộn giữ viên ngọc của đại dương xanh.",
    ],
    [
      "axolotl",
      "Kỳ Nhông Ngân Hà",
      "rare",
      "axolotl",
      "#ffaed8",
      1800,
      "Những nhánh mang lấp lánh như san hô giữa trời sao.",
    ],
    [
      "owl",
      "Cú Lam Thạch",
      "rare",
      "owl",
      "#92bfff",
      2400,
      "Đôi mắt lưu giữ ánh sáng của những thư viện cổ.",
    ],
    [
      "jelly",
      "Sứa Ngọc Biển Sao",
      "rare",
      "jelly",
      "#95e6f3",
      null,
      "Vị khách chỉ đến qua cổng triệu hồi.",
    ],
    [
      "deer",
      "Hươu Hoa Tuyết",
      "rare",
      "deer",
      "#c1e4ff",
      null,
      "Gạc kết tinh thành nhánh băng, bước chân không để dấu.",
    ],
    [
      "manta",
      "Cá Đuối Mây",
      "rare",
      "manta",
      "#9cbcff",
      null,
      "Lướt qua biển sao bằng đôi cánh trong suốt.",
    ],
    [
      "koi",
      "Cá Chép Nguyệt Châu",
      "rare",
      "koi",
      "#ffbba4",
      3000,
      "Mang viên nguyệt châu trên trán, bơi giữa những dòng chữ.",
    ],
    [
      "bat",
      "Dơi Âm Ngân",
      "rare",
      "bat",
      "#c1afff",
      3400,
      "Đôi cánh bắt nhịp những âm tiết bạn vừa học.",
    ],
    [
      "chameleon",
      "Tắc Kè Lăng Kính",
      "rare",
      "chameleon",
      "#a6e58e",
      3800,
      "Chiếc đuôi cuộn đổi màu theo ánh sáng của từng vì sao.",
    ],
    [
      "seal",
      "Hải Cẩu Băng Ngọc",
      "rare",
      "seal",
      "#a7e6ff",
      4200,
      "Lăn viên băng ngọc, tích góp những buổi ôn bền bỉ.",
    ],
    [
      "peacock",
      "Khổng Tước Lam Vũ",
      "rare",
      "peacock",
      "#8fcbff",
      4600,
      "Giữ từng ký ức trong mắt lông vũ óng ánh.",
    ],
    [
      "butterfly",
      "Điệp Vũ Hoàng Hôn",
      "epic",
      "butterfly",
      "#d3a2ff",
      null,
      "Hai đôi cánh mang theo màu của một hoàng hôn xa.",
    ],
    [
      "wolf",
      "Lang Ảnh Nguyệt",
      "epic",
      "wolf",
      "#aeb7ff",
      null,
      "Bộ lông tím bạc sáng lên theo từng chuỗi từ đúng.",
    ],
    [
      "lotus",
      "Tinh Linh Sen",
      "epic",
      "lotus",
      "#f2adf4",
      null,
      "Nở ra từ một hạt sáng, gìn giữ những ký ức mới.",
    ],
    [
      "whale",
      "Kình Ca Tinh Hải",
      "epic",
      "whale",
      "#9bbaff",
      null,
      "Khúc hát của nó nối những chòm sao rất xa nhau.",
    ],
    [
      "kirin",
      "Kỳ Lân Tử Tinh",
      "epic",
      "kirin",
      "#ceb2ff",
      null,
      "Sừng pha lê phản chiếu mọi từ bạn từng chinh phục.",
    ],
    [
      "beetle",
      "Bọ Giáp Tử Thiết",
      "epic",
      "beetle",
      "#986bdd",
      null,
      "Giáp cứng được tôi luyện qua những lần ôn bền bỉ.",
    ],
    [
      "lynx",
      "Linh Miêu Sương Tím",
      "epic",
      "lynx",
      "#b29dcf",
      null,
      "Bước chân lặng như sương, ánh mắt nhớ từng dấu chữ.",
    ],
    [
      "octopus",
      "Bạch Tuộc Mặc Ảnh",
      "epic",
      "octopus",
      "#8f74c6",
      null,
      "Tám xúc tu gom những mảnh ký ức giữa biển đêm.",
    ],
    [
      "scorpion",
      "Bọ Cạp Thạch Ảnh",
      "epic",
      "scorpion",
      "#9775bf",
      null,
      "Canh giữ những trang từ bằng đôi càng đá tím.",
    ],
    [
      "crane",
      "Hạc Tử Vân",
      "epic",
      "crane",
      "#b09acb",
      null,
      "Đôi cánh nhẹ nâng những âm tiết đi qua tầng mây.",
    ],
    [
      "dragon",
      "Long Vũ Cực Quang",
      "legend",
      "dragon",
      "#87e8c6",
      null,
      "Lông vũ ánh ngọc, đôi cánh ôm trọn một dải cực quang.",
    ],
    [
      "phoenix",
      "Phượng Hoàng Nhật Diệm",
      "legend",
      "phoenix",
      "#ffb074",
      null,
      "Từng chiếc lông là một tia lửa ấm không bao giờ tắt.",
    ],
    [
      "serpent",
      "Linh Xà Hỏa Tinh",
      "legend",
      "serpent",
      "#ffc18c",
      null,
      "Cuộn mình quanh những vành đai của sao Hỏa.",
    ],
    [
      "lion",
      "Sư Tử Vầng Dương",
      "legend",
      "lion",
      "#ffd48b",
      null,
      "Chiếc bờm rực sáng như một bình minh thu nhỏ.",
    ],
    [
      "griffin",
      "Sư Ưng Xích Kim",
      "legend",
      "griffin",
      "#ffab94",
      null,
      "Canh giữ cánh cổng giữa bình minh và hoàng hôn.",
    ],
    [
      "astra",
      "Tinh Long Vạn Sắc",
      "rainbow",
      "dragon",
      "#a4f2ff",
      null,
      "Linh long mang vảy của cả bảy dải ngân hà.",
    ],
    [
      "iris",
      "Hồ Ly Cửu Sắc",
      "rainbow",
      "fox",
      "#ffd0ef",
      null,
      "Những chiếc đuôi dệt thành cầu vồng giữa hư không.",
    ],
    [
      "nova",
      "Phượng Vũ Cầu Vồng",
      "rainbow",
      "phoenix",
      "#ffe7ac",
      null,
      "Tái sinh từ ánh sáng của những ngôi sao đầu tiên.",
    ],
    [
      "orion",
      "Thiên Kình Vĩnh Cửu",
      "rainbow",
      "whale",
      "#bcd6ff",
      null,
      "Mang đại dương ánh sáng trên đôi vây khổng lồ.",
    ],
    [
      "halo",
      "Kỳ Lân Thiên Quang",
      "rainbow",
      "kirin",
      "#ecceff",
      null,
      "Một chiếc sừng mở ra cả bầu trời đa sắc.",
    ],
  ].map(([id, name, rarity, art, color, price, description]) => ({
    id,
    name,
    rarity,
    art,
    color,
    price,
    description,
  }));
  const legacyStage = M.stage,
    baseValid = M.valid,
    baseReward = M.reward;
  M.pets.splice(0, M.pets.length, ...pets);
  const rng = () => {
    if (globalThis.crypto?.getRandomValues) {
      const a = new Uint32Array(1);
      globalThis.crypto.getRandomValues(a);
      return a[0] / 4294967296;
    }
    return Math.random();
  };
  const blank = () => ({
    version: 1,
    pets: { fox: { xp: 0, copies: 1, hatched: false } },
    eggs: ["fox"],
    incubator: { species: "fox", progress: 0, target: 30 },
    tickets: 10,
    ticketMisses: 0,
    pity: 0,
    pulls: 0,
    history: [],
  });
  function ensure(s) {
    if (s.nursery) {
      if (s.nursery.ticketMisses === undefined) s.nursery.ticketMisses = 0;
      return s.nursery;
    }
    const oldStage = legacyStage(s).index,
      n = blank();
    const available = [
      "fox",
      ...(s.activeDays.length >= 7 && M.distinct(s) >= 40 ? ["axolotl"] : []),
      ...(s.activeDays.length >= 21 && M.distinct(s) >= 80 ? ["dragon"] : []),
    ];
    if (!available.includes(s.pet)) available.push(s.pet);
    for (const id of available) {
      if (!pets.some((p) => p.id === id)) continue;
      n.pets[id] = {
        xp: s.xp,
        copies: 1,
        hatched: oldStage > 0 || id !== "fox",
      };
    }
    if (n.pets.fox.hatched) {
      n.eggs = [];
      n.incubator = null;
    } else n.incubator.progress = Math.min(29, s.cleanClears);
    s.nursery = n;
    return n;
  }
  const integer = (n) => Number.isSafeInteger(n) && n >= 0 && n <= 1e12;
  function valid(s) {
    const n = s.nursery;
    if (!n) return ["fox", "axolotl", "dragon"].includes(s.pet);
    if (
      n.version !== 1 ||
      !n.pets ||
      typeof n.pets !== "object" ||
      Array.isArray(n.pets) ||
      !["tickets", "pity", "pulls"].every((k) => integer(n[k])) ||
      (n.ticketMisses !== undefined &&
        (!integer(n.ticketMisses) || n.ticketMisses > 14)) ||
      n.pity > 49 ||
      n.pity > n.pulls
    )
      return false;
    if (
      !Object.entries(n.pets).every(
        ([id, p]) =>
          pets.some((x) => x.id === id) &&
          p &&
          integer(p.xp) &&
          integer(p.copies) &&
          p.copies >= 1 &&
          typeof p.hatched === "boolean" &&
          (p.incubation === undefined ||
            (integer(p.incubation) &&
              p.incubation <
                tiers[pets.find((x) => x.id === id).rarity].hatch)),
      )
    )
      return false;
    if (
      !n.pets.fox ||
      !n.pets[s.pet] ||
      (!n.pets[s.pet].hatched && s.pet !== "fox")
    )
      return false;
    if (
      !Array.isArray(n.eggs) ||
      new Set(n.eggs).size !== n.eggs.length ||
      !n.eggs.every((id) => n.pets[id] && !n.pets[id].hatched) ||
      !Object.entries(n.pets).every(([id, p]) =>
        p.hatched ? !n.eggs.includes(id) : n.eggs.includes(id),
      )
    )
      return false;
    if (n.incubator) {
      const i = n.incubator,
        p = pets.find((p) => p.id === i.species);
      if (
        !p ||
        !n.eggs.includes(i.species) ||
        !integer(i.progress) ||
        i.target !== tiers[p.rarity].hatch ||
        i.progress >= i.target
      )
        return false;
    }
    return (
      Array.isArray(n.history) &&
      n.history.length <= 50 &&
      n.history.every(
        (h) =>
          h &&
          integer(h.pull) &&
          h.pull > 0 &&
          h.pull <= n.pulls &&
          pets.some((p) => p.id === h.species) &&
          typeof h.duplicate === "boolean" &&
          integer(h.xp) &&
          typeof h.guaranteed === "boolean",
      )
    );
  }
  M.valid = (s, words) => baseValid(s, words) && valid(s);
  M.unlocked = () => true;
  M.petAvailable = (s, id) => !!ensure(s).pets[id]?.hatched;
  M.petLevel = (s, id = s.pet) => M.level(ensure(s).pets[id]?.xp || 0);
  const formCounts = { normal: 1, rare: 2, epic: 2, legend: 3, rainbow: 3 };
  M.formCount = (id) => formCounts[pets.find((p) => p.id === id)?.rarity] || 1;
  M.stage = (s, id = s.pet) => {
    const p = ensure(s).pets[id],
      level = M.level(p.xp),
      total = M.formCount(id);
    const index = !p.hatched
      ? 0
      : Math.min(total, level >= 16 ? 3 : level >= 8 ? 2 : 1);
    const names =
      total === 1
        ? ["Đang ấp", "Hình thái hoàn chỉnh"]
        : ["Đang ấp", "Ấu thú", "Trưởng thành", "Hình thái tối thượng"];
    const next =
      index === 0
        ? { name: "Nở trứng", level: 1 }
        : index < total
          ? { name: names[index + 1], level: index === 1 ? 8 : 16 }
          : null;
    return { index, name: names[index], next, total };
  };
  M.comboMultiplier = (n) => Math.min(5, 1 + Math.floor(n / 10));
  M.ticketChance = (n) =>
    [0.01, 0.02, 0.06, 0.08, 0.1][M.comboMultiplier(n) - 1];
  function receive(s, id) {
    const n = ensure(s),
      pet = pets.find((p) => p.id === id);
    if (!pet) return { ok: false, message: "Không tìm thấy loài này." };
    let duplicate = !!n.pets[id],
      xp = 0;
    if (duplicate) {
      xp = tiers[pet.rarity].duplicateXP;
      n.pets[id].xp += xp;
      n.pets[id].copies++;
    } else {
      n.pets[id] = { xp: 0, copies: 1, hatched: false };
      n.eggs.push(id);
    }
    return {
      ok: true,
      species: id,
      duplicate,
      xp,
      message: duplicate
        ? `Trùng ${pet.name}: +${xp} XP cho loài này.`
        : `Nhận trứng ${pet.name}! Chọn trứng vào lồng ấp để bắt đầu.`,
    };
  }
  function buyEgg(s, id) {
    const p = pets.find((p) => p.id === id);
    if (!p || p.price === null || p.price === 0)
      return { ok: false, message: "Trứng này chỉ có trong triệu hồi." };
    if (s.coins < p.price)
      return { ok: false, message: "Chưa đủ xu mua trứng." };
    s.coins -= p.price;
    return receive(s, id);
  }
  function incubate(s, id) {
    const n = ensure(s);
    if (n.incubator)
      return {
        ok: false,
        message: "Lồng ấp đang có trứng. Có thể cất trứng hiện tại để đổi.",
      };
    if (!n.eggs.includes(id))
      return { ok: false, message: "Bạn chưa có trứng này." };
    const p = pets.find((p) => p.id === id);
    n.incubator = {
      species: id,
      progress: n.pets[id].incubation || 0,
      target: tiers[p.rarity].hatch,
    };
    return {
      ok: true,
      message: "Đang ấp " + p.name + ". Mỗi từ gõ đúng là một nhịp ấp.",
    };
  }
  function pauseIncubation(s) {
    const n = ensure(s);
    if (n.incubator) {
      n.pets[n.incubator.species].incubation = n.incubator.progress;
      n.incubator = null;
    }
    return { ok: true, message: "Đã cất trứng, giữ nguyên tiến độ ấp." };
  }
  function rates(s) {
    const pity = ensure(s).pity;
    if (pity === 49)
      return { normal: 0, rare: 0, epic: 0, legend: 0, rainbow: 100 };
    const extra = pity >= 40 ? (pity - 39) * 0.5 : 0;
    return {
      normal: 55 - extra,
      rare: 30,
      epic: 12,
      legend: 2.5,
      rainbow: 0.5 + extra,
    };
  }
  function summon(s, random = rng) {
    const n = ensure(s);
    if (n.tickets < 10)
      return { ok: false, message: "Cần đủ 10 vé cho một lần triệu hồi." };
    const table = rates(s);
    let roll = random() * 100,
      rarity = "rainbow";
    for (const [key, percent] of Object.entries(table)) {
      if (roll < percent) {
        rarity = key;
        break;
      }
      roll -= percent;
    }
    let pool = pets.filter((p) => p.rarity === rarity);
    if (rarity === "rainbow") {
      const unseen = pool.filter((p) => !n.pets[p.id]);
      if (unseen.length) pool = unseen;
    }
    const selected =
        pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))],
      guaranteed = n.pity === 49;
    n.tickets -= 10;
    n.pulls++;
    n.pity = rarity === "rainbow" ? 0 : n.pity + 1;
    const result = receive(s, selected.id);
    n.history.unshift({
      pull: n.pulls,
      species: selected.id,
      duplicate: result.duplicate,
      xp: result.xp,
      guaranteed,
    });
    n.history = n.history.slice(0, 50);
    return { ...result, rarity, guaranteed, pull: n.pulls };
  }
  M.reward = (s, args) => {
    const n = ensure(s),
      before = M.stage(s).index,
      previous =
        args.date === s.day.date ? s.day.words[args.word]?.clean || 0 : 0,
      claimed = args.date === s.day.date ? [...s.day.missions] : [];
    const result = baseReward(s, args);
    let tickets = 0;
    n.pets[s.pet].xp += result.xp;
    if (args.clean) {
      n.ticketMisses++;
      const lucky =
        previous < 3 && (args.random || rng)() < M.ticketChance(args.combo);
      if (lucky || n.ticketMisses >= 15) {
        tickets++;
        n.ticketMisses = 0;
      }
      if (n.incubator) {
        const i = n.incubator;
        i.progress++;
        if (i.progress >= i.target) {
          n.pets[i.species].hatched = true;
          delete n.pets[i.species].incubation;
          n.eggs = n.eggs.filter((id) => id !== i.species);
          result.notices.push(
            "Trứng đã nở: " + pets.find((p) => p.id === i.species).name,
          );
          n.incubator = null;
        }
      }
    }
    for (const id of s.day.missions)
      if (!claimed.includes(id))
        tickets += { five: 2, fifteen: 4, due: 2 }[id] || 0;
    n.tickets += tickets;
    if (M.stage(s).index > before)
      result.notices.push("Tiến hóa: " + M.stage(s).name);
    return { ...result, tickets };
  };
  const API = {
    stage: M.stage,
    tiers,
    pets,
    ensure,
    valid,
    rng,
    receive,
    buyEgg,
    incubate,
    pauseIncubation,
    rates,
    summon,
  };
  globalThis.GuardianNursery = API;
})();
