"use strict";
(() => {
  function render(s) {
    const companion = document.getElementById("arena-companion");
    const stage = GuardianModel.stage(s);
    companion.hidden = stage.index === 0;
    companion.onanimationend = (event) => {
      if (event.animationName === "pet-cheer") companion.classList.remove("pet-cheer");
    };
    const species = GuardianModel.pets.find((p) => p.id === s.pet);
    companion.setAttribute("role", "img");
    companion.setAttribute("aria-label", `${s.petName || species.name} đồng hành trong trận`);
  }
  function celebrate() {
    const companion = document.getElementById("arena-companion");
    companion.classList.remove("pet-cheer");
    void companion.offsetWidth;
    companion.classList.add("pet-cheer");
  }
  globalThis.PetRoaming = { render, celebrate };
})();
