"use strict";
(() => {
  const N = globalThis.GuardianNursery,
    M = globalThis.GuardianModel,
    $ = (id) => document.getElementById(id);
  let options,
    run = null,
    tab = "pet",
    filter = "ship",
    toastTimer,
    collectionFilter = "owned",
    summonBusy = false;
  const localDate = () => new Date().toLocaleDateString("sv-SE");
  const state = () => {
    const root = options.getStore();
    if (!root.guardian) root.guardian = M.create();
    N.ensure(root.guardian);
    return root.guardian;
  };
  const node = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const number = (n) => n.toLocaleString("vi-VN");
  function svg(content, cls = "") {
    return `<svg class="${cls}" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${content}</svg>`;
  }
  function ship(art, color) {
    const common = `<ellipse cx="80" cy="103" rx="13" ry="12" fill="${color}" opacity=".2"/><path d="M73 89L80 113L87 89" fill="${color}"/><path d="M80 15L94 82L80 94L66 82Z" fill="${color}"/><path d="M80 35L86 64H74Z" fill="#142333"/>`;
    const wings = {
      scout:
        '<path d="M80 17L120 89L91 78L80 93L69 78L40 89Z" fill="currentColor" stroke="#ffffff88" stroke-width="2"/>',
      kite: '<path d="M80 14L142 79L110 92L80 69L50 92L18 79Z" fill="currentColor" stroke="#ffffff88" stroke-width="2"/><path d="M28 78L58 70M132 78L102 70" stroke="#fff8" stroke-width="3"/>',
      manta:
        '<path d="M80 29C53 33 43 61 9 69C18 92 55 92 80 72C105 92 142 92 151 69C117 61 107 33 80 29Z" fill="currentColor" stroke="#fff8" stroke-width="2"/>',
      phoenix:
        '<path d="M80 32L37 12L43 48L10 30L25 78L60 91L80 65L100 91L135 78L150 30L117 48L123 12Z" fill="currentColor" stroke="#fff9" stroke-width="2"/><path d="M22 56L57 73M138 56L103 73" stroke="#ffebac" stroke-width="3"/>',
    };
    return `<span class="g-art" style="color:${color}">${svg((wings[art] || wings.scout) + common)}</span>`;
  }
  function target(art, color) {
    const shapes = {
      meteor:
        '<path d="M40 27L83 16L121 42L126 80L96 105L49 92L29 61Z" fill="currentColor" opacity=".8" stroke="#fff8" stroke-width="2"/><circle cx="65" cy="45" r="12" fill="#202334" opacity=".5"/><circle cx="98" cy="76" r="17" fill="#202334" opacity=".5"/><circle cx="54" cy="78" r="6" fill="#fff" opacity=".15"/>',
      jelly:
        '<path d="M34 67C31 7 129 7 126 67Z" fill="currentColor" stroke="#fff9" stroke-width="2"/><path d="M48 66Q37 93 54 103M70 66Q60 99 73 109M94 66Q110 86 95 109M114 66Q129 93 113 103" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="65" cy="49" r="4" fill="#23243d"/><circle cx="94" cy="49" r="4" fill="#23243d"/><path d="M75 57Q80 62 85 57" stroke="#23243d" stroke-width="2"/>',
      ufo: '<path d="M49 60C47 10 113 10 111 60" fill="#b1e9ed" stroke="#fff9" stroke-width="2"/><ellipse cx="80" cy="66" rx="62" ry="19" fill="currentColor" stroke="#fff9" stroke-width="2"/><path d="M49 81L35 111H125L111 81" fill="currentColor" opacity=".13"/><circle cx="43" cy="66" r="4" fill="#fff"/><circle cx="80" cy="72" r="4" fill="#fff"/><circle cx="117" cy="66" r="4" fill="#fff"/>',
    };
    return `<span class="g-art" style="color:${color}">${svg(shapes[art] || shapes.meteor)}</span>`;
  }
  function petArt(id, index) {
    const p = M.pets.find((p) => p.id === id) || M.pets[0];
    return GuardianArt.draw(p, index, index === 0);
  }
  function rarityTag(p) {
    const t = N.tiers[p.rarity];
    return node("span", "g-rarity rarity-" + p.rarity, t.name);
  }
  function activeXP(s) {
    return N.ensure(s).pets[s.pet].xp;
  }
  function mutate(action) {
    const result = action();
    if (result.ok) {
      options.save();
      renderHome();
      renderDialog();
    }
    notify(result.message);
    return result;
  }
  const equipment = (s) =>
    Object.fromEntries(
      Object.entries(s.equipment).map(([k, id]) => [
        k,
        M.catalog.find((x) => x.id === id),
      ]),
    );
  function itemArt(item) {
    if (item.slot === "ship") return ship(item.art, item.color);
    if (item.slot === "target") return target(item.art, item.color);
    if (item.slot === "sky")
      return `<span class="g-sky-swatch" data-sky="${item.art}"><i></i><i></i><i></i></span>`;
    return `<span class="g-trail-swatch" style="--swatch:${item.color}">✦</span>`;
  }
  function meter(value, max, label) {
    const wrap = node("div", "g-meter"),
      bar = node("progress");
    bar.max = max;
    bar.value = Math.min(max, value);
    bar.setAttribute("aria-label", label);
    wrap.append(bar, node("small", "", label));
    return wrap;
  }
  function notify(message) {
    $("g-message").textContent = message;
  }
  function applyArena() {
    const s = state(),
      items = equipment(s);
    $("arena").dataset.sky = items.sky.art;
    $("arena").style.setProperty("--beam", items.trail.color);
    $("guardian-ship").innerHTML = ship(items.ship.art, items.ship.color);
    $("enemy-art").innerHTML = target(items.target.art, items.target.color);
    $("arena-companion").innerHTML = petArt(s.pet, M.stage(s).index);
  }
  function renderHome() {
    if (!options) return;
    const s = state();
    M.today(s, localDate());
    const l = M.petLevel(s),
      p = M.pets.find((p) => p.id === s.pet),
      stage = M.stage(s);
    $("g-home-art").innerHTML = petArt(s.pet, stage.index);
    $("g-home-name").textContent = s.petName || p.name;
    $("g-home-status").textContent =
      `${stage.name} · cấp ${l} · ${N.ensure(s).tickets} vé triệu hồi`;
    $("g-home-coins").textContent = number(s.coins);
    $("g-home-xp").value = activeXP(s) - M.threshold(l);
    $("g-home-xp").max = M.threshold(l + 1) - M.threshold(l);
    $("g-home-xp").setAttribute(
      "aria-label",
      `${activeXP(s) - M.threshold(l)} / ${M.threshold(l + 1) - M.threshold(l)} XP đến cấp tiếp theo`,
    );
    const mission = M.missions(s).find((m) => !s.day.missions.includes(m.id));
    $("g-home-mission").textContent = mission
      ? `${mission.title}: ${Math.min(mission.value, mission.target)}/${mission.target} · +${mission.coins} xu`
      : "Đã xong nhiệm vụ hôm nay. Linh thú chờ chuyến bay tiếp theo.";
    applyArena();
  }
  function petPage(body) {
    const s = state(),
      n = N.ensure(s),
      stage = M.stage(s),
      l = M.petLevel(s),
      p = M.pets.find((p) => p.id === s.pet);
    const hero = node("div", "g-pet-hero rarity-" + p.rarity);
    hero.innerHTML = petArt(p.id, stage.index);
    const info = node("div");
    info.append(
      rarityTag(p),
      node("h3", "", s.petName || p.name),
      node("p", "g-muted", `${p.name} · ${stage.name} · cấp ${l}`),
      meter(
        activeXP(s) - M.threshold(l),
        M.threshold(l + 1) - M.threshold(l),
        `${activeXP(s) - M.threshold(l)} / ${M.threshold(l + 1) - M.threshold(l)} XP đến cấp ${l + 1}`,
      ),
    );
    hero.append(info);
    body.append(hero);
    const naming = node("form", "g-naming"),
      label = node("label", "", "Tên bạn đồng hành"),
      input = node("input"),
      save = node("button", "", "Lưu tên");
    input.id = "g-pet-name";
    input.maxLength = 24;
    input.value = s.petName;
    label.htmlFor = input.id;
    save.type = "submit";
    naming.append(label, input, save);
    naming.onsubmit = (e) => {
      e.preventDefault();
      s.petName = input.value.trim();
      options.save();
      renderHome();
      renderDialog();
      notify("Đã lưu tên bạn đồng hành.");
    };
    body.append(naming);
    const callout = node("div", "g-callout");
    callout.append(
      node(
        "strong",
        "",
        stage.index === 0
          ? "Trứng đang chờ nở"
          : stage.next
            ? "Tiến hóa tiếp theo: " + stage.next.name
            : "Đã đạt hình thái cuối",
      ),
    );
    callout.append(
      node(
        "p",
        "g-muted",
        stage.index === 0
          ? "Gõ đúng từ trong Vệ binh để tăng tiến độ ấp. Không cần đợi đủ ngày."
          : stage.next
            ? `Đạt cấp ${stage.next.level} bằng XP học và XP trùng loài; không có yêu cầu ngày học.`
            : "Tiếp tục sưu tầm các loài mới và tích XP riêng cho từng loài.",
      ),
    );
    body.append(callout);
    const filters = node("div", "g-filters");
    for (const [key, label] of [
      ["owned", "Đã nhận"],
      ["all", "Tất cả"],
      ...Object.entries(N.tiers).map(([k, v]) => [k, v.name]),
    ]) {
      const b = node("button", "", label);
      b.setAttribute("aria-pressed", String(collectionFilter === key));
      b.onclick = () => {
        collectionFilter = key;
        renderDialog();
      };
      filters.append(b);
    }
    body.append(
      node(
        "h3",
        "",
        `Bách khoa linh thú · ${Object.keys(n.pets).length} / ${M.pets.length} loài`,
      ),
      filters,
    );
    const grid = node("div", "g-pet-grid");
    const list = M.pets.filter(
      (p) =>
        collectionFilter === "all" ||
        (collectionFilter === "owned" && n.pets[p.id]) ||
        p.rarity === collectionFilter,
    );
    for (const p of list) {
      const own = n.pets[p.id],
        card = node("article", "g-small-card rarity-" + p.rarity);
      card.innerHTML = GuardianArt.draw(
        p,
        own?.hatched ? M.stage(s, p.id).index : 1,
        !!own && !own.hatched,
      );
      card.append(
        rarityTag(p),
        node("h4", "", p.name),
        node("p", "g-muted", p.description),
        node(
          "small",
          "g-requirement",
          own
            ? `${own.hatched ? "Đã nở" : "Trứng chưa nở"} · cấp ${M.level(own.xp)} · ${own.xp} XP · nhận ${own.copies} lần`
            : p.price !== null
              ? "Mua trứng bằng xu hoặc triệu hồi"
              : "Chỉ nhận qua triệu hồi",
        ),
      );
      const b = node(
        "button",
        "",
        s.pet === p.id
          ? "Đang đồng hành"
          : own?.hatched
            ? "Chọn đồng hành"
            : own
              ? "Đến lồng ấp"
              : "Chưa sở hữu",
      );
      b.disabled = s.pet === p.id || !own;
      b.dataset.pet = p.id;
      b.onclick = () => {
        if (!own?.hatched) {
          tab = "eggs";
          renderDialog();
          return;
        }
        s.pet = p.id;
        options.save();
        renderHome();
        renderDialog();
      };
      card.append(b);
      grid.append(card);
    }
    body.append(grid);
  }
  function eggsPage(body) {
    const s = state(),
      n = N.ensure(s);
    body.append(
      node("h3", "", "Lồng ấp ánh sao"),
      node(
        "p",
        "g-muted",
        "Ấp bằng những từ gõ đúng trong Vệ binh, không chờ đồng hồ hoặc ngày học. Chỉ một trứng được ấp mỗi lúc; cất trứng vẫn giữ tiến độ.",
      ),
    );
    const nest = node("div", "g-incubator");
    if (n.incubator) {
      const i = n.incubator,
        p = M.pets.find((p) => p.id === i.species);
      nest.innerHTML = GuardianArt.draw(p, 0, true);
      const text = node("div");
      text.append(
        rarityTag(p),
        node("h3", "", p.name),
        meter(
          i.progress,
          i.target,
          `${i.progress} / ${i.target} từ đúng để nở`,
        ),
      );
      const b = node("button", "", "Cất trứng / đổi trứng");
      b.onclick = () => mutate(() => N.pauseIncubation(s));
      text.append(b);
      nest.append(text);
    } else {
      nest.append(
        node(
          "p",
          "",
          "Lồng ấp đang trống. Chọn một trứng bên dưới hoặc mua trứng mới.",
        ),
      );
    }
    body.append(nest, node("h3", "", `Túi trứng · ${n.eggs.length}`));
    const grid = node("div", "g-pet-grid");
    for (const id of n.eggs) {
      const p = M.pets.find((p) => p.id === id),
        entry = n.pets[id],
        card = node("article", "g-small-card rarity-" + p.rarity);
      card.innerHTML = GuardianArt.draw(p, 0, true);
      card.append(
        rarityTag(p),
        node("h4", "", p.name),
        node(
          "p",
          "g-muted",
          `${N.tiers[p.rarity].hatch} từ đúng để nở · ${entry.xp} XP tích lũy`,
        ),
      );
      const active = n.incubator?.species === id,
        b = node(
          "button",
          "",
          active
            ? "Đang ấp"
            : n.incubator
              ? "Cất trứng hiện tại trước"
              : "Bắt đầu ấp",
        );
      b.disabled = !!n.incubator;
      b.dataset.egg = id;
      b.onclick = () => mutate(() => N.incubate(s, id));
      card.append(b);
      grid.append(card);
    }
    body.append(grid);
    if (!n.eggs.length)
      body.append(
        node(
          "p",
          "g-muted",
          "Bạn chưa có trứng chưa nở. Cửa hàng có trứng mua bằng xu, cổng triệu hồi có các loài độc quyền.",
        ),
      );
    body.append(
      node("h3", "", "Chợ trứng · mua đúng loài"),
      node(
        "p",
        "g-muted",
        "Chỉ cần đủ xu, không yêu cầu cấp hoặc ngày. Trứng trùng loài (kể cả còn đang ấp) chuyển thành XP cho đúng loài đó.",
      ),
    );
    const shop = node("div", "g-pet-grid");
    for (const p of M.pets.filter((p) => p.price !== null)) {
      const card = node("article", "g-small-card rarity-" + p.rarity);
      card.innerHTML = GuardianArt.draw(p, 0, true);
      card.append(
        rarityTag(p),
        node("h4", "", p.name),
        node(
          "p",
          "g-muted",
          n.pets[p.id]
            ? `Trùng loài: +${N.tiers[p.rarity].duplicateXP} XP`
            : `Trứng ${N.tiers[p.rarity].name} · ${N.tiers[p.rarity].hatch} từ để nở`,
        ),
      );
      if (p.id === "fox") {
        card.append(
          node("small", "g-muted", "Trứng khởi đầu được tặng miễn phí."),
        );
      } else {
        const b = node("button", "", `Mua · ${number(p.price)} xu`);
        b.disabled = s.coins < p.price;
        b.dataset.buyegg = p.id;
        b.onclick = () => mutate(() => N.buyEgg(s, p.id));
        card.append(b);
      }
      shop.append(card);
    }
    body.append(shop);
  }
  function gachaPage(body) {
    const s = state(),
      n = N.ensure(s),
      rates = N.rates(s);
    body.append(
      node("p", "eyebrow", "CỔNG TRIỆU HỒI / 25 LOÀI · 5 RAINBOW"),
      node("h3", "", `${n.tickets} vé · 10 vé / lần`),
      node(
        "p",
        "g-muted",
        "Tặng 10 vé khi mở hệ trứng lần đầu. Vé thêm đến từ combo và nhiệm vụ học; không bán bằng tiền thật. Lịch sử và bảo hiểm được giữ khi tải lại.",
      ),
    );
    const portal = node("div", "g-portal");
    portal.append(
      node("span", "g-portal-symbol", "✧"),
      node(
        "strong",
        "",
        n.pity === 49
          ? "Lượt tiếp theo chắc chắn Rainbow"
          : `Còn tối đa ${50 - n.pity} lượt tới Rainbow`,
      ),
      meter(
        n.pity,
        50,
        `${n.pity} / 50 lượt chưa ra Rainbow · đã triệu hồi ${n.pulls} lần`,
      ),
    );
    const summon = node("button", "", "Triệu hồi · 10 vé");
    summon.id = "g-summon";
    summon.disabled = n.tickets < 10 || summonBusy;
    summon.onclick = () => {
      if (summonBusy) return;
      summonBusy = true;
      const result = N.summon(s);
      if (!result.ok) {
        summonBusy = false;
        notify(result.message);
        return;
      }
      options.save();
      renderHome();
      renderDialog();
      notify(result.message);
      $("g-ack")?.focus({ preventScroll: false });
    };
    portal.append(summon);
    body.append(portal);
    const last = n.history[0];
    if (last) {
      const p = M.pets.find((p) => p.id === last.species),
        result = node(
          "div",
          "g-summon-result rarity-" +
            p.rarity +
            (summonBusy ? " g-new-draw" : ""),
        );
      result.innerHTML = GuardianArt.draw(
        p,
        M.stage(s, p.id).index,
        !n.pets[p.id].hatched,
      );
      const info = node("div");
      info.append(
        rarityTag(p),
        node(
          "p",
          "eyebrow",
          `KẾT QUẢ LƯỢT #${last.pull}${last.guaranteed ? " · BẢO HIỂM 50" : ""}`,
        ),
        node("h3", "", p.name),
        node(
          "p",
          "",
          last.duplicate
            ? `Trùng loài → +${last.xp} XP cho ${p.name}`
            : "Trứng mới đã vào túi! Chuyển sang Lồng ấp để bắt đầu.",
        ),
        node("p", "g-muted", p.description),
      );
      if (summonBusy) {
        const ack = node("button", "", "Đã nhận kết quả");
        ack.id = "g-ack";
        ack.onclick = () => {
          summonBusy = false;
          renderDialog();
        };
        info.append(ack);
      }
      result.append(info);
      body.insertBefore(result, portal);
    }
    const table = node("table", "g-odds");
    const caption = node("caption", "", "Tỷ lệ của lượt tiếp theo");
    table.append(caption);
    const header = node("tr");
    for (const t of ["Độ hiếm", "Cơ bản", "Lượt tới"])
      header.append(node("th", "", t));
    const head = node("thead");
    head.append(header);
    table.append(head);
    const tbody = node("tbody");
    for (const [key, t] of Object.entries(N.tiers)) {
      const row = node("tr");
      const cell = node("td");
      cell.append(node("span", "g-rarity rarity-" + key, t.name));
      row.append(
        cell,
        node("td", "", t.rate + "%"),
        node("td", "", rates[key] + "%"),
      );
      tbody.append(row);
    }
    table.append(tbody);
    body.append(
      table,
      node(
        "p",
        "g-muted",
        "Từ lượt 41 chưa ra Rainbow: tăng thêm 0,5 điểm % mỗi lượt; phần tăng lấy từ Normal. Lượt 50 bảo đảm Rainbow. Ra Rainbow thì bộ đếm về 0. Trong Rainbow ưu tiên loài chưa sở hữu cho đến khi đủ 5 loài; các loài còn lại cùng hạng có cơ hội bằng nhau.",
      ),
    );
    const details = node("details"),
      summary = node("summary", "", "Tỷ lệ từng loài ở lượt tiếp theo");
    details.append(summary);
    const odds = node("ul", "g-probability-list");
    for (const p of M.pets) {
      const unseen = M.pets.filter(
          (x) => x.rarity === "rainbow" && !n.pets[x.id],
        ),
        eligible = p.rarity !== "rainbow" || !unseen.length || !n.pets[p.id],
        size = p.rarity === "rainbow" && unseen.length ? unseen.length : 5;
      odds.append(
        node(
          "li",
          "",
          `${p.name}: ${eligible ? (rates[p.rarity] / size).toFixed(3) : "0.000"}%`,
        ),
      );
    }
    details.append(odds);
    body.append(details);
    const log = node("details");
    log.append(node("summary", "", `Lịch sử · ${n.pulls} lượt`));
    for (const h of n.history) {
      const p = M.pets.find((p) => p.id === h.species);
      log.append(
        node(
          "p",
          "g-history-row rarity-" + p.rarity,
          `#${h.pull} · ${N.tiers[p.rarity].name} · ${p.name} · ${h.duplicate ? "trùng +" + h.xp + " XP" : "trứng mới"}${h.guaranteed ? " · bảo hiểm" : ""}`,
        ),
      );
    }
    body.append(log);
  }
  function shopPage(body) {
    const s = state(),
      labels = {
        ship: "Tàu bắn",
        sky: "Bầu trời",
        target: "Vật thể bay",
        trail: "Tia bắn",
      },
      filters = node("div", "g-filters");
    for (const [slot, label] of Object.entries(labels)) {
      const b = node("button", "", label);
      b.dataset.filter = slot;
      b.setAttribute("aria-pressed", String(slot === filter));
      b.onclick = () => {
        filter = slot;
        renderDialog();
      };
      filters.append(b);
    }
    body.append(
      filters,
      node(
        "p",
        "g-muted",
        "Mua một lần, dùng mãi mãi. Đồ trang trí thay đổi thật trong trận; không thay đáp án, tốc độ hay lịch ôn.",
      ),
    );
    const grid = node("div", "g-shop-grid");
    for (const item of M.catalog.filter((i) => i.slot === filter)) {
      const card = node("article", "g-shop-card"),
        art = node("div", "g-item-preview");
      art.innerHTML = itemArt(item);
      const owned = s.owned.includes(item.id),
        active = s.equipment[item.slot] === item.id,
        unlocked = M.unlocked(s, item);
      card.append(
        art,
        node("p", "eyebrow", owned ? "ĐÃ SỞ HỮU" : `${number(item.price)} XU`),
        node("h3", "", item.name),
        node("p", "g-muted", item.description),
        node(
          "small",
          "g-requirement",
          "Chỉ cần đủ xu · không giới hạn ngày / cấp",
        ),
      );
      const b = node(
        "button",
        "",
        active
          ? "Đang trang bị"
          : owned
            ? "Trang bị"
            : !unlocked
              ? "Chưa mở khóa"
              : s.coins < item.price
                ? `Còn thiếu ${number(item.price - s.coins)} xu`
                : `Mua · ${number(item.price)} xu`,
      );
      b.disabled = active || (!owned && (!unlocked || s.coins < item.price));
      b.dataset.item = item.id;
      b.onclick = () => {
        const result = M.buy(state(), item.id);
        if (result.ok) {
          options.save();
          renderHome();
          renderDialog();
        }
        notify(result.message);
      };
      card.append(b);
      grid.append(card);
    }
    body.append(grid);
  }
  function journeyPage(body) {
    const s = state();
    body.append(
      node("h3", "", "Nhiệm vụ hôm nay"),
      node(
        "p",
        "g-muted",
        "Tự nhận thưởng ngay trong trận. Ngày mới tính theo giờ trên thiết bị.",
      ),
    );
    const tasks = node("div", "g-missions");
    for (const m of M.missions(s)) {
      const card = node("div", "g-mission");
      card.append(
        node("strong", "", m.title),
        node("p", "", m.description),
        meter(
          m.value,
          m.target,
          `${Math.min(m.value, m.target)} / ${m.target} · +${m.coins} xu${s.day.missions.includes(m.id) ? " · đã nhận" : ""}`,
        ),
      );
      tasks.append(card);
    }
    body.append(
      tasks,
      node("h3", "", "Bản đồ thám hiểm"),
      node(
        "p",
        "g-muted",
        `${number(s.cleanClears)} lượt đúng · ${M.distinct(s)} từ khác nhau · ${s.activeDays.length} ngày đồng hành. Ba điều kiện cùng mở một chặng mới.`,
      ),
    );
    const map = node("ol", "g-expeditions");
    for (const [index, sector] of M.sectors.entries()) {
      const unlocked = s.sectors.includes(sector.id),
        li = node("li", unlocked ? "is-unlocked" : "");
      li.append(
        node("span", "g-map-dot", unlocked ? "✦" : String(index + 1)),
        node("h4", "", sector.name),
        node(
          "p",
          "g-muted",
          `${sector.clears} lượt đúng · ${sector.days} ngày · ${sector.words} từ khác nhau`,
        ),
        node(
          "small",
          "",
          unlocked ? "Đã khám phá" : `Thưởng ${sector.coins} xu khi mở`,
        ),
      );
      map.append(li);
    }
    body.append(map, node("h3", "", "Huy hiệu của bạn"));
    const badges = node("div", "g-badges");
    for (const badge of M.badges(s)) {
      const card = node(
        "div",
        "g-badge" + (badge.value >= badge.target ? " earned" : ""),
      );
      card.append(
        node("span", "", badge.value >= badge.target ? "✧" : "◇"),
        node("strong", "", badge.name),
        node(
          "small",
          "",
          `${Math.min(badge.value, badge.target)} / ${badge.target}`,
        ),
      );
      badges.append(card);
    }
    body.append(badges);
  }
  function rulesPage(body) {
    const paragraphs = [
      [
        "Điểm trận & combo",
        "Mỗi từ hoàn thành: 10 điểm + 2 điểm mỗi nhóm 5 chữ cái. Mỗi 10 từ gõ đúng liền nhau tăng hệ số; tối đa x5 (mỗi 10 từ đúng tăng một bậc). Gõ sai ngắt combo nhưng không mất xu hay XP đã có. Mỗi từ thứ 10 có khách thủ lĩnh ghé thăm, không ngắt nhịp gõ.",
      ],
      [
        "XP & xu để nuôi linh thú",
        "Với từng từ trong một ngày, ba lần gõ đúng đầu cho 8 / 3 / 1 XP và 3 / 1 / 0 xu. Từ lần thứ tư vẫn cộng điểm trận, nhưng không thêm XP/xu. Lần đầu gõ đúng từ đang đến hạn: thêm 4 XP và 2 xu. Một lần cố gắng có lỗi được 1 XP nếu hôm đó chưa gõ đúng từ này; không tính là đã nhớ.",
      ],
      [
        "Đi xa nhờ học đều",
        "Linh thú nở sau 30 / 60 / 100 / 160 / 240 từ gõ đúng tùy độ hiếm. Mỗi loài có XP riêng, tiến hóa ở cấp 8 / 16 / 28, không yêu cầu ngày. Trùng loài cho 40 / 100 / 240 / 600 / 1600 XP theo hạng. Linh thú chỉ đồng hành sau khi trứng nở.",
      ],
      [
        "Chơi vừa sức, lưu bền lâu",
        "Gõ đúng là có từ mới ngay. Cửa hàng nằm ngoài trận để không gián đoạn. Tạm dừng bằng Alt+4; ẩn tab cũng tự dừng. Không có chuỗi ngày bị mất, thú bị đói hay đồ hết hạn. Vé rơi ngẫu nhiên theo tỷ lệ công bố; triệu hồi có bảo hiểm tối đa 50 lượt. Có thể nghỉ bất cứ lúc nào.",
      ],
      [
        "Tiến độ của bạn",
        "Linh thú, xu, vật phẩm và nhiệm vụ đi cùng bản sao JSON của khu từ vựng. Dữ liệu vẫn nằm trên trình duyệt này; chưa đồng bộ thiết bị. Hãy xuất bản sao sau những cột mốc quan trọng.",
      ],
    ];
    for (const [title, copy] of paragraphs) {
      const section = node("section", "g-rule");
      section.append(node("h3", "", title), node("p", "g-muted", copy));
      body.append(section);
    }
    const link = node(
      "a",
      "",
      "Xem nghiên cứu và cách cân bằng phần thưởng ↗",
    );
    link.href =
      "https://github.com/letsstudy222/ankis/blob/main/docs/guardian-gacha.md";
    link.target = "_blank";
    link.rel = "noopener";
    body.append(link);
  }
  function renderDialog() {
    const focused = document.activeElement;
    const focusId = focused?.id;
    const focusItem = focused?.dataset?.item;
    const focusFilter = focused?.dataset?.filter;
    const s = state();
    $("g-wallet").textContent =
      `${number(s.coins)} xu · ${N.ensure(s).tickets} vé`;
    for (const b of $("g-tabs").children)
      b.setAttribute("aria-pressed", String(b.dataset.tab === tab));
    const body = $("g-dialog-body");
    body.replaceChildren();
    (
      ({
        pet: petPage,
        eggs: eggsPage,
        gacha: gachaPage,
        shop: shopPage,
        journey: journeyPage,
        rules: rulesPage,
      })[tab] || petPage
    )(body);
    if ($("guardian-dialog").open) {
      let next = focusId
        ? $(focusId)
        : focusItem
          ? body.querySelector(`[data-item="${focusItem}"]`)
          : focusFilter
            ? body.querySelector(`[data-filter="${focusFilter}"]`)
            : null;
      if (next?.disabled)
        next = body.querySelector(`[data-filter="${filter}"]`);
      next?.focus({ preventScroll: true });
    }
  }
  function open() {
    M.today(state(), localDate());
    renderDialog();
    $("guardian-dialog").showModal();
  }
  function start() {
    document.body.classList.add("g-playing");
    run = { score: 0, combo: 0, bestCombo: 0, xp: 0, coins: 0, clears: 0 };
    $("guardian-hud").hidden = false;
    $("guardian-reward").textContent = "Gõ đúng để thắp sáng quỹ đạo.";
    applyArena();
    renderHUD();
  }
  function renderHUD() {
    if (!run) return;
    const s = state();
    $("g-score").textContent = number(run.score);
    $("g-combo").textContent = run.combo
      ? `×${M.comboMultiplier(run.combo)} · ${run.combo} đúng`
      : "×1";
    $("g-ticket-rate").textContent =
      `Vé rơi ${Math.round(M.ticketChance(run.combo) * 100)}% · xét tối đa 3 lần đúng / từ / ngày`;
    $("g-run-wallet").textContent =
      `${number(s.coins)} xu · ${N.ensure(s).tickets} vé`;
    $("g-run-level").textContent = `Cấp ${M.petLevel(s)}`;
  }
  function mistake() {
    if (!run) return;
    run.combo = 0;
    renderHUD();
  }
  function onWord(word, clean, due) {
    if (!run) return;
    if (clean) run.combo++;
    else run.combo = 0;
    run.clears++;
    run.bestCombo = Math.max(run.bestCombo, run.combo);
    const base = 10 + 2 * Math.floor(word.replace(/[^a-z]/gi, "").length / 5),
      multiplier = clean ? M.comboMultiplier(run.combo) : 1;
    const points = Math.round(base * multiplier);
    run.score += points;
    const gain = M.reward(state(), {
      word,
      clean,
      due,
      score: run.score,
      combo: run.combo,
      date: localDate(),
    });
    run.xp += gain.xp;
    run.coins += gain.coins;
    options.save();
    renderHUD();
    const message = `+${points} điểm${gain.xp ? ` · +${gain.xp} XP` : ""}${gain.coins ? ` · +${gain.coins} xu` : ""}${gain.tickets ? ` · +${gain.tickets} vé` : ""}${gain.notices.length ? " · " + gain.notices.join(" · ") : ""}`;
    $("guardian-reward").textContent = message;
    $("guardian-reward").classList.remove("g-pop");
    void $("guardian-reward").offsetWidth;
    $("guardian-reward").classList.add("g-pop");
    applyArena();
    if (gain.notices.some((t) => t.startsWith("Trứng đã nở")))
      toast(gain.notices.find((t) => t.startsWith("Trứng đã nở")));
    else if (gain.notices.some((t) => t.startsWith("Tiến hóa")))
      toast("Linh thú đã tiến hóa!");
  }
  function toast(message) {
    $("g-toast").textContent = message;
    $("g-toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ($("g-toast").hidden = true), 5000);
  }
  function question() {
    if (!run) return;
    const boss = (run.clears + 1) % 10 === 0;
    $("arena").classList.toggle("g-boss", boss);
    $("g-boss-label").hidden = !boss;
    if (boss)
      $("g-boss-label").textContent = `KHÁCH THỦ LĨNH · TỪ ${run.clears + 1}`;
  }
  function finish() {
    document.body.classList.remove("g-playing");
    if (!run) return;
    const summary = node("div", "g-run-summary");
    summary.append(
      node("h3", "", "Nhật ký chuyến bay"),
      node(
        "p",
        "",
        `${number(run.score)} điểm · combo tốt nhất ${run.bestCombo} · +${run.xp} XP · +${run.coins} xu`,
      ),
      node(
        "p",
        "g-muted",
        `Kỷ lục ${number(state().bestScore)} điểm. Mọi phần thưởng đã lưu, kể cả khi chuyến bay kết thúc.`,
      ),
    );
    $("result-copy").after(summary);
    run = null;
    $("guardian-hud").hidden = true;
  }
  function clear() {
    document.body.classList.remove("g-playing");
    clearTimeout(toastTimer);
    $("g-toast").hidden = true;
    run = null;
    $("guardian-hud").hidden = true;
    document.querySelectorAll(".g-run-summary").forEach((el) => el.remove());
  }
  function mount(config) {
    options = config;
    state();
    $("g-open").onclick = open;
    $("g-close").onclick = () => $("guardian-dialog").close();
    $("guardian-dialog").addEventListener("click", (e) => {
      if (e.target === $("guardian-dialog")) {
        const box = e.target.getBoundingClientRect();
        if (
          e.clientX < box.left ||
          e.clientX > box.right ||
          e.clientY < box.top ||
          e.clientY > box.bottom
        )
          e.target.close();
      }
    });
    for (const b of $("g-tabs").children)
      b.onclick = () => {
        tab = b.dataset.tab;
        notify("");
        renderDialog();
      };
    renderHome();
  }
  globalThis.Guardian = {
    mount,
    renderHome,
    start,
    mistake,
    onWord,
    question,
    finish,
    clear,
  };
})();
