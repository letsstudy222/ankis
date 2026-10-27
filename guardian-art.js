"use strict";
(() => {
  const assets = {
    fox: { 1: "./assets/pets/normal/fox-1.png" },
    sprout: { 1: "./assets/pets/normal/sprout-1.png" },
    rabbit: { 1: "./assets/pets/normal/rabbit-1.png" },
    cat: { 1: "./assets/pets/normal/cat-1.png" },
    turtle: { 1: "./assets/pets/normal/turtle-1.png" },
    axolotl: {
      1: "./assets/pets/rare/axolotl-1.png",
      2: "./assets/pets/rare/axolotl-2.png",
    },
    owl: {
      1: "./assets/pets/rare/owl-1.png",
      2: "./assets/pets/rare/owl-2.png",
    },
    jelly: {
      1: "./assets/pets/rare/jelly-1.png",
      2: "./assets/pets/rare/jelly-2.png",
    },
    deer: {
      1: "./assets/pets/rare/deer-1.png",
      2: "./assets/pets/rare/deer-2.png",
    },
    manta: {
      1: "./assets/pets/rare/manta-1.png",
      2: "./assets/pets/rare/manta-2.png",
    },
    butterfly: {
      1: "./assets/pets/epic/butterfly-1.png",
      2: "./assets/pets/epic/butterfly-2.png",
    },
    wolf: {
      1: "./assets/pets/epic/wolf-1.png",
      2: "./assets/pets/epic/wolf-2.png",
    },
    lotus: {
      1: "./assets/pets/epic/lotus-1.png",
      2: "./assets/pets/epic/lotus-2.png",
    },
    whale: {
      1: "./assets/pets/epic/whale-1.png",
      2: "./assets/pets/epic/whale-2.png",
    },
    kirin: {
      1: "./assets/pets/epic/kirin-1.png",
      2: "./assets/pets/epic/kirin-2.png",
    },
    dragon: {
      1: "./assets/pets/legend/dragon-1.png",
      2: "./assets/pets/legend/dragon-2-v2.png",
      3: "./assets/pets/legend/dragon-3-v2.png",
    },
    phoenix: {
      1: "./assets/pets/legend/phoenix-1.png",
      2: "./assets/pets/legend/phoenix-2-v2.png",
      3: "./assets/pets/legend/phoenix-3-v2.png",
    },
    serpent: {
      1: "./assets/pets/legend/serpent-1.png",
      2: "./assets/pets/legend/serpent-2-v2.png",
      3: "./assets/pets/legend/serpent-3-v2.png",
    },
    lion: {
      1: "./assets/pets/legend/lion-1.png",
      2: "./assets/pets/legend/lion-2-v2.png",
      3: "./assets/pets/legend/lion-3-v2.png",
    },
    griffin: {
      1: "./assets/pets/legend/griffin-1.png",
      2: "./assets/pets/legend/griffin-2-v2.png",
      3: "./assets/pets/legend/griffin-3-v2.png",
    },
    astra: {
      1: "./assets/pets/rainbow/astra-1.png",
      2: "./assets/pets/rainbow/astra-2.png",
      3: "./assets/pets/rainbow/astra-3.png",
    },
    iris: {
      1: "./assets/pets/rainbow/iris-1.png",
      2: "./assets/pets/rainbow/iris-2.png",
      3: "./assets/pets/rainbow/iris-3.png",
    },
    nova: {
      1: "./assets/pets/rainbow/nova-1.png",
      2: "./assets/pets/rainbow/nova-2.png",
      3: "./assets/pets/rainbow/nova-3.png",
    },
    orion: {
      1: "./assets/pets/rainbow/orion-1.png",
      2: "./assets/pets/rainbow/orion-2.png",
      3: "./assets/pets/rainbow/orion-3.png",
    },
    halo: {
      1: "./assets/pets/rainbow/halo-1.png",
      2: "./assets/pets/rainbow/halo-2.png",
      3: "./assets/pets/rainbow/halo-3.png",
    },
    penguin: { 1: "./assets/pets/normal/penguin-1.png" },
    hedgehog: { 1: "./assets/pets/normal/hedgehog-1.png" },
    raccoon: { 1: "./assets/pets/normal/raccoon-1.png" },
    otter: { 1: "./assets/pets/normal/otter-1.png" },
    seahorse: { 1: "./assets/pets/normal/seahorse-1.png" },
    koi: {
      1: "./assets/pets/rare/koi-1.png",
      2: "./assets/pets/rare/koi-2.png",
    },
    bat: {
      1: "./assets/pets/rare/bat-1.png",
      2: "./assets/pets/rare/bat-2.png",
    },
    chameleon: {
      1: "./assets/pets/rare/chameleon-1.png",
      2: "./assets/pets/rare/chameleon-2.png",
    },
    seal: {
      1: "./assets/pets/rare/seal-1.png",
      2: "./assets/pets/rare/seal-2.png",
    },
    peacock: {
      1: "./assets/pets/rare/peacock-1.png",
      2: "./assets/pets/rare/peacock-2.png",
    },
  };
  const progress = () => ({
    species: Object.keys(assets).length,
    forms: Object.values(assets).reduce(
      (sum, forms) => sum + Object.keys(forms).length,
      0,
    ),
    completedTiers: Object.keys(GuardianNursery.tiers).filter((rarity) =>
      GuardianModel.pets
        .filter((p) => p.rarity === rarity)
        .every(
          (p) =>
            Object.keys(assets[p.id] || {}).length ===
            GuardianModel.formCount(p.id),
        ),
    ),
    totalSpecies: GuardianModel.pets.length,
    totalForms: GuardianModel.pets.reduce(
      (sum, p) => sum + GuardianModel.formCount(p.id),
      0,
    ),
  });
  let count = 0;
  function draw(p, stage = 1, egg = false) {
    const maximum = GuardianModel.formCount(p.id);
    const form = Math.max(1, Math.min(maximum, stage));
    if (!egg && assets[p.id]?.[form]) {
      return `<svg class="g-pet-svg g-painted-pet" data-pet-art="painted" data-species="${p.id}" data-form="${form}" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"><image href="${assets[p.id][form]}" width="160" height="160" preserveAspectRatio="xMidYMid meet"/></svg>`;
    }
    const id = "creature-" + ++count,
      rainbow = p.rarity === "rainbow",
      tier = GuardianNursery.tiers[p.rarity],
      color = p.color,
      ink = "#18243f";
    const defs = `<defs><linearGradient id="${id}-body" x1=".1" y1="0" x2=".8" y2="1"><stop stop-color="#ffffff"/><stop offset=".24" stop-color="${color}"/><stop offset="1" stop-color="${rainbow ? "#aaa2ff" : color}" stop-opacity=".75"/></linearGradient><linearGradient id="${id}-rainbow" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff8fbc"/><stop offset=".23" stop-color="#ffdb87"/><stop offset=".47" stop-color="#92f0bf"/><stop offset=".73" stop-color="#8fceff"/><stop offset="1" stop-color="#ce9eff"/></linearGradient><radialGradient id="${id}-halo"><stop stop-color="${tier.color}" stop-opacity=".3"/><stop offset="1" stop-color="${tier.color}" stop-opacity="0"/></radialGradient></defs>`;
    const fill = `url(#${id}-${rainbow ? "rainbow" : "body"})`,
      stroke = rainbow ? "#e5ddff" : color;
    const eyes = (x = 80, y = 61, space = 16) =>
      `<ellipse cx="${x - space}" cy="${y}" rx="4.5" ry="6" fill="${ink}"/><ellipse cx="${x + space}" cy="${y}" rx="4.5" ry="6" fill="${ink}"/><circle cx="${x - space + 1}" cy="${y - 2}" r="1.5" fill="white"/><circle cx="${x + space + 1}" cy="${y - 2}" r="1.5" fill="white"/><ellipse cx="${x - space - 6}" cy="${y + 9}" rx="6" ry="3" fill="#ff85ad" opacity=".6"/><ellipse cx="${x + space + 6}" cy="${y + 9}" rx="6" ry="3" fill="#ff85ad" opacity=".6"/><path d="M${x - 4} ${y + 10}Q${x} ${y + 15} ${x + 4} ${y + 10}" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
    const orb = `<ellipse cx="80" cy="108" rx="43" ry="6" fill="#080d2433"/><circle cx="80" cy="59" r="61" fill="url(#${id}-halo)"/>`;
    const star = (x, y, size = 7) =>
      `<path d="M${x} ${y - size}L${x + 2} ${y - 2}L${x + size} ${y}L${x + 2} ${y + 2}L${x} ${y + size}L${x - 2} ${y + 2}L${x - size} ${y}L${x - 2} ${y - 2}Z" fill="${rainbow ? "#fff2b9" : tier.color}"/>`;
    const body = `<ellipse cx="80" cy="86" rx="28" ry="23" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><ellipse cx="80" cy="89" rx="16" ry="13" fill="white" opacity=".4"/><ellipse cx="60" cy="104" rx="13" ry="5" fill="${color}"/><ellipse cx="100" cy="104" rx="13" ry="5" fill="${color}"/>`;
    const head = `<ellipse cx="80" cy="58" rx="35" ry="29" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
    let shape = "";
    if (egg) {
      shape = `<ellipse cx="80" cy="67" rx="33" ry="43" fill="${fill}" stroke="${tier.color}" stroke-width="2"/><ellipse cx="66" cy="45" rx="8" ry="14" fill="white" opacity=".45" transform="rotate(25 66 45)"/><path d="M53 70L68 63L80 75L91 62L109 69" stroke="${tier.color}" stroke-width="3" opacity=".8"/><path d="M80 34L84 44L94 48L84 52L80 62L76 52L66 48L76 44Z" fill="white" opacity=".8"/><circle cx="66" cy="89" r="5" fill="${tier.color}"/><circle cx="96" cy="84" r="4" fill="${tier.color}"/>`;
    } else
      switch (p.art) {
        case "fox":
        case "cat":
        case "wolf": {
          let ears =
            p.art === "cat"
              ? "M48 45L43 16L67 34M93 34L117 16L112 45"
              : p.art === "wolf"
                ? "M44 49L44 9L72 35M88 35L116 9L116 49"
                : "M45 45L38 12L70 35M90 35L122 12L115 45";
          const tails = rainbow
            ? `<path d="M55 93Q5 80 14 49Q24 72 51 76M57 88Q9 60 31 30Q30 58 61 71M105 93Q155 80 146 49Q136 72 109 76M103 88Q151 60 129 30Q130 58 99 71" fill="${fill}" stroke="#fff8" stroke-width="1.5"/>`
            : `<path d="M106 92Q148 102 139 64Q130 85 104 78" fill="${fill}" stroke="${stroke}" stroke-width="2"/><path d="M134 80Q141 78 139 64Q134 72 129 77" fill="white"/>`;
          shape = `${tails}${body}<path d="${ears}" fill="${fill}" stroke="${stroke}" stroke-width="2"/><path d="M51 26L57 42L66 36M109 26L103 42L94 36" fill="#ca87c9" opacity=".6"/>${head}<path d="M53 67L73 66L80 72L87 66L107 67Q105 87 80 86Q55 87 53 67" fill="#fff7"/>${eyes()}<path d="M76 69L84 69L80 73Z" fill="${ink}"/>`;
          break;
        }
        case "rabbit":
          shape = `<ellipse cx="60" cy="31" rx="12" ry="29" fill="${fill}" transform="rotate(-13 60 31)"/><ellipse cx="102" cy="31" rx="12" ry="29" fill="${fill}" transform="rotate(13 102 31)"/><ellipse cx="59" cy="27" rx="5" ry="18" fill="#f39dce"/><ellipse cx="103" cy="27" rx="5" ry="18" fill="#f39dce"/>${body}${head}${eyes()}<path d="M77 75L77 81L83 81L83 75" fill="white"/>`;
          break;
        case "axolotl":
          shape = `<path d="M45 44L22 24M43 57L13 53M46 70L21 83M115 44L138 24M117 57L147 53M114 70L139 83" stroke="#ed8ac6" stroke-width="9" stroke-linecap="round"/><path d="M109 90Q149 89 133 65Q130 83 104 81" fill="${fill}"/>${body}${head}${eyes()}`;
          break;
        case "sprout":
        case "lotus": {
          const petals =
            p.art === "lotus"
              ? `<path d="M80 105Q19 96 26 70Q52 73 67 88Q36 41 63 37Q78 56 80 76Q82 56 97 37Q124 41 93 88Q108 73 134 70Q141 96 80 105" fill="${fill}" stroke="#fff7" stroke-width="1.5"/>`
              : "";
          shape = `${petals}${body}${head}<path d="M80 32Q58 3 45 13Q46 33 80 32Q101 1 119 13Q117 33 80 32" fill="${p.art === "lotus" ? "#e9acff" : "#68cf9c"}"/><path d="M80 34V21" stroke="#499d7d" stroke-width="3"/>${eyes()}`;
          break;
        }
        case "turtle":
          shape = `<ellipse cx="80" cy="78" rx="45" ry="28" fill="#4da996" stroke="#a2efd0" stroke-width="2"/><path d="M44 78L62 62L88 60L113 78L95 97L66 98ZM62 62L66 98M88 60L95 97M44 78H113" stroke="#a2efd099" stroke-width="2"/><ellipse cx="38" cy="94" rx="13" ry="7" fill="${fill}"/><ellipse cx="119" cy="94" rx="13" ry="7" fill="${fill}"/><ellipse cx="80" cy="49" rx="29" ry="24" fill="${fill}"/>${eyes(80, 46, 12)}${star(81, 81, 10)}`;
          break;
        case "owl":
          shape = `${body}<path d="M46 54L40 20L68 32Q80 26 92 32L120 20L114 54" fill="${fill}"/><ellipse cx="80" cy="60" rx="38" ry="33" fill="${fill}"/><path d="M49 76Q31 67 34 98Q52 97 61 81M111 76Q129 67 126 98Q108 97 99 81" fill="${color}"/><ellipse cx="63" cy="57" rx="17" ry="21" fill="#fff7"/><ellipse cx="97" cy="57" rx="17" ry="21" fill="#fff7"/>${eyes(80, 55, 17)}<path d="M75 68L85 68L80 77" fill="#ffce80"/>`;
          break;
        case "deer":
        case "kirin": {
          const horn =
            p.art === "kirin"
              ? '<path d="M75 33L83 1L89 33" fill="#fff4b8" stroke="#d5bdff" stroke-width="1.5"/><path d="M79 20L86 24M81 12L85 15" stroke="#a99cff"/>'
              : '<path d="M56 37L46 21L48 7M47 22L34 12M104 37L114 21L112 7M113 22L126 12" stroke="#e4d3ff" stroke-width="5" stroke-linecap="round"/>';
          shape = `${body}<path d="M50 48Q21 30 35 62L52 64M110 48Q139 30 125 62L108 64" fill="${fill}"/>${horn}${head}${eyes()}<path d="M71 38Q80 29 89 38L80 48Z" fill="#fff7"/>`;
          break;
        }
        case "jelly":
          shape = `<path d="M45 68Q27 98 46 107M65 73Q50 102 69 114M92 73Q111 102 92 114M114 68Q133 98 114 107" stroke="${color}" stroke-width="8" stroke-linecap="round"/><path d="M31 68C26 7 134 7 129 68Q113 80 98 70Q82 83 66 70Q48 79 31 68" fill="${fill}" stroke="#fff9" stroke-width="2"/>${eyes(80, 52, 17)}<path d="M48 42Q55 24 71 25" stroke="#fff9" stroke-width="5" stroke-linecap="round"/>`;
          break;
        case "manta":
        case "whale": {
          shape =
            p.art === "manta"
              ? `<path d="M80 34Q61 36 42 60L8 52Q7 89 46 84L64 92Q81 111 96 92L114 84Q153 89 152 52L118 60Q99 36 80 34Z" fill="${fill}" stroke="#fff8" stroke-width="2"/><path d="M79 91Q95 116 109 112" stroke="${color}" stroke-width="5"/>${eyes(80, 63, 15)}`
              : `<path d="M42 91C8 65 24 30 63 32Q98 26 117 61L130 52L144 32L151 55L136 72L147 94Q126 100 114 79Q96 112 42 91Z" fill="${fill}" stroke="#fff8" stroke-width="2"/><path d="M57 79Q43 108 78 103L89 82" fill="${color}"/><path d="M35 70Q72 92 104 75Q87 109 49 92" fill="#fff7"/><circle cx="52" cy="57" r="5" fill="${ink}"/><circle cx="53" cy="55" r="2" fill="white"/><path d="M76 27Q64 9 78 8Q88 8 80 26M83 25Q91 10 98 17Q102 25 87 27" fill="#9edef5"/>`;
          break;
        }
        case "butterfly":
        case "phoenix":
        case "dragon":
        case "griffin": {
          const wings =
            p.art === "butterfly"
              ? `<path d="M73 58Q11 -1 15 48Q-3 75 49 89L68 79M87 58Q149 -1 145 48Q163 75 111 89L92 79" fill="${fill}" stroke="#fff9" stroke-width="2"/><circle cx="35" cy="45" r="10" fill="#ffcbf4"/><circle cx="125" cy="45" r="10" fill="#ffcbf4"/>`
              : p.art === "phoenix" || p.art === "griffin"
                ? `<path d="M55 67L11 22L17 55L3 47L18 84L54 89M105 67L149 22L143 55L157 47L142 84L106 89" fill="${fill}" stroke="#fff8" stroke-width="2"/><path d="M18 48L44 75M142 48L116 75" stroke="#ffe5ad" stroke-width="3"/>`
                : `<path d="M53 58L17 21L11 76L31 69L41 86L61 78M107 58L143 21L149 76L129 69L119 86L99 78" fill="${fill}" stroke="#fff8" stroke-width="2"/><path d="M25 39L46 71M135 39L114 71" stroke="#fff7" stroke-width="2"/>`;
          shape = `${wings}${body}<path d="M57 41L57 16L73 35M103 41L103 16L87 35" fill="${p.art === "phoenix" ? "#ffc373" : color}"/>${head}${eyes()}${p.art === "phoenix" ? '<path d="M75 70L85 70L80 78" fill="#ffaf73"/>' : ""}`;
          break;
        }
        case "serpent":
          shape = `<path d="M98 82Q143 78 123 102Q91 124 51 102Q30 90 50 78Q77 65 87 82Q95 94 69 95" stroke="${color}" stroke-width="18" stroke-linecap="round"/><path d="M106 45L113 25L94 36M55 41L48 25L69 34" fill="#ffce91"/>${head}${eyes()}<path d="M78 76V84M78 84L72 88M78 84L84 88" stroke="#ed8aab" stroke-width="2"/>`;
          break;
        case "lion":
          shape = `<path d="M80 20L94 27L111 25L119 40L132 48L125 65L128 81L112 89L104 103L85 97L68 104L55 91L37 85L39 68L29 54L43 42L49 26L66 29Z" fill="#ed9b69" stroke="#ffd49b" stroke-width="2"/>${body}${head}${eyes()}<ellipse cx="80" cy="72" rx="16" ry="10" fill="#fff5"/><path d="M75 68L85 68L80 74Z" fill="${ink}"/>`;
          break;
        default:
          shape = body + head + eyes();
      }
    const aura =
      !egg && stage >= 3
        ? `<circle cx="80" cy="60" r="53" stroke="${tier.color}" stroke-width="1.4" stroke-dasharray="3 7" opacity=".6"/>`
        : "";
    const crown =
      !egg && stage >= 4
        ? `<path d="M62 16L64 3L78 11L93 1L98 16Z" fill="#ffdf93" stroke="#fff1bb"/>`
        : "";
    return `<svg class="g-pet-svg ${egg ? "g-egg" : ""}" viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">${defs}${orb}${aura}${shape}${crown}${star(24, 23, 5)}${star(138, 91, 4)}${rainbow ? star(126, 17, 7) + star(17, 83, 5) : ""}</svg>`;
  }
  globalThis.GuardianArt = { draw, assets, progress };
})();
