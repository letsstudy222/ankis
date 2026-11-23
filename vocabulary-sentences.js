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
    {
      id: "family-education-textbooks",
      topic: "IELTS Writing Task 2 — Family & Education",
      source: "Chẳng hạn, để tiết kiệm chi phí học tập, những đứa trẻ này có thể lựa chọn mua sách giáo khoa cũ hoặc mượn sách từ thư viện thay vì mua sách mới.",
      reference: "For instance, these children may choose to buy second-hand textbooks or borrow them from a library rather than purchase new ones, thereby reducing their educational expenses.",
      structures: [
        ["For instance, + clause", "chẳng hạn, ví dụ."],
        ["choose + to V", "lựa chọn làm gì."],
        ["borrow something from somewhere", "mượn thứ gì từ đâu."],
        ["rather than + V", "thay vì làm gì (khi song song với buy/purchase)."],
        ["thereby + V-ing", "qua đó, từ đó."],
      ],
      vocabulary: [
        ["second-hand textbooks", "sách giáo khoa cũ."],
        ["educational expenses", "chi phí giáo dục/học tập."],
        ["purchase new ones", "mua những cuốn mới."],
        ["reduce expenses", "giảm chi phí."],
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

  const letterCount = (text) => text.match(/[\p{L}\p{N}]/gu).length;

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
    const annotation = $("sentence-annotation");
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

    $("sentence-picker").replaceChildren(...exercises.map((item, index) => {
      const link = document.createElement("a");
      const query = new URLSearchParams({ view: "sentences", exercise: item.id });
      link.href = `?${query}`;
      link.textContent = `Câu ${String(index + 1).padStart(2, "0")}`;
      if (item === exercise) link.setAttribute("aria-current", "page");
      return link;
    }));
    $("sentence-topic").textContent = exercise.topic;
    $("sentence-style").textContent = exercise.style ?? "";
    $("sentence-style").hidden = !exercise.style;
    $("sentence-source").textContent = exercise.source;
    fillNotes("sentence-structures", exercise.structures);
    fillNotes("sentence-vocabulary", exercise.vocabulary);

    // Count hyphenated compounds as one word and show only their letter count.
    const words = tokenize(exercise.reference);
    const masks = words.map(({ text }) => "*".repeat(letterCount(text)));
    $("sentence-count").textContent = `Số từ trong câu mẫu: ${words.length}`;
    $("sentence-blanks").textContent = words
      .map(({ text }) => "_".repeat(letterCount(text)))
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

    function syncAnnotation() {
      if (annotation.hidden) return;
      annotation.style.width = `${draft.clientWidth}px`;
      annotation.scrollTop = draft.scrollTop;
    }

    function underline(word) {
      annotation.hidden = !word;
      annotation.replaceChildren();
      if (!word) return;
      annotation.append(
        draft.value.slice(0, word.start),
        feedbackWord(word.text, "sentence-underline"),
        draft.value.slice(word.start + word.text.length),
        "\u200b",
      );
      syncAnnotation();
    }

    function checkDraft() {
      const typed = tokenize(draft.value);
      if (!typed.length) return;
      showReference(false);

      let index = 0;
      while (words[index] && typed[index]?.value === words[index].value) index++;
      const expected = words[index];
      const current = typed[index];
      const line = document.createElement("p");
      line.className = "sentence-feedback-line";
      if (index) {
        line.append(feedbackWord(
          typed.slice(0, index).map((word) => word.text).join(" "),
          "sentence-match",
        ));
      }

      const heading = document.createElement("p");
      heading.className = "sentence-feedback-status";
      let start = current?.start ?? draft.value.length;
      let end = start + (current?.text.length ?? 0);
      let markedWord = current;
      if (!expected && !current) {
        heading.textContent = "Tất cả các từ đều khớp với câu mẫu.";
      } else {
        const partial = current && expected?.value.startsWith(current.value);
        const missing = !current || (!partial && current.value === words[index + 1]?.value);
        const extra = !missing && (!expected || (!partial && typed[index + 1]?.value === expected.value));
        heading.textContent = "Khác câu mẫu";
        if (missing) {
          markedWord = undefined;
          end = start;
        } else if (extra) {
          heading.textContent = `Từ thêm so với câu mẫu: ${current.text}`;
        }
        if (expected && !extra) {
          line.append(index ? " " : "", feedbackWord(expected.text, "sentence-expected"));
        }
        const remaining = masks.slice(index + Number(!extra));
        if (remaining.length) {
          const suffix = feedbackWord(remaining.join(" "), "sentence-masked-tail");
          suffix.setAttribute("aria-label", "Phần còn lại của câu mẫu được ẩn");
          suffix.hidden = level === "hard";
          line.append(line.hasChildNodes() ? " " : "", suffix);
        }
        if (partial) start = end;
      }

      underline(markedWord);
      const note = document.createElement("p");
      note.className = "sentence-note";
      note.textContent = "Các cách diễn đạt khác vẫn có thể đúng.";
      feedback.replaceChildren(heading, line, note);
      draft.focus({ preventScroll: true });
      draft.setSelectionRange(start, end);
      const visibleTop = window.visualViewport?.offsetTop ?? 0;
      const visibleBottom = visibleTop + (window.visualViewport?.height ?? innerHeight);
      const roomAboveDraft = draft.getBoundingClientRect().top - visibleTop;
      const overflow = line.getBoundingClientRect().bottom - visibleBottom;
      if (roomAboveDraft < 0) window.scrollBy(0, roomAboveDraft - 8);
      else if (overflow > 0) window.scrollBy(0, Math.min(overflow + 8, roomAboveDraft));
    }

    for (const radio of levels) {
      radio.checked = radio.value === level;
      radio.addEventListener("change", () => {
        level = radio.value;
        $("sentence-hint").hidden = level === "hard";
        const suffix = feedback.querySelector(".sentence-masked-tail");
        if (suffix) suffix.hidden = level === "hard";
        save();
      });
    }
    $("sentence-hint").hidden = level === "hard";
    draft.addEventListener("input", () => {
      underline();
      updateDraft();
      save();
    });
    draft.addEventListener("scroll", syncAnnotation);
    new ResizeObserver(syncAnnotation).observe(draft);
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
