"use strict";
(() => {
  const M = GuardianModel,
    baseReward = M.reward,
    baseChance = M.ticketChance,
    baseValid = M.valid;
  const specs = {
    "ship-scout": { price: 0, hintEvery: 18 },
    "ship-kite": { price: 2400, hintEvery: 12 },
    "ship-manta": { price: 12000, hintEvery: 8 },
    "ship-phoenix": { price: 48000, hintEvery: 5 },
    "target-meteor": { price: 0, ticketBonus: 0 },
    "target-jelly": { price: 4000, ticketBonus: 0.01 },
    "target-ufo": { price: 16000, ticketBonus: 0.02 },
    "sky-midnight": { price: 0, timeBonus: 0 },
    "sky-ocean": { price: 2000, timeBonus: 2 },
    "sky-aurora": { price: 9000, timeBonus: 4 },
    "sky-solar": { price: 30000, timeBonus: 7 },
    "trail-mint": { price: 0, coinBonus: 0 },
    "trail-rose": { price: 3000, coinBonus: 1 },
    "trail-gold": { price: 16000, coinBonus: 2 },
  };
  M.catalog.push(
    {
      id: "target-comet",
      slot: "target",
      name: "Đĩa Bay Ngân Hà",
      art: "ufo",
      color: "#ddd6b5",
      price: 45000,
      ticketBonus: 0.03,
    },
    {
      id: "trail-sapphire",
      slot: "trail",
      name: "Tia Lam Bền Bỉ",
      art: "gold",
      color: "#86bbdd",
      price: 55000,
      coinBonus: 3,
    },
  );
  for (const item of M.catalog) {
    Object.assign(item, specs[item.id] || {});
    item.description =
      item.slot === "ship"
        ? `Tích 1 lượt mở chữ sau ${item.hintEvery} từ tự nhớ đúng. Giữ tối đa 1 lượt; dùng bằng Tab trong ô nhập.`
        : item.slot === "target"
          ? `Cộng ${Math.round((item.ticketBonus || 0) * 100)} điểm % vào tỷ lệ vé, tối đa 100%. Bảo hiểm 20 từ giữ nguyên.`
          : item.slot === "sky"
            ? `Thêm ${item.timeBonus || 0} giây cho mỗi từ trong Vệ binh.`
            : `Thêm ${item.coinBonus || 0} xu khi tự nhớ đúng một từ lần đầu trong ngày. Từ lặp không nhận khoản thêm.`;
  }
  const effects = (s) =>
    Object.fromEntries(
      Object.values(s.equipment)
        .map((id) => M.catalog.find((i) => i.id === id))
        .filter(Boolean)
        .flatMap((i) =>
          Object.entries(i).filter(([key]) =>
            ["hintEvery", "ticketBonus", "timeBonus", "coinBonus"].includes(
              key,
            ),
          ),
        ),
    );
  function ensure(s) {
    if (!s.gear) s.gear = { version: 1, hintCharge: 0, hintProgress: 0 };
    const goal = effects(s).hintEvery || 18;
    if (!s.gear.hintCharge)
      s.gear.hintProgress = Math.min(s.gear.hintProgress, goal - 1);
    return s.gear;
  }
  M.valid = (s, words) =>
    baseValid(s, words) &&
    (!s.gear ||
      (s.gear.version === 1 &&
        [0, 1].includes(s.gear.hintCharge) &&
        Number.isInteger(s.gear.hintProgress) &&
        s.gear.hintProgress >= 0 &&
        s.gear.hintProgress < 18 &&
        (!s.gear.hintCharge || s.gear.hintProgress === 0)));
  M.ticketChance = (s) =>
    Math.min(1, baseChance(s) + (effects(s).ticketBonus || 0));
  M.reward = (s, args) => {
    const first =
        args.clean &&
        (s.day.date !== args.date || !s.day.words[args.word]?.clean),
      result = baseReward(s, args),
      gear = ensure(s),
      power = effects(s);
    if (args.clean) {
      if (!gear.hintCharge && ++gear.hintProgress >= (power.hintEvery || 18)) {
        gear.hintCharge = 1;
        gear.hintProgress = 0;
        result.notices.push("Tàu đã nạp 1 lượt mở chữ · Tab");
      }
      if (first && power.coinBonus) {
        s.coins += power.coinBonus;
        result.coins += power.coinBonus;
      }
    }
    return result;
  };
  function useHint(s) {
    const g = ensure(s);
    if (!g.hintCharge) return false;
    g.hintCharge = 0;
    g.hintProgress = 0;
    return true;
  }
  globalThis.GuardianEquipment = { effects, ensure, useHint };
})();
