"use strict";
(() => {
  let serial = 0;
  const tier = (item) => {
    const slots = GuardianModel.catalog.filter((i) => i.slot === item.slot);
    return Math.max(1, slots.findIndex((i) => i.id === item.id) + 1);
  };
  function draw(item) {
    const key = `gear-${++serial}`,
      color = item.color || "#a0d8db";
    const defs = `<defs><linearGradient id="${key}-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e2eff4"/><stop offset=".38" stop-color="${color}"/><stop offset=".65" stop-color="#536e88"/><stop offset="1" stop-color="#182f49"/></linearGradient><linearGradient id="${key}-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#efffff"/><stop offset=".3" stop-color="#87e4ed"/><stop offset="1" stop-color="#195477"/></linearGradient><linearGradient id="${key}-flame" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff5ca"/><stop offset=".32" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient><radialGradient id="${key}-halo"><stop stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>`;
    const metal = `url(#${key}-metal)`,
      glass = `url(#${key}-glass)`,
      flame = `url(#${key}-flame)`;
    let art = "";
    if (item.slot === "ship") {
      const hulls = {
        scout: `<path d="M80 8 103 65 121 90 96 84 80 97 64 84 39 90 57 65Z" fill="${metal}" stroke="#cae2e8" stroke-width="1.5"/><path d="M59 64 46 85 66 76M101 64 114 85 94 76" fill="#263e58" stroke="${color}" stroke-width="1.3"/><path d="M80 13v21M70 80l10 9 10-9" stroke="#e2f5f8" stroke-opacity=".7"/><path d="M61 83v8m38-8v8" stroke="#97f3e5" stroke-width="3"/>`,
        kite: `<path d="M80 10 103 45 142 69 134 91 101 81 80 93 59 81 26 91 18 69 57 45Z" fill="${metal}" stroke="#d6e8ef" stroke-width="1.4"/><path d="M24 70 58 59 68 76 33 84ZM136 70 102 59 92 76 127 84Z" fill="#233b56" stroke="${color}"/><path d="m28 73 28-10m76 10-28-10M48 54l-6 23m70-23 6 23" stroke="#a9e6ed" stroke-width="1.3"/><path d="M51 84v11m58-11v11" stroke="${color}" stroke-width="5"/><circle cx="43" cy="78" r="2" fill="#fff4c1"/><circle cx="117" cy="78" r="2" fill="#fff4c1"/>`,
        manta: `<path d="M80 18C59 21 51 42 40 51L7 62 13 82C37 94 58 88 80 74 102 88 123 94 147 82L153 62 120 51C109 42 101 21 80 18Z" fill="${metal}" stroke="#c7e4ef" stroke-width="1.5"/><path d="M15 65c23 0 36-10 48-25L53 68 28 78ZM145 65c-23 0-36-10-48-25l10 28 25 10Z" fill="#213754" stroke="${color}"/><path d="M23 68 47 62M137 68 113 62M80 12v15M69 77 80 92 91 77" stroke="#d6f8f9" stroke-width="1.4"/><path d="M40 79v14m80-14v14" stroke="${color}" stroke-width="5"/><circle cx="30" cy="72" r="3" fill="#fff5c8"/><circle cx="130" cy="72" r="3" fill="#fff5c8"/>`,
        phoenix: `<path d="M80 17 57 41 22 11 28 43 6 34 19 77 55 91 80 73 105 91 141 77 154 34 132 43 138 11 103 41Z" fill="${metal}" stroke="#f4e1b2" stroke-width="1.6"/><path d="m17 48 24 13-10-30 30 28-6 19-29-9Zm126 0-24 13 10-30-30 28 6 19 29-9Z" fill="#2d364d" stroke="#e8c58c"/><path d="M25 57 52 71m83-14-27 14M42 45l16 17m60-17-16 17M80 9v14" stroke="#f7dfb4" stroke-width="1.5"/><path d="M35 79v16m90-16v16M57 86v13m46-13v13" stroke="${color}" stroke-width="4"/><circle cx="80" cy="69" r="8" fill="#f2db9a" stroke="#fff0c9"/><circle cx="80" cy="69" r="4" fill="#fff8da"/>`,
      };
      art = `<ellipse cx="80" cy="78" rx="67" ry="43" fill="url(#${key}-halo)"/><path class="gear-exhaust" d="M69 86 80 120 91 86Z" fill="${flame}"/>${hulls[item.art] || hulls.scout}<path d="M80 25 91 54 80 64 69 54Z" fill="${glass}" stroke="#d5faff" stroke-width="1.2"/><path d="m80 30 4 12M72 55l8 6" stroke="#fff" stroke-opacity=".7"/><path d="M63 71h7m20 0h7M78 76h4" stroke="#fff" stroke-opacity=".5"/><circle cx="61" cy="73" r="1.4" fill="${color}"/><circle cx="99" cy="73" r="1.4" fill="${color}"/>`;
    } else if (item.slot === "target") {
      const meteor = `<path d="M27 49 43 25 77 15 107 29 130 60 120 89 94 106 53 98 30 76Z" fill="${metal}" stroke="#ddd9ec" stroke-width="1.3"/><path d="m43 25 14 25-27 26m27-26 25 19 25-40M82 69l12 37m-12-37 38 20M53 98l4-48M77 15l5 54" stroke="#20374e" stroke-width="1.2" opacity=".7"/><ellipse cx="57" cy="47" rx="12" ry="9" fill="#223149" stroke="#a2a6c5"/><ellipse cx="98" cy="75" rx="17" ry="13" fill="#223149" stroke="#a2a6c5"/><ellipse cx="52" cy="82" rx="6" ry="5" fill="#354159"/><path d="m47 43 11-3m33 31 13-3" stroke="#d9d6e7" stroke-opacity=".4"/><circle cx="81" cy="36" r="3" fill="#e3bba2"/>`;
      const jelly = `<path class="gear-tendrils" d="M48 64q-20 18-6 31t-2 18M65 67q15 20-2 29t-6 17M94 67q-15 20 2 29t6 17M112 64q20 18 6 31t2 18" stroke="${color}" stroke-width="4" stroke-linecap="round"/><path d="M32 65C30 3 130 3 128 65Q80 83 32 65Z" fill="${metal}" stroke="#ddf8fa" stroke-width="1.4"/><path d="M43 56Q80 68 117 56M54 27Q39 41 43 53M67 18Q57 33 57 46M89 20q12 12 15 27" stroke="#d5fafb" stroke-opacity=".5" stroke-width="2"/><circle cx="64" cy="50" r="4" fill="#162e49"/><circle cx="96" cy="50" r="4" fill="#162e49"/><path d="M75 59q5 5 10 0" stroke="#24435c" stroke-width="2"/><circle cx="63" cy="48" r="1.5" fill="#fff"/><circle cx="95" cy="48" r="1.5" fill="#fff"/><g fill="#d9fbf5"><circle cx="52" cy="62" r="2"/><circle cx="69" cy="67" r="2"/><circle cx="91" cy="67" r="2"/><circle cx="109" cy="62" r="2"/></g>`;
      const advanced = item.id === "target-comet";
      const ufo = `<path d="M45 59C42 7 118 7 115 59" fill="${glass}" stroke="#d9f4fc" stroke-width="1.4"/><path d="M53 45q2-20 22-22" stroke="#fff" stroke-opacity=".65" stroke-width="3"/><path d="M45 80 24 111h112l-21-31" fill="${color}" opacity=".08"/><ellipse cx="80" cy="66" rx="67" ry="22" fill="${metal}" stroke="#cce5ee" stroke-width="1.3"/><ellipse cx="80" cy="63" rx="50" ry="13" fill="#223f58" stroke="${color}"/><path d="M58 50q22 9 44 0" stroke="#e3faff" stroke-width="1.5"/><ellipse cx="80" cy="81" rx="23" ry="6" fill="#d9eff2" opacity=".7"/><g fill="${color}" stroke="#efffff"><circle cx="27" cy="65" r="3"/><circle cx="48" cy="74" r="3"/><circle cx="80" cy="77" r="3"/><circle cx="112" cy="74" r="3"/><circle cx="133" cy="65" r="3"/></g>${advanced ? `<ellipse class="gear-orbit-ring" cx="80" cy="66" rx="77" ry="31" transform="rotate(-14 80 66)" stroke="#f3dfaa" stroke-width="1.5" stroke-dasharray="13 5 3 5"/><path d="M31 47 21 31l23 6m85 10 10-16-23 6" fill="#d8c290" stroke="#fff0c9"/><path d="M66 22 80 10l14 12M80 90v20" stroke="#ead7ac" stroke-width="2"/><circle cx="80" cy="36" r="7" fill="#f8e6b0" stroke="#fff2cf"/>` : `<path d="M37 81 31 94m92-13 6 13" stroke="#b9e4e9" stroke-width="3"/>`}`;
      art = `<ellipse cx="80" cy="62" rx="76" ry="54" fill="url(#${key}-halo)"/>${item.art === "meteor" ? meteor : item.art === "jelly" ? jelly : ufo}`;
    } else if (item.slot === "trail") {
      const rank = tier(item);
      art = `<ellipse cx="80" cy="66" rx="65" ry="50" fill="url(#${key}-halo)"/><path d="M24 99 80 16l56 83" stroke="${color}" stroke-opacity=".12"/><path d="M80 97V16" stroke="${color}" stroke-width="${rank === 1 ? 4 : 8}" stroke-linecap="round" opacity=".35"/><path d="M80 97V16" stroke="#eafff9" stroke-width="2" stroke-linecap="round"/>${rank >= 2 ? `<path d="m70 94 4-20-5-18 6-17m15 55-4-20 5-18-6-17" stroke="${color}" stroke-width="2"/>` : ""}${rank >= 3 ? `<ellipse cx="80" cy="59" rx="22" ry="8" fill="none" stroke="${color}" stroke-width="2"/><ellipse cx="80" cy="82" rx="29" ry="10" fill="none" stroke="${color}" stroke-opacity=".5"/>` : ""}${rank === 4 ? `<path d="m57 47 6 5-6 5-6-5Zm46 0 6 5-6 5-6-5ZM80 5l6 10-6 10-6-10Z" fill="#d4f6ff" stroke="${color}"/>` : `<circle cx="80" cy="16" r="${rank + 2}" fill="#effff5"/>`}<path d="M53 105 62 96h36l9 9" fill="#344e65" stroke="#a1c3cd"/><path d="M71 104h18" stroke="${color}" stroke-width="2"/>`;
    }
    return `<span class="g-art gear-art gear-${item.slot}" data-gear-art="${item.id}" style="--gear-accent:${color}"><svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${art}</svg></span>`;
  }
  function weather() {
    return `<span class="gear-weather" aria-hidden="true"><i class="gear-meteor"></i><i class="gear-meteor"></i><i class="gear-meteor"></i><span class="gear-nebula"></span></span>`;
  }
  function preview(item) {
    const sky = item.slot === "sky" ? item.art : "midnight";
    return `<div class="gear-preview-scene" data-sky="${sky}" data-gear-preview="${item.id}" style="--gear-accent:${item.color || "#9dd8d9"}">${weather()}${item.slot === "sky" ? '<span class="gear-sky-orbit" aria-hidden="true"></span>' : draw(item)}<span class="gear-scanline" aria-hidden="true"></span></div>`;
  }
  function beam(item) {
    const rank = tier(item),
      c = item.color;
    return `<svg viewBox="0 0 32 220" preserveAspectRatio="none" aria-hidden="true"><path d="M16 220V0" stroke="${c}" stroke-width="${rank + 4}" opacity=".35"/><path d="M16 220V0" stroke="#effffb" stroke-width="2"/>${rank >= 2 ? `<path d="m8 220 4-35-3-35 4-35-4-35 4-35-3-45M24 220l-4-35 3-35-4-35 4-35-4-35 3-45" stroke="${c}" stroke-width="1.5"/>` : ""}${rank >= 3 ? `<path d="M5 174h22M7 122h18M5 70h22M7 18h18" stroke="${c}" stroke-width="2" opacity=".8"/>` : ""}${rank === 4 ? `<path d="m16 38 8 10-8 10-8-10Zm0 100 8 10-8 10-8-10Z" fill="${c}"/>` : ""}</svg>`;
  }
  function effect(item) {
    return item.slot === "ship"
      ? `${item.hintEvery} từ / lượt mở chữ`
      : item.slot === "sky"
        ? `+${item.timeBonus} giây / từ`
        : item.slot === "target"
          ? `+${Math.round(item.ticketBonus * 100)} điểm % vé`
          : `+${item.coinBonus} xu / từ đầu ngày`;
  }
  globalThis.GuardianGearArt = { draw, preview, weather, beam, effect, tier };
})();
