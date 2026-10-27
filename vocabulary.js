"use strict";
(() => {
  const words = window.VOCABULARY,
    $ = (id) => document.getElementById(id),
    KEY = "letsstudy-vocabulary-v1",
    DAY = 86400000;
  const date = () => new Date().toLocaleDateString("sv-SE");
  const empty = () => ({ version: 1, records: {}, daily: null });
  let store;
  try {
    store = JSON.parse(localStorage.getItem(KEY));
  } catch {}
  if (!valid(store)) store = empty();
  let session = null,
    frame = 0,
    sound = false,
    audio,
    reviewIds = [];
  function valid(x) {
    return (
      x &&
      (!x.guardian ||
        GuardianModel.valid(
          x.guardian,
          words.map((w) => w.word),
        )) &&
      x.version === 1 &&
      x.records &&
      typeof x.records === "object" &&
      !Array.isArray(x.records) &&
      Object.keys(x.records).every((k) => words.some((w) => w.word === k)) &&
      Object.values(x.records).every(
        (r) =>
          r &&
          Number.isInteger(r.stage) &&
          r.stage >= 0 &&
          r.stage <= 6 &&
          Number.isFinite(r.due) &&
          Number.isInteger(r.attempts) &&
          r.attempts >= 0 &&
          (r.learned === undefined || typeof r.learned === "boolean") &&
          (r.learningStep === undefined ||
            (Number.isInteger(r.learningStep) &&
              r.learningStep >= 0 &&
              r.learningStep <= 3)),
      ) &&
      (!x.daily ||
        (typeof x.daily.date === "string" &&
          Array.isArray(x.daily.ids) &&
          Array.isArray(x.daily.done) &&
          x.daily.ids.every(
            (i) => Number.isInteger(i) && i >= 0 && i < words.length,
          ) &&
          x.daily.done.every((i) => x.daily.ids.includes(i))))
    );
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
      $("notice").textContent =
        "Không lưu được tiến độ. Hãy xuất bản sao trước khi đóng trang.";
    }
  }
  function shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }
  const introduced = (w) => {
    const r = store.records[w.word];
    return (
      !!r && (r.learned === true || (r.learned === undefined && r.stage > 0))
    );
  };
  function plan() {
    const ids = words
      .map((w, i) => ({ i, r: store.records[w.word] }))
      .filter((x) => introduced(words[x.i]) && x.r.due <= Date.now())
      .sort((a, b) => a.r.due - b.r.due)
      .slice(0, 20)
      .map((x) => x.i);
    store.daily = { date: date(), ids, done: [] };
    save();
  }
  let lesson = null;
  function startLearning() {
    const candidates = words
      .map((_, i) => i)
      .filter((i) => !introduced(words[i]));
    const partial = candidates.filter(
      (i) => store.records[words[i].word]?.learningStep > 0,
    );
    const ids = [
      ...partial,
      ...shuffle(candidates.filter((i) => !partial.includes(i))),
    ].slice(0, 5);
    if (!ids.length) return;
    lesson = { ids, queue: [], cursor: 0 };
    for (let step = 0; step < 3; step++)
      for (const id of shuffle(ids))
        if ((store.records[words[id].word]?.learningStep || 0) <= step)
          lesson.queue.push({ id, step });
    $("home").hidden = true;
    $("learning").hidden = false;
    window.scrollTo(0, 0);
    showLearning();
  }
  function showLearning() {
    if (lesson.cursor >= lesson.queue.length) {
      lesson = null;
      $("learning").hidden = true;
      home();
      $("notice").textContent =
        "Đã làm quen xong nhóm từ! Nghỉ khoảng 10 phút rồi quay lại Ôn hôm nay để thử tự nhớ. Bạn cũng có thể chủ động luyện ngay với từ đã học.";
      return;
    }
    const task = lesson.queue[lesson.cursor],
      w = words[task.id];
    $("learning-progress").textContent =
      `Nhóm ${lesson.ids.length} từ · bước ${lesson.cursor + 1} / ${lesson.queue.length}`;
    $("learning-label").textContent = [
      "1 / KHÁM PHÁ: ĐỌC TỪ, NGHĨA VÀ CÂU",
      "2 / NHẬN DIỆN: CHỌN NGHĨA CỦA TỪ",
      "3 / LÀM QUEN CHÍNH TẢ: GÕ THEO MẪU",
    ][task.step];
    $("learning-word").textContent = w.word;
    $("learning-meaning").textContent = task.step === 1 ? "" : w.meaning;
    $("learning-context").textContent = task.step === 1 ? "" : w.context;
    $("learning-feedback").textContent = "";
    $("learning-next").hidden = task.step !== 0;
    $("copy-form").hidden = task.step !== 2;
    $("copy-answer").value = "";
    $("learning-choices").replaceChildren();
    if (task.step === 1) {
      const choices = shuffle([
        task.id,
        ...shuffle(
          words
            .map((_, i) => i)
            .filter((i) => i !== task.id && words[i].meaning !== w.meaning),
        ).slice(0, 3),
      ]);
      for (const id of choices) {
        const button = document.createElement("button");
        const number = $("learning-choices").children.length + 1;
        button.setAttribute("aria-keyshortcuts", String(number));
        const badge = document.createElement("kbd");
        badge.textContent = number;
        button.append(badge, document.createTextNode(" " + words[id].meaning));
        button.onclick = () => {
          if (id !== task.id) {
            $("learning-feedback").textContent =
              "Chưa khớp — không sao, thử chọn lại nhé.";
            button.disabled = true;
            return;
          }
          $("learning-feedback").textContent =
            "Đúng rồi! " + w.word + " = " + w.meaning;
          $("learning-context").textContent = w.context;
          for (const b of $("learning-choices").children) b.disabled = true;
          $("learning-next").hidden = false;
          $("learning-next").focus({ preventScroll: true });
        };
        $("learning-choices").append(button);
      }
    }
    if (task.step === 2) $("copy-answer").focus();
    else if (task.step === 0) $("learning-next").focus({ preventScroll: true });
    else
      $("learning-choices").firstElementChild?.focus({ preventScroll: true });
  }
  function advanceLearning() {
    const { id, step } = lesson.queue[lesson.cursor],
      w = words[id],
      old = store.records[w.word] || { stage: 0, attempts: 0, due: 0 };
    store.records[w.word] = {
      ...old,
      learningStep: step + 1,
      learned: step === 2,
      introducedOn: step === 2 ? date() : old.introducedOn,
      due: step === 2 ? Date.now() + 10 * 60000 : old.due,
    };
    save();
    lesson.cursor++;
    showLearning();
  }
  $("learn").onclick = startLearning;
  $("learning-next").onclick = advanceLearning;
  $("leave-learning").onclick = () => {
    lesson = null;
    home();
  };
  $("copy-form").onsubmit = (e) => {
    e.preventDefault();
    const w = words[lesson.queue[lesson.cursor].id];
    if (normalized($("copy-answer").value) === w.word.toLowerCase())
      advanceLearning();
    else
      $("learning-feedback").textContent =
        "Cứ nhìn mẫu và sửa lại từng chữ. Bước này không tính đúng sai.";
  };
  $("pronounce").onclick = () => {
    if (!("speechSynthesis" in window)) {
      $("learning-feedback").textContent =
        "Trình duyệt này chưa hỗ trợ đọc từ.";
      return;
    }
    const u = new SpeechSynthesisUtterance(
      words[lesson.queue[lesson.cursor].id].word,
    );
    u.lang = "en-GB";
    u.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };
  function home() {
    cancelAnimationFrame(frame);
    Guardian.clear();
    session = null;
    $("learning").hidden = true;
    plan();
    $("home").hidden = false;
    $("session").hidden = true;
    $("result").hidden = true;
    const remaining = store.daily.ids.filter(
      (i) => !store.daily.done.includes(i),
    );
    const seen = words.filter(introduced).length;
    const learned = Object.values(store.records).filter(
      (r) => r.stage >= 3,
    ).length;
    $("stats").innerHTML =
      `<div><strong>${words.length}</strong><small>từ & cụm từ</small></div><div><strong>${seen}</strong><small>đã làm quen</small></div><div><strong>${learned}</strong><small>đã nhớ ≥ 7 ngày</small></div>`;
    $("daily-description").textContent =
      `${remaining.length} từ đã học đến hạn. Chỉ ôn tự nhớ sau khi làm quen; không đưa từ mới vào bài điền.`;
    $("daily").disabled = !remaining.length;
    $("daily").textContent = remaining.length
      ? "Bắt đầu hôm nay →"
      : "Chưa có từ đến hạn";
    const fresh = words.filter((w) => !introduced(w)).length;
    $("learn-description").textContent =
      `${fresh} từ chờ làm quen. Mỗi lượt chỉ 5 từ: xem → chọn nghĩa → gõ theo mẫu. Không chấm điểm.`;
    $("learn").disabled = !fresh;
    $("infinite").disabled = !seen;
    $("game").disabled = !seen;
    Guardian.renderHome();
    const newToday = Object.values(store.records).filter(
      (record) => record.learned && record.introducedOn === date(),
    ).length;
    const lightPractice = newToday >= 5;
    const recommendation = remaining.length
      ? "daily"
      : lightPractice
        ? "infinite"
        : fresh
          ? "learn"
          : "game";
    $("route-title").textContent = remaining.length
      ? `${remaining.length} từ đang chờ bạn nhớ lại`
      : lightPractice
        ? "Đã làm quen đủ một nhóm hôm nay"
        : fresh
          ? "Một nhóm nhỏ, năm từ mới"
          : "Sẵn sàng cho một chuyến bay?";
    $("route-copy").textContent = remaining.length
      ? "Ôn từ đến hạn trước, rồi ghé sân chơi. Vài phút cũng là một bước tiến."
      : lightPractice
        ? "Nghỉ một chút để từ lắng lại. Nếu muốn luyện tiếp, thử tự nhớ không có đồng hồ; bạn vẫn có thể chủ động học thêm."
        : fresh
          ? "Xem nghĩa và câu → nhận diện → gõ theo mẫu. Không cần thuộc ngay."
          : "Từ đã làm quen, độ khó vừa sức. Dừng lúc nào cũng giữ tiến độ.";
    $("route-start").textContent =
      lightPractice && !remaining.length ? "Luyện nhẹ →" : "Bắt đầu →";
    $("route-start").onclick = () => $(recommendation).click();
  }
  function start(mode, selectedIds) {
    Guardian.clear();
    plan();
    const familiar = words.map((_, i) => i).filter((i) => introduced(words[i]));
    const queue = selectedIds?.length
      ? selectedIds.slice()
      : mode === "daily"
        ? store.daily.ids.filter((i) => !store.daily.done.includes(i))
        : mode === "game"
          ? VocabularyPractice.queue(familiar, words, store.records)
          : shuffle(familiar);
    if (!queue.length) return;
    session = {
      mode,
      queue,
      cursor: 0,
      correct: 0,
      completed: 0,
      helped: false,
      mistake: false,
      resolved: false,
      paused: false,
      elapsed: 0,
      last: 0,
      shields: 3,
      streak: 0,
      weak: new Set(),
      retries: {},
      fixedPool: selectedIds?.slice() || null,
    };
    $("home").hidden = true;
    $("result").hidden = true;
    $("session").hidden = false;
    window.scrollTo(0, 0);
    $("arena").hidden = mode !== "game";
    $("flight-status").hidden = mode !== "game";
    $("game-study").hidden = mode !== "game";
    $("flight-coach").hidden = true;
    $("pause").hidden = mode !== "game";
    $("hint").hidden = mode === "game";
    $("reveal").hidden = mode === "game";
    $("check").hidden = mode === "game";
    $("meaning").hidden = mode === "game";
    $("letters").hidden = mode === "game";
    $("question-label").textContent =
      mode === "game" ? "GÕ CHÍNH XÁC ĐỂ BẮN" : "NGHĨA TIẾNG VIỆT";
    if (mode === "game") Guardian.start();
    nextQuestion();
  }
  const current = () => words[session.queue[session.cursor]];
  const normalized = (s) => s.toLowerCase().trim().replace(/\s+/g, " ");
  function slots(target, value) {
    return [...target].map((c, i) => {
      const el = document.createElement("span");
      el.className =
        "letter" +
        (!/[a-z]/i.test(c)
          ? " separator"
          : value[i]
            ? value[i] === c
              ? " correct"
              : " wrong"
            : "");
      el.textContent = !/[a-z]/i.test(c)
        ? c === " "
          ? "·"
          : c
        : value[i] || "_";
      return el;
    });
  }
  function draw() {
    const word = current().word.toLowerCase();
    const value = $("answer").value.toLowerCase();
    $("letters").replaceChildren(...slots(word, value));
    $("enemy-letters").replaceChildren(...slots(word, value));
    let matched = 0;
    while (matched < word.length && value[matched] === word[matched]) matched++;
    $("enemy-art").style.setProperty(
      "--target-progress",
      `${(matched / word.length) * 100}%`,
    );
  }
  function nextQuestion() {
    cancelAnimationFrame(frame);
    if (session.cursor >= session.queue.length) {
      if (session.mode === "daily") return finish(false);
      const ids =
        session.fixedPool ||
        words.map((_, i) => i).filter((i) => introduced(words[i]));
      let q =
        session.mode === "game"
          ? VocabularyPractice.queue(ids, words, store.records)
          : shuffle(ids);
      if (q[0] === session.queue.at(-1) && q.length > 1)
        [q[0], q[1]] = [q[1], q[0]];
      session.queue.push(...q);
    }
    Object.assign(session, {
      helped: false,
      mistake: false,
      resolved: false,
      paused: false,
      elapsed: 0,
      last: 0,
      coaching: false,
      failureRecorded: false,
      clockSecond: -1,
    });
    const w = current();
    $("flight-coach").hidden = true;
    $("arena").classList.remove("is-coaching", "is-danger");
    $("game-study").disabled = false;
    $("answer").removeAttribute("aria-invalid");
    $("answer").value = "";
    $("answer").disabled = false;
    $("check").disabled = false;
    $("feedback").textContent = "";
    $("context").textContent = "";
    $("next").hidden = true;
    $("hint").disabled = false;
    $("reveal").disabled = false;
    $("pause").textContent = "Tạm dừng · Alt+4";
    $("pause-overlay").hidden = true;
    $("meaning").textContent = w.meaning;
    $("enemy-meaning").textContent = w.meaning;
    $("length").textContent =
      `${w.word.replace(/[^a-z]/gi, "").length} chữ cái${w.word.includes(" ") ? " · khoảng trắng được hiển thị bằng dấu chấm" : ""}${w.word.includes("-") ? " · có dấu gạch nối" : ""}`;
    $("progress").textContent =
      `${session.mode === "daily" ? "Ôn hôm nay" : session.mode === "game" ? "Vệ binh" : "Vô hạn"} · ${session.completed} lượt · ${session.correct} đúng`;
    $("enemy").hidden = false;
    $("enemy").style.transform = "translateY(0px)";
    draw();
    $("answer").focus();
    if (session.mode === "game") {
      Guardian.question();
      $("g-ship-hint").disabled = !GuardianEquipment.ensure(store.guardian)
        .hintCharge;
      session.duration = VocabularyPractice.duration(
        $("speed").value,
        w.word,
        store.records[w.word],
        session.streak,
        Guardian.timeBonus(),
      );
      updateFlight();
      frame = requestAnimationFrame(tick);
    }
  }
  function record(success) {
    const w = current(),
      old = store.records[w.word] || { stage: 0, attempts: 0, due: 0 };
    const stage = success
      ? old.lastSuccessDay === date()
        ? Math.max(1, old.stage)
        : Math.min(6, old.stage + 1)
      : 0;
    const intervals = [1, 1, 3, 7, 14, 30, 60];
    store.records[w.word] = {
      ...old,
      learned: true,
      lastSuccessDay: success ? date() : old.lastSuccessDay,
      stage,
      attempts: old.attempts + 1,
      due: Date.now() + (success ? intervals[stage] * DAY : 10 * 60000),
    };
    save();
  }
  function resolve() {
    if (session.resolved) return;
    const clean = !session.helped && !session.mistake;
    session.resolved = true;
    session.completed++;
    if (clean) session.correct++;
    const wasDue = store.records[current().word]?.due <= Date.now();
    if (!session.failureRecorded) record(clean);
    if (!clean) session.weak.add(session.queue[session.cursor]);
    if (session.mode === "game") {
      session.streak = clean ? session.streak + 1 : 0;
      if (!clean)
        VocabularyPractice.retry(
          session.queue,
          session.cursor,
          session.retries,
        );
      flightEffect(clean ? "clear" : "learn");
    }
    if (session.mode === "game") Guardian.onWord(current().word, clean, wasDue);
    if (session.mode === "daily") {
      const id = session.queue[session.cursor];
      if (!store.daily.done.includes(id)) store.daily.done.push(id);
      save();
    }
    $("answer").disabled = true;
    $("check").disabled = true;
    $("hint").disabled = true;
    $("reveal").disabled = true;
    $("feedback").textContent = clean
      ? "Chính xác! Bạn đã tự nhớ được từ này."
      : "Đã xem lại. Nghỉ một chút; từ này sẽ đến hạn sau 10 phút.";
    $("context").textContent = current().context;
    $("next").hidden = false;
    cancelAnimationFrame(frame);
    if (session.mode === "game") {
      tone(720);
      session.cursor++;
      nextQuestion();
      return;
    }
    tone(720);
    $("next").focus();
  }
  function updateFlight() {
    if (!session || session.mode !== "game") return;
    const second = Math.max(
      0,
      Math.ceil((session.duration - session.elapsed) / 1000),
    );
    session.clockSecond = second;
    $("flight-leg").textContent =
      `CHẶNG ${String(Math.floor(session.completed / 12) + 1).padStart(2, "0")}`;
    $("flight-goal").textContent = `${session.completed % 12} / 12 mục tiêu`;
    const shields =
      "◆ ".repeat(session.shields) + "◇ ".repeat(3 - session.shields);
    if ($("flight-shields").textContent !== shields) {
      $("flight-shields").textContent = shields;
      $("flight-shields").setAttribute(
        "aria-label",
        `${session.shields} lá chắn còn lại`,
      );
    }
    FlightClock.paint(
      second,
      session.coaching ? "coaching" : session.paused ? "paused" : "running",
    );
    $("flight-timebar").value = Math.max(
      0,
      100 * (1 - session.elapsed / session.duration),
    );
    $("flight-pace").textContent = session.coaching
      ? "Không giới hạn thời gian"
      : store.records[current().word]?.stage === 0
        ? "Nhịp làm quen"
        : "Nhịp theo độ quen từ";
  }
  function studyWord(timedOut = false) {
    if (
      !session ||
      session.mode !== "game" ||
      session.resolved ||
      session.paused ||
      session.coaching
    )
      return;
    cancelAnimationFrame(frame);
    session.coaching = session.helped = true;
    session.streak = 0;
    session.weak.add(session.queue[session.cursor]);
    if (!session.failureRecorded) {
      record(false);
      session.failureRecorded = true;
    }
    Guardian.mistake();
    $("flight-coach").hidden = false;
    $("coach-word").textContent = `${current().word} — ${current().meaning}`;
    $("coach-context").textContent = current().context;
    $("arena").classList.remove("is-danger");
    $("arena").classList.add("is-coaching");
    $("enemy").style.transform = "translateY(0px)";
    $("game-study").disabled = true;
    $("g-ship-hint").disabled = true;
    $("feedback").textContent = timedOut
      ? `Còn ${session.shields} lá chắn. Mình học lại từ này rồi bay tiếp nhé.`
      : "Xem từ cũng là học. Lượt này không tăng combo, xu hay vé từ đúng.";
    updateFlight();
    $("answer").focus({ preventScroll: true });
  }
  function flightEffect(kind) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = $("flight-effects");
    if (layer.childElementCount > 24) return;
    const box = $("enemy").getBoundingClientRect(),
      arena = $("arena").getBoundingClientRect();
    const effect = document.createElement("span");
    effect.className = `flight-fx fx-${kind}`;
    effect.style.left = `${box.left - arena.left + box.width / 2}px`;
    effect.style.top = `${box.top - arena.top + Math.min(45, box.height / 2)}px`;
    effect.textContent = kind === "clear" ? "✦" : kind === "learn" ? "✓" : "·";
    layer.append(effect);
    effect.addEventListener("animationend", () => effect.remove(), {
      once: true,
    });
    setTimeout(() => effect.remove(), 1000);
  }
  $("game-study").onclick = () => studyWord();
  $("coach-listen").onclick = () => {
    if (!session?.coaching || session.paused) return;
    if (!("speechSynthesis" in window)) {
      $("feedback").textContent = "Trình duyệt này chưa hỗ trợ đọc từ.";
      return;
    }
    const utterance = new SpeechSynthesisUtterance(current().word);
    utterance.lang = "en-GB";
    utterance.rate = 0.8;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };
  function tick(now) {
    if (
      !session ||
      session.mode !== "game" ||
      session.resolved ||
      session.coaching
    )
      return;
    if (!session.paused) {
      if (session.last) session.elapsed += Math.min(now - session.last, 100);
      const ratio = session.elapsed / session.duration;
      const max =
        $("arena").querySelector(".danger").offsetTop -
        $("enemy").offsetTop -
        $("enemy").offsetHeight;
      $("enemy").style.transform =
        `translateY(${Math.max(0, max) * Math.min(1, ratio)}px)`;
      const second = Math.ceil((session.duration - session.elapsed) / 1000);
      if (second !== session.clockSecond) updateFlight();
      $("arena").classList.toggle("is-danger", ratio >= 0.78);
      if (ratio >= 1) {
        session.shields--;
        updateFlight();
        Guardian.mistake();
        if (!session.shields) {
          session.weak.add(session.queue[session.cursor]);
          record(false);
          return finish(true);
        }
        return studyWord(true);
      }
    }
    session.last = now;
    frame = requestAnimationFrame(tick);
  }
  function pause() {
    if (!session || session.resolved) return;
    session.paused = !session.paused;
    session.last = 0;
    $("pause-overlay").hidden = !session.paused;
    $("pause").textContent = session.paused
      ? "Tiếp tục · Alt+4"
      : "Tạm dừng · Alt+4";
    $("answer").disabled = session.paused;
    updateFlight();
    if (!session.paused) $("answer").focus();
  }
  function finish(lost) {
    if (!session) return;
    cancelAnimationFrame(frame);
    const s = session;
    const answer = s && current();
    $("session").hidden = true;
    $("home").hidden = true;
    $("result").hidden = false;
    $("result-title").textContent = lost
      ? "Về trạm nạp lại nào."
      : s.mode === "daily"
        ? "Hoàn thành hôm nay."
        : "Hẹn gặp lại.";
    $("result-copy").textContent =
      `${s.completed} lượt luyện · ${s.correct} lượt đúng không gợi ý.\n${lost ? `Từ vừa rơi: ${answer.word} — ${answer.meaning}\n${answer.context}` : "Tiến độ đã lưu. Từ cần hỗ trợ sẽ đến hạn sau 10 phút; từ tự nhớ đúng được hẹn từ ngày mai."}`;
    if (s.mode === "game") Guardian.finish();
    reviewIds = [...s.weak];
    $("weak-review").hidden = !reviewIds.length;
    $("weak-words").replaceChildren(
      ...reviewIds.map((id) => {
        const row = document.createElement("div"),
          word = document.createElement("strong"),
          meaning = document.createElement("span");
        word.textContent = words[id].word;
        meaning.textContent = words[id].meaning;
        row.append(word, meaning);
        return row;
      }),
    );
    session = null;
  }
  function tone(freq) {
    if (!sound) return;
    try {
      audio = audio || new AudioContext();
      audio.resume();
      const o = audio.createOscillator(),
        g = audio.createGain();
      o.connect(g);
      g.connect(audio.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.04, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.12);
      o.start();
      o.stop(audio.currentTime + 0.12);
    } catch {}
  }
  $("answer-form").onsubmit = (e) => {
    e.preventDefault();
    if (!session || session.resolved || session.paused) return;
    if (normalized($("answer").value) === current().word.toLowerCase())
      resolve();
    else {
      session.mistake = true;
      $("feedback").textContent =
        "Chưa đúng. Kiểm tra các chữ màu đỏ và thử lại.";
      tone(180);
    }
  };
  $("answer").oninput = () => {
    if (!session || session.resolved || session.paused) return;
    draw();
    if (session.mode === "game") {
      const value = $("answer").value.toLowerCase(),
        target = current().word.toLowerCase();
      if (!target.startsWith(value)) {
        session.mistake = true;
        Guardian.mistake();
        $("answer").setAttribute("aria-invalid", "true");
        $("feedback").textContent =
          "Sửa chữ màu đỏ; chưa cần vội. Chưa nhớ thì bấm Shift+Tab để học lại.";
      } else {
        $("answer").removeAttribute("aria-invalid");
        if (!session.coaching) $("feedback").textContent = "";
        flightEffect("shot");
        $("laser").classList.remove("fire");
        void $("laser").offsetWidth;
        $("laser").classList.add("fire");
        tone(440 + value.length * 25);
      }
      if (normalized(value) === target) resolve();
    }
  };
  function useShipHint() {
    if (
      !session ||
      session.mode !== "game" ||
      session.coaching ||
      session.paused ||
      session.resolved ||
      !Guardian.useHint()
    )
      return;
    $("hint").onclick();
    if (normalized($("answer").value) === current().word.toLowerCase())
      resolve();
  }
  $("g-ship-hint").onclick = useShipHint;
  $("hint").onclick = () => {
    session.helped = true;
    const w = current().word;
    let i = 0;
    while (i < w.length && $("answer").value.toLowerCase()[i] === w[i]) i++;
    $("answer").value = w.slice(0, i + 1);
    draw();
    $("answer").focus();
    $("feedback").textContent =
      "Đã mở một chữ. Hãy tự hoàn thành phần còn lại.";
  };
  $("reveal").onclick = () => {
    session.helped = true;
    $("answer").value = current().word;
    draw();
    resolve();
  };
  $("next").onclick = () => {
    session.cursor++;
    $("pause").disabled = false;
    nextQuestion();
  };
  $("daily").onclick = () => start("daily");
  $("infinite").onclick = () => start("infinite");
  $("game").onclick = () => {
    $("pause").disabled = false;
    start("game");
  };
  $("pause").onclick = pause;
  $("quit").onclick = () => finish(false);
  $("back").onclick = home;
  $("review-weak").onclick = () => start("infinite", reviewIds);
  document.addEventListener("visibilitychange", () => {
    if (
      document.hidden &&
      session?.mode === "game" &&
      !session.paused &&
      !session.resolved
    )
      pause();
  });
  $("sound").onclick = () => {
    sound = !sound;
    $("sound").textContent = `Âm thanh: ${sound ? "bật" : "tắt"}`;
    $("sound").setAttribute("aria-pressed", String(sound));
    tone(600);
  };
  $("export").onclick = () => {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(store, null, 2)], {
          type: "application/json",
        }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = `letsstudy-vocabulary-${date()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  $("import").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2000000) throw Error();
      const data = JSON.parse(await file.text());
      if (!valid(data)) throw Error();
      if (!confirm("Thay tiến độ từ vựng hiện tại bằng bản sao này?")) return;
      store = data;
      save();
      home();
      $("notice").textContent = "Đã khôi phục tiến độ.";
    } catch {
      $("notice").textContent =
        "Bản sao không hợp lệ. Tiến độ hiện tại được giữ nguyên.";
    } finally {
      e.target.value = "";
    }
  };
  function activate(id) {
    const el = $(id);
    if (!el || el.disabled || !el.getClientRects().length) return false;
    el.click();
    return true;
  }
  document.addEventListener("keydown", (e) => {
    if ($("guardian-dialog").open) return;
    if (
      e.defaultPrevented ||
      e.isComposing ||
      e.repeat ||
      e.ctrlKey ||
      e.metaKey
    )
      return;
    // Let native Enter activate the button reached with Tab.
    if (e.key === "Enter" && e.target.closest("button")) return;
    const shortcut = e.altKey ? "Alt+" + e.key : e.key;
    if (e.altKey && !["Alt+1", "Alt+2", "Alt+3", "Alt+4"].includes(shortcut))
      return;
    let action = null;
    if (lesson) {
      if (shortcut === "Alt+3") action = () => activate("pronounce");
      else if (e.key === "Escape") action = () => activate("leave-learning");
      else if (
        !e.altKey &&
        /^[1-4]$/.test(e.key) &&
        !e.target.matches("input,textarea,select")
      )
        action = () => {
          const b = $("learning-choices").children[Number(e.key) - 1];
          if (b && !b.disabled) b.click();
        };
      else if (e.key === "Enter" && !$("learning-next").hidden)
        action = () => activate("learning-next");
    } else if (session) {
      if (
        e.key === "Tab" &&
        e.shiftKey &&
        !e.altKey &&
        e.target === $("answer") &&
        session.mode === "game" &&
        !session.paused &&
        !session.resolved &&
        !session.coaching
      )
        action = () => studyWord();
      else if (
        e.key === "Tab" &&
        !e.shiftKey &&
        !e.altKey &&
        e.target === $("answer") &&
        session.mode === "game" &&
        !session.paused &&
        !session.resolved &&
        !session.coaching &&
        GuardianEquipment.ensure(store.guardian).hintCharge
      )
        action = useShipHint;
      else if (e.key === "Escape") action = () => activate("quit");
      else if (shortcut === "Alt+4" && session.mode === "game")
        action = () => activate("pause");
      else if (shortcut === "Alt+1")
        action = session.mode === "game" ? useShipHint : () => activate("hint");
      else if (shortcut === "Alt+2")
        action =
          session.mode === "game"
            ? () => studyWord()
            : () => activate("reveal");
      else if (shortcut === "Alt+3" && session.coaching)
        action = () => activate("coach-listen");
      else if (e.key === "Enter" && session.resolved)
        action = () => activate("next");
      else if (e.key === "Enter" && !session.paused)
        action = () => $("answer-form").requestSubmit();
    } else if (!$("result").hidden && e.key === "Enter")
      action = () => activate("back");
    if (action) {
      e.preventDefault();
      action();
    }
  });
  Guardian.mount({ getStore: () => store, save });
  setInterval(() => {
    if (!$("home").hidden) home();
  }, 30000);
  home();
})();
