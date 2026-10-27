"use strict";
(() => {
  const segments = [
    "5,2 27,2 23,6 9,6",
    "28,3 28,25 24,22 24,8",
    "28,29 28,51 24,46 24,32",
    "5,52 27,52 23,48 9,48",
    "3,29 7,32 7,46 3,51",
    "3,3 7,8 7,22 3,25",
    "5,27 9,24 23,24 27,27 23,30 9,30",
  ];
  const lit = [
    "abcdef",
    "bc",
    "abdeg",
    "abcdg",
    "bcfg",
    "acdfg",
    "acdefg",
    "abc",
    "abcdefg",
    "abcdfg",
  ];
  function paint(seconds, mode = "running") {
    const node = document.getElementById("flight-time");
    if (!node.querySelector("svg")) {
      node.innerHTML = `<span class="clock-readable"></span><svg viewBox="0 0 148 54" aria-hidden="true">${[0, 34, 82, 116].map((x) => `<g transform="translate(${x},0)">${segments.map((points) => `<polygon points="${points}"/>`).join("")}</g>`).join("")}<circle class="clock-colon" cx="72" cy="18" r="2.5"/><circle class="clock-colon" cx="72" cy="37" r="2.5"/></svg>`;
    }
    const safe = Math.max(0, Math.min(5999, Math.ceil(seconds)));
    const value = `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
    node.dataset.seconds = String(safe);
    node.querySelector(".clock-readable").textContent = value;
    const digits = value.replace(":", "");
    [...node.querySelectorAll("g")].forEach((group, i) => {
      [...group.children].forEach((segment, j) =>
        segment.classList.toggle(
          "is-lit",
          lit[Number(digits[i])].includes("abcdefg"[j]),
        ),
      );
    });
    const clock = node.closest(".flight-clock");
    clock.dataset.mode = mode;
    clock.classList.toggle("clock-warning", safe <= 10 && mode === "running");
    clock.setAttribute(
      "aria-label",
      `${mode === "coaching" ? "Dừng để học lại" : mode === "paused" ? "Đã tạm dừng" : "Thời gian còn lại"}: ${Math.floor(safe / 60)} phút ${safe % 60} giây`,
    );
    document.getElementById("clock-state").textContent =
      mode === "coaching"
        ? "HỌC LẠI · ĐÃ DỪNG"
        : mode === "paused"
          ? "TẠM DỪNG"
          : "THỜI GIAN CÒN LẠI";
  }
  globalThis.FlightClock = { paint };
})();
