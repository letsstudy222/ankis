"use strict";
const VocabularySentences = (() => {
  const exercises = [
    {
      id: "family-education-essential-needs",
      topic: "IELTS Writing Task 2 — Family & Education",
      style: "Phù hợp văn phong Band 7.5+",
      source: "Trẻ em lớn lên trong những gia đình có thu nhập hạn chế thường phải cân nhắc kỹ hơn khi sử dụng tiền, từ đó học cách phân biệt nhu cầu thiết yếu và những khoản chi không cần thiết.",
      reference: "Children growing up in low-income families often have to think carefully about how they spend money, thereby learning to distinguish between essential needs and unnecessary expenses.",
      structures: [
        ["grow up in + N", "lớn lên trong một môi trường/gia đình."],
        ["think carefully about + N/V-ing", "cân nhắc kỹ về điều gì."],
        ["distinguish between A and B", "phân biệt giữa A và B."],
        ["thereby + V-ing", "qua đó, từ đó (diễn đạt kết quả của hành động trước)."],
      ],
      vocabulary: [
        ["low-income families", "gia đình thu nhập thấp."],
        ["spend money", "tiêu tiền, chi tiêu."],
        ["essential needs", "nhu cầu thiết yếu."],
        ["unnecessary expenses", "các khoản chi không cần thiết."],
      ],
    },
  ];
  const $ = (id) => document.getElementById(id);

  function fillNotes(id, entries) {
    $(id).replaceChildren(...entries.flatMap(([term, meaning]) => {
      const label = document.createElement("dt");
      label.lang = "en";
      label.textContent = term;
      const definition = document.createElement("dd");
      definition.textContent = meaning;
      return [label, definition];
    }));
  }

  function open(id) {
    const exercise = exercises.find((item) => item.id === id) ?? exercises[0];
    const storageKey = `letsstudy-sentence-draft-v1:${exercise.id}`;
    const draft = $("sentence-draft");
    const status = $("sentence-save");
    const compare = $("sentence-compare");
    const reveal = $("sentence-reveal");
    const reference = $("sentence-reference");
    const referenceCopy = $("sentence-reference-copy");
    const comparison = $("sentence-comparison");
    const comparisonCopy = $("sentence-comparison-copy");
    const levels = document.querySelectorAll('input[name="sentence-level"]');
    let level = "easy";

    $("sentence-topic").textContent = exercise.topic;
    $("sentence-style").textContent = exercise.style;
    $("sentence-source").textContent = exercise.source;
    fillNotes("sentence-structures", exercise.structures);
    fillNotes("sentence-vocabulary", exercise.vocabulary);

    // Count hyphenated compounds as one word and show only their letter count.
    const words = exercise.reference.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) ?? [];
    $("sentence-count").textContent = `Số từ trong câu mẫu: ${words.length}`;
    $("sentence-blanks").textContent = words
      .map((word) => "_".repeat(word.match(/[\p{L}\p{N}]/gu).length))
      .join(" ");

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (typeof saved?.draft === "string") draft.value = saved.draft;
      if (saved?.level === "hard") level = "hard";
      if (draft.value) status.textContent = "Đã khôi phục bản nháp trên thiết bị này.";
    } catch {
      status.textContent = "Không thể đọc bản nháp đã lưu trên thiết bị này.";
    }

    function save() {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ draft: draft.value, level }));
        status.textContent = draft.value ? "Đã lưu bản nháp trên thiết bị này." : "";
      } catch {
        status.textContent = "Không thể lưu bản nháp trên thiết bị này.";
      }
    }

    function updateDraft() {
      compare.disabled = !draft.value.trim();
      comparisonCopy.textContent = draft.value;
      if (compare.disabled) comparison.hidden = true;
    }

    function showReference(show, comparing = false) {
      reference.hidden = !show;
      referenceCopy.textContent = show ? exercise.reference : "";
      comparison.hidden = !comparing;
      reveal.textContent = show ? "Ẩn câu mẫu" : "Xem câu mẫu";
      reveal.setAttribute("aria-expanded", String(show));
    }

    for (const radio of levels) {
      radio.checked = radio.value === level;
      radio.addEventListener("change", () => {
        level = radio.value;
        $("sentence-hint").hidden = level === "hard";
        save();
      });
    }
    $("sentence-hint").hidden = level === "hard";
    draft.addEventListener("input", () => {
      updateDraft();
      save();
    });
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", () => {
      if (document.activeElement !== draft || viewport.scale !== 1) return;
      const bottom = viewport.offsetTop + viewport.height;
      const overlap = draft.getBoundingClientRect().bottom - bottom;
      if (overlap > 0) window.scrollBy(0, overlap + 12);
    });
    reveal.addEventListener("click", () => showReference(reference.hidden));
    compare.addEventListener("click", () => {
      showReference(true, true);
      $("sentence-reference-title").focus();
    });
    updateDraft();
    $("home").hidden = true;
    $("sentences").hidden = false;
    $("sentence-title").focus({ preventScroll: true });
  }

  return { open };
})();
