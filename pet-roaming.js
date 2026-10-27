"use strict";
(() => {
  let root,
    pet,
    avatar,
    dock,
    call,
    pat,
    toggle,
    message,
    name = "",
    signature = "",
    enabled = true,
    hatched = false,
    x = 16,
    y = 20,
    tx = 16,
    ty = 20,
    frame = 0,
    last = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const allowed = () =>
    hatched &&
    enabled &&
    !reduced.matches &&
    !document.hidden &&
    !document.getElementById("guardian-dialog").open &&
    document.activeElement !== pet &&
    !pet.matches(":hover");
  function bounds() {
    return {
      w: Math.max(0, innerWidth - pet.offsetWidth - 8),
      h: Math.max(0, innerHeight - pet.offsetHeight - 12),
    };
  }
  function paint() {
    const { w, h } = bounds();
    x = Math.max(4, Math.min(w, x));
    y = Math.max(4, Math.min(h, y));
    pet.style.transform = `translate(${x}px,${y}px)`;
  }
  function target() {
    const { w, h } = bounds();
    tx = 8 + Math.random() * Math.max(0, w - 8);
    ty = 12 + Math.random() * Math.max(0, h - 12);
  }
  function tick(now) {
    frame = 0;
    if (!allowed()) {
      pet.classList.remove("is-moving");
      return;
    }
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const dx = tx - x,
      dy = ty - y,
      d = Math.hypot(dx, dy),
      step = 24 * dt;
    if (d < 2) target();
    else {
      avatar.style.setProperty("--pet-facing", dx < 0 ? -1 : 1);
      x += (dx / d) * Math.min(step, d);
      y += (dy / d) * Math.min(step, d);
      paint();
    }
    pet.classList.add("is-moving");
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    pet.classList.remove("is-moving");
    root.classList.toggle("pet-study", document.getElementById("home").hidden);
    if (allowed()) frame = requestAnimationFrame(tick);
  }
  function say() {
    message.textContent = `${name} thích được bạn vuốt ve. Cùng học tiếp nhé!`;
    avatar.classList.remove("pet-patted");
    void avatar.offsetWidth;
    avatar.classList.add("pet-patted");
  }
  function mount() {
    root = document.createElement("div");
    root.id = "pet-background";
    pet = document.createElement("button");
    pet.type = "button";
    pet.id = "pet-walker";
    avatar = document.createElement("span");
    avatar.className = "pet-walker-avatar";
    pet.append(avatar);
    root.append(pet);
    document.body.append(root);
    dock = document.createElement("details");
    dock.id = "pet-dock";
    const summary = document.createElement("summary");
    summary.textContent = "Bạn đồng hành";
    dock.append(summary);
    const controls = document.createElement("div");
    controls.className = "pet-dock-controls";
    call = document.createElement("button");
    call.id = "pet-call";
    call.type = "button";
    call.textContent = "Gọi lại";
    pat = document.createElement("button");
    pat.id = "pet-pat";
    pat.type = "button";
    pat.textContent = "Vuốt ve";
    toggle = document.createElement("button");
    toggle.id = "pet-walk-toggle";
    toggle.type = "button";
    toggle.textContent = "Dừng đi dạo";
    toggle.setAttribute("aria-pressed", "true");
    controls.append(call, pat, toggle);
    message = document.createElement("p");
    message.id = "pet-yard-message";
    message.setAttribute("aria-live", "polite");
    dock.append(controls, message);
    document.body.append(dock);
    pet.onclick = say;
    pat.onclick = say;
    call.onclick = () => {
      tx = 16;
      ty = Math.max(12, innerHeight - pet.offsetHeight - 30);
      message.textContent = `${name} đang chạy lại góc màn hình.`;
      if (reduced.matches || !enabled) {
        x = tx;
        y = ty;
        paint();
      }
      sync();
    };
    toggle.onclick = () => {
      enabled = !enabled;
      toggle.textContent = enabled ? "Dừng đi dạo" : "Cho thú đi dạo";
      toggle.setAttribute("aria-pressed", String(enabled));
      sync();
    };
    pet.onfocus = sync;
    pet.onblur = sync;
    pet.onpointerenter = sync;
    pet.onpointerleave = sync;
    pet.onkeydown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const d = {
        ArrowLeft: [-30, 0],
        ArrowRight: [30, 0],
        ArrowUp: [0, -25],
        ArrowDown: [0, 25],
      }[e.key];
      if (d) {
        e.preventDefault();
        e.stopPropagation();
        x += d[0];
        y += d[1];
        tx = x;
        ty = y;
        paint();
      }
    };
    addEventListener("resize", () => {
      paint();
      target();
      sync();
    });
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    new MutationObserver(sync).observe(document.getElementById("home"), {
      attributes: true,
      attributeFilter: ["hidden"],
    });
    new MutationObserver(sync).observe(
      document.getElementById("guardian-dialog"),
      { attributes: true, attributeFilter: ["open"] },
    );
    addEventListener("pagehide", () => cancelAnimationFrame(frame));
    addEventListener("pageshow", sync);
  }
  function render(s) {
    if (!root) mount();
    const p = GuardianModel.pets.find((p) => p.id === s.pet),
      stage = GuardianModel.stage(s);
    name = s.petName || p.name;
    hatched = stage.index > 0;
    pet.hidden = !hatched;
    call.disabled = pat.disabled = toggle.disabled = !hatched;
    const key = `${p.id}:${stage.index}:${name}`;
    if (key !== signature) {
      signature = key;
      avatar.innerHTML = GuardianArt.draw(p, stage.index, !hatched);
      pet.dataset.species = p.id;
      pet.setAttribute("aria-label", `Vuốt ve ${name}`);
      message.textContent = hatched
        ? `${name} sẽ đi quanh nền, kể cả lúc bạn học. Trên điện thoại có thể vuốt ve bằng nút ở đây.`
        : "Chọn thú đã nở để đi dạo cùng bạn.";
      x = 16;
      y = Math.max(12, innerHeight - 120);
      paint();
      target();
    }
    sync();
  }
  globalThis.PetRoaming = { render };
})();
