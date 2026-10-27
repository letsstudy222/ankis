"use strict";
(() => {
  let yard,
    floor,
    pet,
    avatar,
    message,
    call,
    toggle,
    signature = "",
    enabled = true,
    inView = false,
    hatched = false,
    x = 0,
    y = 0,
    name = "",
    timer;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const canWalk = () =>
    hatched &&
    enabled &&
    inView &&
    !reduced.matches &&
    !document.hidden &&
    !document.getElementById("home").hidden &&
    !document.getElementById("guardian-dialog").open &&
    document.activeElement !== pet &&
    !pet.matches(":hover");
  function moveTo(nextX, nextY, instant = false) {
    const maxX = Math.max(0, floor.clientWidth - pet.offsetWidth),
      maxY = Math.max(0, floor.clientHeight - pet.offsetHeight);
    const targetX = Math.max(0, Math.min(maxX, nextX)),
      targetY = Math.max(0, Math.min(maxY, nextY));
    avatar.style.setProperty("--pet-facing", targetX < x ? -1 : 1);
    x = targetX;
    y = targetY;
    pet.style.transition = instant || reduced.matches ? "none" : "";
    pet.style.transform = `translate(${x}px, ${y}px)`;
  }
  function freeze() {
    if (!hatched || !floor.offsetWidth) return;
    const matrix = new DOMMatrixReadOnly(getComputedStyle(pet).transform);
    moveTo(matrix.m41, matrix.m42, true);
  }
  function wander() {
    if (canWalk())
      moveTo(
        Math.random() * Math.max(0, floor.clientWidth - pet.offsetWidth),
        Math.random() * Math.max(0, floor.clientHeight - pet.offsetHeight),
      );
  }
  function mount() {
    yard = document.createElement("section");
    yard.id = "pet-yard";
    yard.className = "pet-yard";
    yard.setAttribute("aria-label", "Góc đi dạo của thú cưng");
    const heading = document.createElement("h2");
    heading.textContent = "Một vòng đi dạo";
    const hint = document.createElement("p");
    hint.className = "pet-yard-hint";
    hint.textContent =
      "Chạm nền để dẫn đường. Tab chọn thú, Enter/Space vuốt ve; phím mũi tên để di chuyển.";
    floor = document.createElement("div");
    floor.id = "pet-yard-floor";
    pet = document.createElement("button");
    pet.id = "pet-walker";
    pet.type = "button";
    pet.hidden = true;
    avatar = document.createElement("span");
    avatar.className = "pet-walker-avatar";
    pet.append(avatar);
    floor.append(pet);
    const controls = document.createElement("div");
    controls.className = "pet-yard-controls";
    call = document.createElement("button");
    call.type = "button";
    call.id = "pet-call";
    call.textContent = "Gọi lại";
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "pet-walk-toggle";
    toggle.textContent = "Dừng đi dạo";
    toggle.setAttribute("aria-pressed", "true");
    controls.append(call, toggle);
    message = document.createElement("p");
    message.id = "pet-yard-message";
    message.setAttribute("aria-live", "polite");
    yard.append(heading, hint, floor, controls, message);
    document.getElementById("guardian-home").after(yard);
    call.onclick = () => {
      moveTo(
        (floor.clientWidth - pet.offsetWidth) / 2,
        (floor.clientHeight - pet.offsetHeight) / 2,
      );
      message.textContent = `${name} chạy lại bên bạn.`;
    };
    toggle.onclick = () => {
      freeze();
      enabled = !enabled;
      toggle.setAttribute("aria-pressed", String(enabled));
      toggle.textContent = enabled ? "Dừng đi dạo" : "Cho thú đi dạo";
      message.textContent = enabled
        ? `${name} tiếp tục đi dạo.`
        : `${name} nghỉ cạnh bạn.`;
      if (enabled) wander();
    };
    pet.onclick = (e) => {
      e.stopPropagation();
      freeze();
      message.textContent = `${name} thích được bạn vuốt ve. Cùng học thêm một chút nhé!`;
      avatar.classList.remove("pet-patted");
      void avatar.offsetWidth;
      avatar.classList.add("pet-patted");
    };
    pet.onfocus = freeze;
    pet.onpointerenter = freeze;
    pet.onkeydown = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const directions = {
        ArrowLeft: [-35, 0],
        ArrowRight: [35, 0],
        ArrowUp: [0, -25],
        ArrowDown: [0, 25],
      };
      const d = directions[e.key];
      if (d) {
        e.preventDefault();
        e.stopPropagation();
        moveTo(x + d[0], y + d[1], true);
      }
    };
    floor.onclick = (e) => {
      if (!hatched) return;
      const box = floor.getBoundingClientRect();
      moveTo(
        e.clientX - box.left - pet.offsetWidth / 2,
        e.clientY - box.top - pet.offsetHeight / 2,
      );
      message.textContent = `${name} đi theo hướng bạn chỉ.`;
    };
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (!inView) freeze();
    }).observe(yard);
    new MutationObserver(() => {
      if (document.getElementById("home").hidden) freeze();
    }).observe(document.getElementById("home"), {
      attributes: true,
      attributeFilter: ["hidden"],
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) freeze();
    });
    document.getElementById("guardian-dialog").addEventListener("close", () => {
      if (canWalk()) wander();
    });
    reduced.addEventListener("change", freeze);
    new ResizeObserver(() => moveTo(x, y, true)).observe(floor);
    timer = setInterval(wander, 3500);
    addEventListener("pageshow", (e) => {
      if (e.persisted) {
        clearInterval(timer);
        timer = setInterval(wander, 3500);
      }
    });
    addEventListener("pagehide", () => clearInterval(timer));
  }
  function render(s) {
    if (!yard) mount();
    const p = GuardianModel.pets.find((p) => p.id === s.pet),
      stage = GuardianModel.stage(s);
    name = s.petName || p.name;
    hatched = stage.index > 0;
    pet.hidden = !hatched;
    call.disabled = toggle.disabled = !hatched;
    const key = `${p.id}:${stage.index}:${name}`;
    if (key !== signature) {
      signature = key;
      pet.setAttribute("aria-label", `Vuốt ve ${name}`);
      pet.dataset.species = p.id;
      avatar.innerHTML = GuardianArt.draw(p, stage.index, !hatched);
      message.textContent = hatched
        ? `${name} đang ở bên bạn.`
        : "Linh thú được chọn sẽ đi dạo sau khi trứng nở. Học để ấp trứng rồi quay lại nhé!";
      moveTo(Math.max(0, floor.clientWidth - pet.offsetWidth) / 2, 25, true);
    }
  }
  globalThis.PetRoaming = { render };
})();
