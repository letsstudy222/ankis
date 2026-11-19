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

  function tokenize(text) {
    return Array.from(text.matchAll(/[\p{L}\p{N}]+(?:[-‐‑’'][\p{L}\p{N}]+)*/gu), (match) => ({
      text: match[0],
      value: match[0].toLowerCase().replace(/’/g, "'").replace(/[‐‑]/g, "-"),
      start: match.index,
    }));
  }

  function feedbackWord(text, className) {
    const word = document.createElement("span");
    word.lang = "en";
    word.className = className;
    word.textContent = text;
    return word;
  }

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
    const check = $("sentence-check");
    const feedback = $("sentence-feedback");
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
    const words = tokenize(exercise.reference);
    $("sentence-count").textContent = `Số từ trong câu mẫu: ${words.length}`;
    $("sentence-blanks").textContent = words
      .map(({ text }) => "_".repeat(text.match(/[\p{L}\p{N}]/gu).length))
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
      check.disabled = !tokenize(draft.value).length;
      comparisonCopy.textContent = draft.value;
      if (compare.disabled) comparison.hidden = true;
      if (check.disabled) feedback.replaceChildren();
    }

    function showReference(show, comparing = false) {
      reference.hidden = !show;
      referenceCopy.textContent = show ? exercise.reference : "";
      comparison.hidden = !comparing;
      reveal.textContent = show ? "Ẩn câu mẫu" : "Xem câu mẫu";
      reveal.setAttribute("aria-expanded", String(show));
    }

    function checkDraft() {
      const typed = tokenize(draft.value);
      if (!typed.length) return;
      showReference(false);

      let index = 0;
      while (words[index] && typed[index]?.value === words[index].value) index++;
      const expected = words[index];
      const current = typed[index];
      const prefix = document.createElement("p");
      if (index) {
        prefix.append("Khớp với câu mẫu: ", feedbackWord(
          typed.slice(0, index).map((word) => word.text).join(" "),
          "sentence-match",
        ));
      }

      const result = document.createElement("p");
      let start = current?.start ?? draft.value.length;
      let end = start + (current?.text.length ?? 0);
      if (!expected && !current) {
        result.textContent = "Tất cả các từ đều khớp với câu mẫu.";
      } else {
        const missing = !current || (words[index + 1] && current.value === words[index + 1].value);
        const extra = !expected || (current && typed[index + 1]?.value === expected.value);
        if (missing) {
          end = start;
          result.append("Từ tiếp theo trong câu mẫu: ", feedbackWord(expected.text, "sentence-expected"));
        } else if (extra) {
          result.append("Từ thêm so với câu mẫu: ", feedbackWord(current.text, "sentence-mismatch"));
        } else {
          result.append(
            "Bạn viết: ", feedbackWord(current.text, "sentence-mismatch"),
            " · Câu mẫu dùng: ", feedbackWord(expected.text, "sentence-expected"),
          );
        }
      }

      const note = document.createElement("p");
      note.className = "sentence-note";
      note.textContent = "Đây là lần đối chiếu gần nhất với câu mẫu. Cách diễn đạt khác vẫn có thể đúng.";
      feedback.replaceChildren(...(index ? [prefix, result, note] : [result, note]));
      draft.focus({ preventScroll: true });
      draft.setSelectionRange(start, end);
      const visibleTop = window.visualViewport?.offsetTop ?? 0;
      const visibleBottom = visibleTop + (window.visualViewport?.height ?? innerHeight);
      const roomAboveDraft = draft.getBoundingClientRect().top - visibleTop;
      const overflow = result.getBoundingClientRect().bottom - visibleBottom;
      if (roomAboveDraft < 0) window.scrollBy(0, roomAboveDraft - 8);
      else if (overflow > 0) window.scrollBy(0, Math.min(overflow + 8, roomAboveDraft));
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
    draft.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.altKey || event.ctrlKey ||
          event.metaKey || event.isComposing || event.keyCode === 229) return;
      event.preventDefault();
      if (!event.repeat) checkDraft();
    });
    check.addEventListener("click", checkDraft);
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
