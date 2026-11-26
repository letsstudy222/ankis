"use strict";
(() => {
  const M = VocabularyLibraryModel,
    $ = (id) => document.getElementById(id);
  let options,
    mode = "browse",
    selected = 0,
    practice = null,
    allView = false,
    lastFocus = null;
  const root = () => options.getStore();
  const state = () => (root().library ||= M.create());
  const deck = () => M.decks(options.words, state().size)[selected];
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const shuffle = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  function screen(next) {
    mode = next;
    for (const name of ["browse", "detail", "practice", "result"])
      $("lib-" + name).hidden = next !== name;
    $("lib-message").textContent = "";
  }
  function save() {
    options.save();
  }
  function speak(word) {
    if (!("speechSynthesis" in window)) {
      $("lib-message").textContent = "Trình duyệt này chưa hỗ trợ phát âm.";
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-GB";
    u.rate = 0.8;
    speechSynthesis.speak(u);
  }
  function open() {
    lastFocus = document.activeElement;
    $("home").hidden = true;
    $("library").hidden = false;
    $("lib-size").value = String(state().size);
    $("lib-direction").value = state().direction;
    screen("browse");
    browse();
    window.scrollTo(0, 0);
    $("lib-title").focus({ preventScroll: true });
  }
  function close() {
    if (mode === "practice" && practice?.type === "quiz") storeQuiz();
    practice = null;
    $("library").hidden = true;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    options.onClose();
    lastFocus?.focus({ preventScroll: true });
  }
  function wordRows(words, target) {
    target.replaceChildren(
      ...words.map((w) => {
        const row = el("details", "lib-word"),
          summary = el("summary"),
          copy = el("span", "lib-word-copy"),
          record = state().words[w.word];
        copy.append(el("strong", "", w.word), el("span", "", w.meaning));
        const label = record?.lastResult
          ? record.lastResult === "correct"
            ? "Kiểm tra: đúng"
            : "Cần ôn lại"
          : record?.rating
            ? [
                "",
                "Tự đánh giá: chưa nhớ",
                "Tự đánh giá: phân vân",
                "Tự đánh giá: đã nhớ",
              ][record.rating]
            : M.introduced(root().records[w.word])
              ? "Đã làm quen"
              : "Chưa học";
        summary.append(copy, el("small", "lib-word-state", label));
        const context = el("p", "lib-example", w.context),
          listen = el("button", "lib-listen", "Nghe phát âm");
        listen.type = "button";
        listen.setAttribute("aria-label", `Nghe ${w.word}`);
        listen.onclick = () => speak(w.word);
        row.append(summary, context, listen);
        return row;
      }),
    );
  }
  function browse() {
    const s = state(),
      decks = M.decks(options.words, s.size);
    const rated = Object.values(s.words).filter((w) => w.rating).length;
    const checked = Object.values(s.words).filter((w) => w.tests).length;
    $("lib-summary").textContent =
      `${options.words.length} từ & cụm từ · ${decks.length} bộ · ${rated} từ đã tự đánh giá · ${checked} từ đã kiểm tra`;
    $("wl-library-stats").innerHTML = `<div><strong>${decks.length}</strong><span>Bộ từ</span></div><div><strong>${rated}</strong><span>Đã tự đánh giá</span></div><div><strong>${checked}</strong><span>Đã kiểm tra gõ từ</span></div>`;
    $("lib-view-decks").setAttribute("aria-pressed", String(!allView));
    $("lib-view-all").setAttribute("aria-pressed", String(allView));
    const results = M.filter(
      options.words,
      s,
      root().records,
      $("lib-search").value,
      $("lib-filter").value,
    );
    const listing =
      allView ||
      $("lib-search").value.trim() ||
      $("lib-filter").value !== "all";
    $("lib-decks").hidden = !!listing;
    $("lib-list-wrap").hidden = !listing;
    $("lib-list-count").textContent =
      `${results.length} / ${options.words.length} từ`;
    $("lib-empty").hidden = results.length > 0;
    if (listing) wordRows(results, $("lib-word-list"));
    else
      $("lib-decks").replaceChildren(
        ...decks.map((d) => {
          const card = el("article", "lib-deck"),
            known = d.words.filter((w) => s.words[w.word]?.rating === 3).length,
            weak = d.words.filter((w) => M.weak(s, w.word)).length,
            last = M.latest(s, d.words);
          card.append(
            el(
              "span",
              "eyebrow",
              `BỘ ${String(d.index + 1).padStart(2, "0")} / TỪ ${d.start + 1}–${d.start + d.words.length}`,
            ),
            el(
              "h3",
              "",
              d.words
                .slice(0, 3)
                .map((w) => w.word)
                .join(" · "),
            ),
          );
          const meter = el("progress");
          meter.max = d.words.length;
          meter.value = known;
          meter.setAttribute(
            "aria-label",
            `${known} / ${d.words.length} từ tự đánh giá đã nhớ`,
          );
          card.append(
            meter,
            el(
              "p",
              "lib-deck-count",
              `Tự đánh giá đã nhớ: ${known}/${d.words.length} · Cần ôn: ${weak}`,
            ),
            el(
              "p",
              "lib-last-test",
              last
                ? `Kiểm tra gần nhất: ${last.answers.filter((a) => a.correct).length}/${last.answers.length} đúng · đã làm ${last.answers.length}/${last.words.length} từ`
                : "Chưa kiểm tra bộ này",
            ),
          );
          const button = el(
            "button",
            "",
            `Mở bộ ${String(d.index + 1).padStart(2, "0")} →`,
          );
          button.dataset.deck = String(d.index);
          button.onclick = () => showDeck(d.index);
          card.append(button);
          return card;
        }),
      );
  }
  function showDeck(index = selected) {
    selected = index;
    screen("detail");
    const d = deck(),
      s = state(),
      last = M.latest(s, d.words);
    $("lib-deck-title").textContent =
      `Bộ ${String(index + 1).padStart(2, "0")} · ${d.words.length} từ`;
    $("lib-deck-description").textContent =
      `Từ ${d.start + 1}–${d.start + d.words.length} trong toàn bộ từ vựng. Lật thẻ để làm quen, rồi gõ từ để thử trí nhớ.`;
    const remembered = d.words.filter(w => s.words[w.word]?.rating === 3).length;
    $("wl-deck-progress").max = d.words.length;
    $("wl-deck-progress").value = remembered;
    $("wl-deck-progress-label").textContent = `${remembered}/${d.words.length} từ tự đánh giá đã nhớ`;
    $("lib-deck-last").textContent = last
      ? `Lần kiểm tra gần nhất: ${last.answers.filter((a) => a.correct).length}/${last.answers.length} đúng · ${last.answers.length === last.words.length ? "hoàn tất bộ" : "dừng sớm"} · ${new Date(last.at).toLocaleDateString("vi-VN")}`
      : "Chưa có kết quả kiểm tra cho bộ này.";
    $("lib-weak-start").disabled = !d.words.some((w) => M.weak(s, w.word));
    wordRows(d.words, $("lib-deck-words"));
    window.scrollTo(0, 0);
    $("lib-deck-title").focus({ preventScroll: true });
  }
  function start(type, weakOnly = false) {
    const pool = deck().words.filter(
      (w) => !weakOnly || M.weak(state(), w.word),
    );
    if (!pool.length) return;
    practice = {
      type,
      pool,
      queue: $("lib-shuffle").checked ? shuffle(pool) : pool.slice(),
      cursor: 0,
      answers: [],
      ratings: {},
      resolved: false,
      revealed: false,
      stored: false,
    };
    screen("practice");
    $("lib-card-controls").hidden = type !== "cards";
    $("lib-quiz-form").hidden = type !== "quiz";
    $("lib-flash-help").hidden = type !== "cards";
    $("lib-practice-type").textContent =
      type === "cards" ? "FLASHCARD / TỰ ĐÁNH GIÁ" : "KIỂM TRA / TỰ GÕ TỪ";
    window.scrollTo(0, 0);
    question();
  }
  function question() {
    if (practice.cursor >= practice.queue.length) return finish();
    const p = practice,
      w = p.queue[p.cursor];
    p.resolved = false;
    p.revealed = false;
    $("lib-practice-progress").textContent =
      `${p.cursor + 1} / ${p.queue.length} từ`;
    $("wl-lib-progress").max = p.queue.length;
    $("wl-lib-progress").value = p.cursor;
    $("lib-card-front").textContent =
      p.type === "cards" && state().direction === "en" ? w.word : w.meaning;
    $("lib-card-label").textContent =
      p.type === "cards" && state().direction === "en"
        ? "TỪ TIẾNG ANH"
        : "NGHĨA TIẾNG VIỆT";
    $("lib-card-back").hidden = true;
    $("lib-rating").hidden = true;
    $("lib-quiz-feedback").textContent = "";
    $("lib-quiz-next").hidden = true;
    $("lib-quiz-answer").value = "";
    $("lib-quiz-answer").disabled = false;
    $("lib-quiz-check").disabled = false;
    $("lib-quiz-reveal").disabled = false;
    $("lib-flip").hidden = p.type !== "cards";
    $("lib-card-answer").textContent =
      p.type === "cards" && state().direction === "en" ? w.meaning : w.word;
    $("lib-card-context").textContent = w.context;
    $("lib-card").classList.remove("is-revealed");
    if (p.type === "quiz") $("lib-quiz-answer").focus({ preventScroll: true });
    else $("lib-flip").focus({ preventScroll: true });
  }
  function flip() {
    if (!practice || practice.type !== "cards" || practice.revealed) return;
    practice.revealed = true;
    $("lib-card-back").hidden = false;
    $("lib-rating").hidden = false;
    $("lib-flip").hidden = true;
    $("lib-card").classList.add("is-revealed");
    $("lib-rate-1").focus({ preventScroll: true });
  }
  function rate(value) {
    if (!practice || practice.type !== "cards" || !practice.revealed) return;
    const word = practice.queue[practice.cursor].word;
    M.rate(state(), word, value);
    practice.ratings[word] = value;
    save();
    practice.cursor++;
    question();
  }
  function resolve(correct) {
    const p = practice;
    if (!p || p.type !== "quiz" || p.resolved) return;
    p.resolved = true;
    const w = p.queue[p.cursor];
    M.answer(state(), w.word, correct);
    p.answers.push({ word: w.word, correct });
    $("wl-lib-progress").value = p.answers.length;
    save();
    $("lib-card-answer").textContent = w.word;
    $("lib-card-back").hidden = false;
    $("lib-card").classList.add("is-revealed");
    $("lib-quiz-feedback").textContent = correct
      ? "Đúng rồi — bạn đã tự nhớ được từ này."
      : "Đã xem đáp án. Từ này được đưa vào nhóm cần ôn lại.";
    $("lib-quiz-answer").disabled = true;
    $("lib-quiz-check").disabled = true;
    $("lib-quiz-reveal").disabled = true;
    $("lib-quiz-next").hidden = false;
    $("lib-quiz-next").focus({ preventScroll: true });
  }
  function storeQuiz() {
    if (practice && !practice.stored) {
      M.finish(state(), practice.pool, practice.answers);
      practice.stored = true;
      save();
    }
  }
  function finish() {
    const p = practice;
    if (!p) return;
    if (p.type === "quiz") storeQuiz();
    screen("result");
    const count =
      p.type === "quiz" ? p.answers.length : Object.keys(p.ratings).length;
    $("lib-result-title").textContent =
      count === p.queue.length
        ? "Một bộ nhỏ, thêm một bước tiến."
        : "Đã lưu phần bạn vừa học.";
    const ratings = Object.values(p.ratings);
    const correct = p.answers.filter(a => a.correct).length;
    const metrics = p.type === "quiz" ? [[count,"Đã kiểm tra"],[correct,"Tự nhớ đúng"],[count-correct,"Cần hỗ trợ"]] : [[ratings.filter(r=>r===3).length,"Đã nhớ"],[ratings.filter(r=>r===2).length,"Phân vân"],[ratings.filter(r=>r===1).length,"Chưa nhớ"]];
    $("wl-lib-result-stats").innerHTML = metrics.map(([value,label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("");
    $("lib-result-copy").textContent =
      p.type === "quiz"
        ? `${p.answers.filter((a) => a.correct).length}/${count} từ tự nhớ đúng · đã kiểm tra ${count}/${p.queue.length} từ. Từ chưa làm không bị tính sai.`
        : `Tự đánh giá: ${Object.values(p.ratings).filter((r) => r === 3).length} đã nhớ · ${Object.values(p.ratings).filter((r) => r === 2).length} còn phân vân · ${Object.values(p.ratings).filter((r) => r === 1).length} chưa nhớ. Đã xem ${count}/${p.queue.length} thẻ.`;
    if (!count)
      $("lib-result-copy").textContent =
        "Bạn chưa hoàn tất từ nào. Không có kết quả nào được tính.";
    const weakWords = p.pool.filter((w) => M.weak(state(), w.word));
    $("lib-result-weak").hidden = !weakWords.length;
    wordRows(weakWords, $("lib-result-words"));
    $("lib-result-title").focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  function handleKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (mode === "practice") finish();
      else if (mode === "result") showDeck();
      else if (mode === "detail") {
        screen("browse");
        browse();
        $("lib-title").focus();
      } else close();
      return;
    }
    if (e.altKey || e.target.matches("input,select,textarea")) return;
    if (mode === "practice" && practice.type === "cards") {
      if (/^[1-3]$/.test(e.key) && practice.revealed) {
        e.preventDefault();
        rate(Number(e.key));
      } else if (
        (e.key === " " || e.key === "Enter") &&
        !e.target.closest("button") &&
        !practice.revealed
      ) {
        e.preventDefault();
        flip();
      }
    }
  }
  function mount(config) {
    options = config;
    $("library-open").onclick = open;
    $("lib-home").onclick = close;
    $("lib-size").onchange = () => {
      state().size = Number($("lib-size").value);
      selected = 0;
      save();
      browse();
    };
    $("lib-search").oninput = browse;
    $("lib-filter").onchange = browse;
    $("lib-view-decks").onclick = () => {
      allView = false;
      $("lib-search").value = "";
      $("lib-filter").value = "all";
      browse();
    };
    $("lib-view-all").onclick = () => {
      allView = true;
      browse();
    };
    $("lib-all-decks").onclick = () => {
      screen("browse");
      browse();
      $("lib-title").focus();
    };
    $("lib-direction").onchange = () => {
      state().direction = $("lib-direction").value;
      save();
    };
    $("lib-cards-start").onclick = () => start("cards");
    $("lib-quiz-start").onclick = () => start("quiz");
    $("lib-weak-start").onclick = () => start("cards", true);
    $("lib-flip").onclick = flip;
    for (let i = 1; i <= 3; i++) $("lib-rate-" + i).onclick = () => rate(i);
    $("lib-speak").onclick = () => speak(practice.queue[practice.cursor].word);
    $("lib-quiz-form").onsubmit = (e) => {
      e.preventDefault();
      if (!practice || practice.resolved) return;
      const value = $("lib-quiz-answer")
        .value.toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
      if (value === practice.queue[practice.cursor].word.toLowerCase())
        resolve(true);
      else
        $("lib-quiz-feedback").textContent =
          "Chưa khớp. Bạn có thể sửa lại; chỉ khi xem đáp án mới tính là cần ôn.";
    };
    $("lib-quiz-reveal").onclick = () => resolve(false);
    $("lib-quiz-next").onclick = () => {
      if (practice?.resolved) {
        practice.cursor++;
        question();
      }
    };
    $("lib-stop").onclick = finish;
    $("lib-result-back").onclick = () => showDeck();
    $("lib-result-retry").onclick = () => start("quiz", true);
  }
  globalThis.VocabularyLibrary = {
    open,
    close,
    mount,
    isOpen: () => !$("library").hidden,
    handleKey,
  };
})();
