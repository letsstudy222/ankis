"use strict";
(() => {
  const words = window.VOCABULARY,
    $ = (id) => document.getElementById(id),
    KEY = "letsstudy-vocabulary-v1",
    DAY = 86400000;
  const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
  const date = () => new Date().toLocaleDateString("sv-SE");
  const activityKinds = {newWord:"Từ mới",review:"Lượt ôn từ",meteor:"Lượt Vệ binh",flash:"Lượt đánh giá thẻ",quiz:"Lượt kiểm tra gõ",sentence:"Lượt kiểm tra câu",match:"Ván ghép cặp",scramble:"Ván giải mã"};
  const goalOptions=[15,25,35,50];
  const empty = () => ({ version: 1, records: {}, daily: null });
  let store, recoveryRaw = null, storageBlocked = false, storageError = "";
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) {
      try { store = JSON.parse(raw); } catch {}
      if (!valid(store)) {
        recoveryRaw = raw;
        storageBlocked = true;
        storageError = "Không đọc được dữ liệu cũ. Bản gốc được giữ nguyên; phiên này chỉ lưu tạm trong bộ nhớ. Hãy vào Cài đặt để tải dữ liệu gốc hoặc nhập bản sao hợp lệ.";
      }
    }
  } catch {
    storageError = "Không truy cập được bộ nhớ trình duyệt. Hãy xuất bản sao trước khi đóng trang.";
  }
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
      (!x.library || VocabularyLibraryModel.valid(x.library, words)) &&
      x.version === 1 &&
      (x.weekGoal===undefined || goalOptions.includes(x.weekGoal)) &&
      (x.activity===undefined || (x.activity && typeof x.activity==="object" && !Array.isArray(x.activity) && Object.keys(x.activity).length<=90 && Object.entries(x.activity).every(([day,v])=>/^\d{4}-\d{2}-\d{2}$/.test(day)&&v&&typeof v==="object"&&!Array.isArray(v)&&Object.entries(v).every(([k,n])=>Object.hasOwn(activityKinds,k)&&Number.isSafeInteger(n)&&n>=0)))) &&
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
          VocabularyPractice.validMemory(r.arcade) &&
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
  function renderStorageWarning() {
    const warning = $("wl-storage-warning");
    warning.hidden = !storageError;
    warning.textContent = storageError;
    $("wl-recovery-export").hidden = recoveryRaw === null;
  }
  function save() {
    if (!storageBlocked) {
      try {
        localStorage.setItem(KEY, JSON.stringify(store));
        storageError = "";
      } catch {
        storageError = "Không lưu được tiến độ vào trình duyệt. Hãy xuất bản sao trước khi đóng trang.";
      }
    }
    renderStorageWarning();
    return !storageError;
  }
  function logActivity(kind, persist=true) {
    if (!Object.hasOwn(activityKinds,kind)) return;
    const today=date(), days=store.activity ||= {};
    const row=days[today] ||= {};
    row[kind]=Math.min(Number.MAX_SAFE_INTEGER,(row[kind]||0)+1);
    const cutoff=new Date();cutoff.setDate(cutoff.getDate()-89);
    const key=cutoff.toLocaleDateString("sv-SE");
    Object.keys(days).sort().forEach(d=>{if(d<key || d>today)delete days[d]});
    while(Object.keys(days).length>90)delete days[Object.keys(days).sort()[0]];
    if(persist){save();renderActivity();}
  }
  globalThis.WordLabActivity = logActivity;
  function renderActivity() {
    const days=store.activity||{}, today=date();
    const total=row=>Object.values(row||{}).reduce((a,b)=>a+b,0);
    const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
    const recent=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const key=d.toLocaleDateString("sv-SE");return {key,label:`${d.getDate()}/${d.getMonth()+1}`,n:total(days[key])}});
    const root=$("wl-activity-home"), chart=make("div","wl-activity-week"), max=Math.max(1,...recent.map(d=>d.n));
    for(const d of recent){const item=make("div","wl-activity-day");item.append(make("strong","",fmt(d.n)));const track=make("div","wl-activity-track"),bar=make("span");bar.style.height=`${100*d.n/max}%`;track.append(bar);item.append(track,make("small","",d.label));chart.append(item);}
    root.replaceChildren(make("p","wl-stat-note",Object.keys(days).length?`${recent.filter(d=>d.n>0).length}/7 ngày có hoạt động Word Lab · ${fmt(total(days[today]))} thao tác được ghi nhận hôm nay.`:"Nhật ký bắt đầu từ phiên bản 2.7. Hoàn thành một lượt học để thấy hoạt động tại đây."),chart);
    const range=Number($("wl-activity-range").value)||7, since=new Date();since.setDate(since.getDate()-range+1);const first=since.toLocaleDateString("sv-SE");
    const entries=Object.entries(days).filter(([k])=>k>=first&&k<=today).sort(([a],[b])=>b.localeCompare(a));
    const detail=$("wl-activity-detail"); detail.replaceChildren(make("p","wl-stat-note","Chỉ ghi nhận thao tác từ bản 2.7; số lượt ở các chế độ không tương đương số từ thuộc. Ankis có nhật ký riêng trong mục Thống kê."));
    if(!entries.length)detail.append(make("p","wl-empty","Chưa có hoạt động trong khoảng thời gian này."));
    for(const [day,row] of entries){const line=make("div","wl-activity-row"),body=make("div","wl-activity-tags");for(const [k,n] of Object.entries(row))if(n)body.append(make("span","",`${activityKinds[k]}: ${fmt(n)}`));line.append(make("strong","",day.split("-").reverse().join("/")),body);detail.append(line);}
  }
  $("wl-activity-range").onchange=renderActivity;
  $("wl-week-target").onchange=()=>{store.weekGoal=Number($("wl-week-target").value);save();home();};
  function renderUpcoming() {
    const now=Date.now(), start=new Date();start.setHours(0,0,0,0);const edges=Array.from({length:8},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i+1);return +d});
    const counts=[0,0,0,0,0];for(const w of words){if(!introduced(w))continue;const d=store.records[w.word].due;const i=d<=now?0:d<edges[0]?1:d<edges[1]?2:d<edges[7]?3:4;counts[i]++;}
    $("wl-upcoming").innerHTML=["Đã đến hạn","Còn lại hôm nay","Ngày mai","6 ngày tiếp theo","Sau đó"].map((label,i)=>`<div><strong>${counts[i]||0}</strong><small>${label}</small></div>`).join("");
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
    $("wl-learning-progress").max = lesson.queue.length;
    $("wl-learning-progress").value = lesson.cursor;
    document.querySelectorAll(".wl-lesson-stages span").forEach((node, i) => {
      node.classList.toggle("is-done", i < task.step);
      if (i === task.step) node.setAttribute("aria-current", "step");
      else node.removeAttribute("aria-current");
    });
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
            button.classList.add("wl-choice-wrong");
            button.disabled = true;
            return;
          }
          button.classList.add("wl-choice-correct");
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
    if(step===2)logActivity("newWord",false);
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
  function progressStats() {
    const now = Date.now(), counts = Array(7).fill(0);
    let due = 0, partial = 0, attempts = 0, undated = 0;
    const familiar = words.filter(introduced);
    const recent = Array.from({length:7}, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i));
      return {key:d.toLocaleDateString("sv-SE"), label:`${d.getDate()}/${d.getMonth()+1}`, count:0};
    });
    for (const w of words) {
      const r = store.records[w.word];
      if (!r) continue;
      attempts += r.attempts;
      if (!introduced(w)) { if (r.learningStep > 0) partial++; continue; }
      counts[r.stage]++;
      if (r.due <= now) due++;
      if (typeof r.introducedOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.introducedOn)) undated++;
      const day = recent.find(d => d.key === r.introducedOn);
      if (day) day.count++;
    }
    const n = words.length, seen = familiar.length, stable = counts.slice(3).reduce((a,b)=>a+b,0);
    const fmt = n => n.toLocaleString("vi-VN");
    const metric = (value,label) => `<div><strong>${value}</strong><small>${label}</small></div>`;
    $("wl-stage-bar").innerHTML = [n-seen, seen-stable, stable].map((v,i)=>`<span class="wl-segment-${i}" style="width:${100*v/n}%"></span>`).join("");
    $("wl-progress-metrics").innerHTML = metric(due,"Từ đến hạn (tất cả)") + metric(partial,"Đang làm quen dở") + metric(fmt(attempts),"Lượt tự nhớ đã ghi nhận");
    const labels = ["Cần củng cố · 10 phút", "1 ngày", "3 ngày", "7 ngày", "14 ngày", "30 ngày", "60 ngày"];
    $("wl-stage-detail").innerHTML = counts.map((v,i)=>`<div class="wl-stage-row"><span>${labels[i]}</span><progress aria-label="${labels[i]}" max="${Math.max(1,seen)}" value="${v}"></progress><strong>${v}</strong></div>`).join("");
    const max = Math.max(1,...recent.map(d=>d.count));
    $("wl-week-chart").innerHTML = recent.map(d=>`<div class="wl-day"><strong>${d.count}</strong><div class="wl-day-track"><span style="height:${100*d.count/max}%"></span></div><small>${d.label}</small></div>`).join("");
    $("wl-week-note").textContent = `${recent.reduce((a,d)=>a+d.count,0)} từ có ngày làm quen trong 7 ngày. ${undated ? `${undated} từ cũ thiếu ngày, không đưa vào biểu đồ.` : "Không suy ra lịch sử ôn tập từ biểu đồ này."}`;
    const lib = Object.values(store.library?.words || {});
    const tests = lib.reduce((a,w)=>a+w.tests,0), correct = lib.reduce((a,w)=>a+w.correct,0);
    $("wl-library-metrics").innerHTML = metric(lib.filter(w=>w.reviews>0).length,"Từ đã tự đánh giá") + metric(fmt(tests),"Lượt kiểm tra gõ từ") + metric(tests ? `${Math.round(100*correct/tests)}%` : "—","Tỷ lệ gõ đúng");
    return due;
  }
  function streakDays() {
    const logs = new Set();
    for (const record of Object.values(store.records || {})) {
      if (record?.introducedOn) logs.add(record.introducedOn);
    }
    if (store.daily?.done?.length) logs.add(date());
    let streak = 0;
    while (true) {
      const d = new Date();
      d.setDate(d.getDate() - streak);
      const key = d.toLocaleDateString("sv-SE");
      if (!logs.has(key)) break;
      streak++;
    }
    return streak;
  }
  function phaseInfo(seen, stable) {
    if (seen < 24)
      return {
        title: "Giai đoạn 1 · Khởi động nền từ vựng",
        copy: "Ưu tiên đều đặn làm quen từng nhóm nhỏ 5 từ để hình thành nền ban đầu.",
        focus:
          "Tích lũy đủ từ đã gặp để các khu luyện và trò chơi bắt đầu thực sự hữu ích.",
      };
    if (seen < 80)
      return {
        title: "Giai đoạn 2 · Xây nền ổn định",
        copy: "Bạn đã có lõi từ đầu tiên. Trọng tâm lúc này là ôn đúng lịch và tránh học dồn.",
        focus:
          "Giữ nhịp học ngắn nhưng đều, để từ chuyển dần từ quen mặt sang tự nhớ được.",
      };
    if (seen < 160)
      return {
        title: "Giai đoạn 3 · Củng cố trí nhớ",
        copy: "Nền từ đã đủ rộng. Hãy đưa nhiều từ hơn sang các mốc ôn 7–14 ngày.",
        focus: "Ưu tiên chất lượng ghi nhớ: ít quên hơn, phản xạ nhanh hơn.",
      };
    return {
      title: "Giai đoạn 4 · Phản xạ và vận dụng",
      copy: "Bạn đã có nền đủ tốt để đẩy mạnh phản xạ, viết câu và tự quản lý bằng thẻ nhớ.",
      focus:
        "Luân phiên game, luyện câu, thư viện và Ankis để biến vốn từ thành kỹ năng dùng thật.",
    };
  }
  function renderHomeDashboard({ seen, stable, remaining, due, fresh, newToday, attempts }) {
    if (!$("wl-focus-title")) return;
    const weekStart=new Date();weekStart.setDate(weekStart.getDate()-6);const weekKey=weekStart.toLocaleDateString("sv-SE");
    const weekly=Object.values(store.records).filter(r=>r.learned&&typeof r.introducedOn==="string"&&r.introducedOn>=weekKey&&r.introducedOn<=date()).length;
    const phase = phaseInfo(seen, stable);
    $("wl-focus-title").textContent = phase.title;
    $("wl-focus-copy").textContent = remaining.length
      ? `${remaining.length} từ đang chờ ôn trong lượt hôm nay. ${phase.focus}`
      : due
        ? `${due} từ đã đến hạn ôn. ${phase.focus}`
        : fresh
          ? `${fresh} từ vẫn chưa làm quen. ${phase.focus}`
          : phase.copy;
    $("wl-focus-metrics").innerHTML = [
      [fmt(seen), "Đã làm quen"],
      [fmt(stable), "Mốc ôn ≥ 7 ngày"],
      [fmt(remaining.length), "Ôn trong lượt"],
      [fmt(weekly), "Từ mới trong 7 ngày"],
    ]
      .map(
        ([v, l]) =>
          `<div><strong>${v}</strong><small>${l}</small></div>`,
      )
      .join("");
    const goal=store.weekGoal||25;
    $("wl-week-goal").textContent=`${weekly}/${goal} từ mới trong 7 ngày · mục tiêu cá nhân`;
    $("wl-week-goal-bar").max=goal;$("wl-week-goal-bar").value=Math.min(weekly,goal);$("wl-week-goal-bar").setAttribute("aria-label",`Mục tiêu ${goal} từ mới trong 7 ngày`);
    $("wl-week-target").value=String(goal);
    $("wl-focus-primary").onclick = () => {document.querySelector('[data-wl-nav="learn"]').click();$("route-start").click();};
    $("wl-focus-secondary").onclick = () =>
      document.querySelector('[data-wl-nav="ankis"]')?.click();

    const checklist = [
      {
        done: newToday >= 5 || fresh === 0,
        title: "Làm quen một nhóm nhỏ",
        copy:
          newToday >= 5
            ? "Bạn đã chạm mốc 5 từ mới hôm nay."
            : "Mục tiêu mặc định: 5 từ mới / lượt để tránh quá tải.",
      },
      {
        done: due === 0,
        title: "Xử lý lượt ôn hôm nay",
        copy: remaining.length
          ? `Còn ${remaining.length} từ chờ trong lượt ôn.`
          : "Không có từ đến hạn trong Word Lab.",
      },
    ];
    $("wl-checklist").innerHTML = checklist
      .map(
        (item) =>
          `<div class="wl-check-item ${item.done ? "is-done" : "is-open"}"><span>${item.done ? "✓" : "•"}</span><div><strong>${item.title}</strong><small>${item.copy}</small></div></div>`,
      )
      .join("");
    $("wl-checklist-badge").textContent = `${checklist.filter((item) => item.done).length}/${checklist.length} gợi ý đã đạt`;

    const priorities = [
      remaining.length
        ? ["Ôn trước", `${remaining.length} từ trong lượt hôm nay nên làm trước khi học thêm.`]
        : due
          ? [
              "Dọn hàng chờ",
              `${due} từ đến hạn trong toàn hệ thống; mở Ôn hôm nay để xử lý theo nhịp.`,
            ]
          : [
              "Giữ nhịp",
              "Hôm nay chưa có hàng chờ gấp. Bạn có thể học thêm hoặc luyện nhẹ.",
            ],
      fresh
        ? ["Mở rộng vốn từ", `${fresh} từ vẫn chưa làm quen — đủ để tiếp tục nhiều phiên ngắn.`]
        : [
            "Chất lượng hơn số lượng",
            "Bạn đã chạm hết từ hiện có; tập trung ôn và phản xạ.",
          ],
      [
        "Dùng thư viện có chủ đích",
        "Khi muốn học theo cụm nhỏ 12–24 từ, chuyển sang Thư viện & flashcard.",
      ],
      [
        "Ankis cho tự quản lý",
        "Dùng Ankis khi muốn tự tạo deck lớn hoặc ôn theo lịch thẻ nhớ riêng.",
      ],
    ];
    $("wl-priority-list").innerHTML = priorities
      .map(
        ([t, c]) =>
          `<div class="wl-priority-item"><strong>${t}</strong><small>${c}</small></div>`,
      )
      .join("");

    const guardian = store.guardian || {};
    const ankis=window.WordLabAnkis?.peek();
    $("wl-system-grid").innerHTML = [
      ["Word Lab", `${fmt(seen)}/${fmt(words.length)} từ đã làm quen`],
      ["Tiến độ", `${fmt(attempts)} lượt tự nhớ đã được lưu`],
      ["Trạm Sao", `${fmt(guardian.coins || 0)} xu · linh thú học cùng bạn`],
      ["Ankis", ankis?`${fmt(ankis.cards)} thẻ · ${fmt(ankis.due)} đang học / đến hạn`:"Mở bộ thẻ và lịch ôn riêng"],
    ]
      .map(
        ([t, c]) =>
          `<div class="wl-system-item"><strong>${t}</strong><small>${c}</small></div>`,
      )
      .join("");

    const roadmap = [
      { limit: 24, title: "Khởi động", copy: "Làm quen đều để mở nền cơ bản." },
      { limit: 80, title: "Xây nền", copy: "Giữ nhịp ôn mỗi ngày, tránh quên sớm." },
      { limit: 160, title: "Củng cố", copy: "Đẩy nhiều từ sang các mốc 7–14 ngày." },
      {
        limit: words.length,
        title: "Vận dụng",
        copy: "Tăng phản xạ, viết câu và dùng thẻ nhớ linh hoạt.",
      },
    ];
    $("wl-roadmap").innerHTML = roadmap
      .map((item, index) => {
        const complete = seen >= item.limit;
        const current = !complete && (index === 0 || seen >= roadmap[index - 1].limit);
        return `<article class="wl-roadmap-card ${complete ? "is-complete" : current ? "is-current" : ""}"><span>${complete ? "✓" : String(index + 1).padStart(2, "0")}</span><div><h3>${item.title}</h3><p>${item.copy}</p><small>${index === roadmap.length - 1 ? `${fmt(words.length)} từ` : `Tới ${fmt(item.limit)} từ`}</small></div></article>`;
      })
      .join("");

    $("wl-module-grid").innerHTML = [
      ["Học tập", "Làm quen từ mới, ôn đúng lịch và luyện không đồng hồ."],
      ["Thư viện", "Ôn theo bộ nhỏ, flashcard và gõ từ có chủ đích."],
      ["Luyện câu", "Đưa từ vào câu Việt → Anh để tăng khả năng dùng thật."],
      ["Trò chơi", "Phòng tuyến thiên thạch để luyện phản xạ chính tả."],
      ["Trạm Sao", "Gamification, phần thưởng và linh thú đồng hành."],
      ["Ankis", "Ôn theo deck độc lập trong cùng giao diện tổng thể."],
    ]
      .map(
        ([t, c],i) =>
          `<button type="button" class="wl-module-item" data-module-nav="${["learn","library","sentence","game","pet","ankis"][i]}"><strong>${t}</strong><small>${c}</small></button>`,
      )
      .join("");

    $("wl-rhythm-list").innerHTML = [
      "Mở đầu bằng 1 nhóm 5 từ mới hoặc ôn hàng chờ trước.",
      "Xử lý Ôn hôm nay để giảm quên sớm.",
      "Nếu còn thời gian, chọn thêm 1 khu: Thư viện, Luyện câu hoặc Trò chơi.",
      "Cuối ngày, dùng Ankis cho các deck riêng hoặc chủ đề chuyên sâu.",
    ]
      .map((text) => `<li>${text}</li>`)
      .join("");
  }
  function renderPanelSnapshots({ seen, stable, remaining, due, fresh }) {
    if ($("wl-learn-snapshot")) {
      $("wl-learn-snapshot").innerHTML = [
        [fmt(fresh), "từ chờ làm quen"],
        [fmt(remaining.length), "từ trong lượt ôn"],
        [fmt(stable), "từ đã khá ổn định"],
      ]
        .map(
          ([v, l]) => `<div><strong>${v}</strong><small>${l}</small></div>`,
        )
        .join("");
    }
    if ($("wl-game-snapshot")) {
      $("wl-game-snapshot").innerHTML = [
        [fmt(seen), "từ đủ điều kiện vào game"],
        [due ? fmt(due) : "0", "từ đến hạn hôm nay"],
        [stable ? fmt(stable) : "0", "từ đã qua mốc 7 ngày"],
      ]
        .map(
          ([v, l]) => `<div><strong>${v}</strong><small>${l}</small></div>`,
        )
        .join("");
    }
    if ($("wl-ankis-summary")) {
      $("wl-ankis-summary").innerHTML = [
        [
          "Dùng khi nào?",
          "Khi bạn muốn tự tạo deck, học theo chủ đề dài hơn hoặc tách hẳn khỏi luồng Word Lab.",
        ],
        [
          "Điểm khác",
          "Tiến độ Ankis lưu riêng, không trộn với lịch ôn Word Lab — phù hợp cho ôn độc lập.",
        ],
        [
          "Cách dùng hợp lý",
          "Dùng Word Lab để xây nền và phản xạ; dùng Ankis để tự quản lý các bộ thẻ chuyên sâu.",
        ],
      ]
        .map(
          ([t, c]) => `<article><strong>${t}</strong><small>${c}</small></article>`,
        )
        .join("");
    }
  }

  function home() {
    cancelAnimationFrame(frame);
    Guardian.clear();
    session = null;
    $("learning").hidden = true;
    $("library").hidden = true;
    Guardian.renderHome();
    plan();
    $("home").hidden = false;
    $("session").hidden = true;
    $("result").hidden = true;
    const remaining = store.daily.ids.filter(
      (i) => !store.daily.done.includes(i),
    );
    const seen = words.filter(introduced).length;
    const learned = words.filter(w => introduced(w) && store.records[w.word].stage >= 3).length;
    const attempts = Object.values(store.records).reduce((sum, record) => sum + (record?.attempts || 0), 0);
    $("stats").innerHTML =
      `<div><strong>${words.length}</strong><small>Tổng số từ</small></div><div><strong>${seen}</strong><small>Đã làm quen</small></div><div><strong>${remaining.length}</strong><small>Ôn trong lượt</small></div>`;
    $("wl-vocab-progress").max = words.length;
    $("wl-vocab-progress").value = seen;
    $("wl-progress-percent").textContent = `${Math.round(100 * seen / words.length)}%`;
    $("wl-progress-copy").textContent = `${seen}/${words.length} từ đã làm quen. ${learned} từ ở mốc ôn ≥ 7 ngày.`;
    $("wl-progress-breakdown").textContent = `${words.length - seen} từ chưa làm quen · ${seen - learned} từ đang củng cố · ${learned} từ ở mốc ôn ≥ 7 ngày`;
    const due = progressStats();
    const fresh = words.filter((w) => !introduced(w)).length;
    const newToday = Object.values(store.records).filter(
      (record) => record.learned && record.introducedOn === date(),
    ).length;
    renderHomeDashboard({ seen, stable: learned, remaining, due, fresh, newToday, attempts });
    renderPanelSnapshots({ seen, stable: learned, remaining, due, fresh });
    renderUpcoming();renderActivity();
    $("daily-description").textContent =
      `${due} từ đến hạn; ${remaining.length} từ trong lượt này (tối đa 20). Chỉ ôn tự nhớ sau khi làm quen.`;
    $("daily").disabled = !remaining.length;
    $("daily").textContent = remaining.length
      ? "Bắt đầu hôm nay →"
      : "Chưa có từ đến hạn";
    $("learn-description").textContent =
      `${fresh} từ chờ làm quen. Mỗi lượt chỉ 5 từ: xem → chọn nghĩa → gõ theo mẫu. Không chấm điểm.`;
    $("learn").disabled = !fresh;
    $("infinite").disabled = !seen;
    $("game").disabled = !seen;
    $("wl-match-start").disabled=new Set(words.filter(introduced).map(w=>w.meaning)).size<4;
    $("wl-scramble-start").disabled=!words.some(w=>introduced(w)&&/^[a-z]{3,}$/i.test(w.word));
    $("wl-mini-status").textContent=seen<4?"Làm quen ít nhất 4 từ để mở ghép cặp. Giải mã cần từ đơn có ít nhất 3 chữ.":"Chọn thử thách từ những từ bạn đã làm quen.";
    if ($("game-training")) $("game-training").disabled = !seen;
    if ($("game-rush")) $("game-rush").disabled = !seen;
    const lightPractice = newToday >= 5;
    const recommendation = remaining.length
      ? "daily"
      : lightPractice
        ? "infinite"
        : fresh
          ? "learn"
          : "infinite";
    $("route-title").textContent = remaining.length
      ? `${remaining.length} từ đang chờ bạn nhớ lại`
      : lightPractice
        ? "Đã làm quen đủ một nhóm hôm nay"
        : fresh
          ? "Một nhóm nhỏ, năm từ mới"
          : "Củng cố những từ đã học";
    $("route-copy").textContent = remaining.length
      ? "Ôn từ đến hạn trước. Vài phút cũng là một bước tiến."
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
    $("wl-review-panel").hidden = mode === "game";
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
    const hp=$("meteor-hp");
    const lettersCount=word.replace(/[^a-z]/gi, "").length;
    const matchedCount=word.slice(0,matched).replace(/[^a-z]/gi, "").length;
    if(hp){hp.max=Math.max(1,lettersCount);hp.value=lettersCount-matchedCount;}
    $("enemy-art").style.setProperty(
      "--target-progress",
      `${(matched / word.length) * 100}%`,
    );
  }
  function renderReview() {
    if (session.mode === "game") return;
    $("wl-review-count").textContent = session.completed;
    $("wl-review-correct").textContent = session.correct;
    $("wl-review-helped").textContent = session.completed - session.correct;
    $("wl-review-progress").hidden = session.mode !== "daily";
    if (session.mode === "daily") {
      $("wl-review-progress").max = session.queue.length;
      $("wl-review-progress").value = session.completed;
    }
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
      errorEpisodes: 0,
      invalidPrefix: false,
      memoryRecorded: false,
      firedLetters: 0,
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
    renderReview();
    $("enemy").classList.remove("meteor-destroyed");
    $("enemy").style.setProperty("--label-shift","0px");
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
  function rememberArcade(failed) {
    if (session.mode !== "game" || session.memoryRecorded) return 0;
    session.memoryRecorded = true;
    return VocabularyPractice.observe(
      store.records[current().word],
      current().word,
      session.elapsed,
      session.errorEpisodes,
      failed,
    );
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
    logActivity(session.mode==="game"?"meteor":"review",false);
    save();
  }
  function resolve() {
    if (session.resolved) return;
    // In the arcade the final answer matters; corrected keystrokes are normal.
    const clean =
      !session.helped && (session.mode === "game" || !session.mistake);
    session.resolved = true;
    session.completed++;
    if (clean) session.correct++;
    renderReview();
    const wasDue = store.records[current().word]?.due <= Date.now();
    const difficulty = rememberArcade(!clean);
    if (!session.failureRecorded) record(clean);
    if (!clean) session.weak.add(session.queue[session.cursor]);
    if (session.mode === "game") {
      session.streak = clean ? session.streak + 1 : 0;
      if (!clean || difficulty >= 0.35)
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
    $("next").hidden = session.mode === "game";
    cancelAnimationFrame(frame);
    if (session.mode === "game") {
      tone(720);
      $("enemy").classList.add("meteor-destroyed");
      const finished=session;
      setTimeout(()=>{if(session===finished&&session.resolved){session.cursor++;nextQuestion();}},320);
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
      rememberArcade(true);
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
    $("enemy").style.setProperty("--label-shift","0px");
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
    if(kind==="shot"){
      const a=$("arena").getBoundingClientRect(),t=$("enemy-art").getBoundingClientRect(),ship=$("guardian-ship").getBoundingClientRect();
      const shot=document.createElement("span");shot.className="meteor-projectile";shot.style.left=`${ship.left+ship.width/2-a.left}px`;shot.style.top=`${ship.top-a.top}px`;shot.style.setProperty("--shot-dx",`${t.left+t.width/2-ship.left-ship.width/2}px`);shot.style.setProperty("--shot-dy",`${t.top+t.height/2-ship.top}px`);layer.append(shot);setTimeout(()=>shot.remove(),250);return;
    }
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
        $("guardian-ship").offsetTop -
        $("enemy").offsetTop -
        $("enemy-art").offsetTop - $("enemy-art").offsetHeight;
      $("enemy").style.transform =
        `translateY(${Math.max(0, max) * Math.min(1, ratio)}px)`;
      const second = Math.ceil((session.duration - session.elapsed) / 1000);
      if (second !== session.clockSecond) updateFlight();
      $("arena").classList.toggle("is-danger", ratio >= 0.78);
      $("enemy").style.setProperty("--label-shift",`${-Math.max(0,Math.min(1,(ratio-.62)/.18))*($("enemy-art").offsetHeight+$("enemy-meaning").offsetHeight+$("enemy-letters").offsetHeight+15)}px`);
      if (ratio >= 1) {
        session.shields--;
        updateFlight();
        Guardian.mistake();
        if (!session.shields) {
          session.weak.add(session.queue[session.cursor]);
          rememberArcade(true);
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
        ? (s.completed === s.queue.length ? "Hoàn thành lượt ôn." : "Đã lưu phần ôn vừa học.")
        : "Hẹn gặp lại.";
    $("wl-result-stats").hidden = s.mode === "game";
    $("wl-result-stats").innerHTML = `<div><strong>${s.completed}</strong><span>Lượt luyện</span></div><div><strong>${s.correct}</strong><span>Tự nhớ đúng</span></div><div><strong>${s.completed - s.correct}</strong><span>Cần hỗ trợ</span></div>`;
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
        if (!session.invalidPrefix && !session.coaching)
          session.errorEpisodes++;
        session.invalidPrefix = true;
        session.mistake = true;
        $("answer").setAttribute("aria-invalid", "true");
        $("feedback").textContent =
          "Cứ sửa chữ màu đỏ. Hoàn thành đúng trước khi hết giờ vẫn tính lượt vé.";
      } else {
        session.invalidPrefix = false;
        $("answer").removeAttribute("aria-invalid");
        if (!session.coaching) $("feedback").textContent = "";
        const hits=value.replace(/[^a-z]/gi, "").length;
        if(hits>session.firedLetters&&!session.coaching){
          session.firedLetters=hits;
          flightEffect("shot");
          const ship=$("guardian-ship").getBoundingClientRect(), targetBox=$("enemy-art").getBoundingClientRect();
          $("laser").style.height=`${Math.max(8,ship.top-targetBox.bottom+targetBox.height/2)}px`;
          $("laser").classList.remove("fire");
          void $("laser").offsetWidth;
          $("laser").classList.add("fire");
          tone(440 + hits * 25);
        }
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
  $("wl-module-grid").addEventListener("click",e=>{const btn=e.target.closest("[data-module-nav]");if(btn)document.querySelector(`[data-wl-nav="${btn.dataset.moduleNav}"]`)?.click()});
  const mini=$("wl-mini-game");
  const miniButton=(text,fn)=>{const b=document.createElement("button");b.type="button";b.textContent=text;b.onclick=fn;return b;};
  function miniHeading(title,copy){mini.hidden=false;mini.replaceChildren();const h=document.createElement("h3");h.textContent=title;const p=document.createElement("p");p.textContent=copy;mini.append(h,p,miniButton("Đóng trò chơi",()=>{mini.hidden=true;mini.replaceChildren();}));}
  $("wl-match-start").onclick=()=>{
    const pool=shuffle(words.filter(introduced));const used=new Set();const chosen=pool.filter(w=>{if(used.has(w.meaning))return false;used.add(w.meaning);return true}).slice(0,4);if(chosen.length<4)return;
    miniHeading("Ghép cặp từ","Chọn một từ tiếng Anh, sau đó chọn nghĩa tương ứng.");
    const grid=document.createElement("div");grid.className="mini-match";const left=document.createElement("div"),right=document.createElement("div"),status=document.createElement("p");let selected=null,done=0,mistakes=0;status.setAttribute("role","status");
    chosen.forEach(w=>{const b=miniButton(w.word,()=>{selected={w,b};left.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));});b.setAttribute("aria-pressed","false");left.append(b)});
    shuffle(chosen).forEach(w=>{const b=miniButton(w.meaning,()=>{if(!selected){status.textContent="Chọn từ tiếng Anh trước.";return;}if(selected.w===w){selected.b.disabled=b.disabled=true;selected.b.setAttribute("aria-pressed","false");selected=null;done++;if(done===4)logActivity("match");status.textContent=done===4?`Hoàn thành 4 cặp · ${mistakes} lượt nhầm.`:`Đúng · ${done}/4 cặp`;}else{mistakes++;status.textContent="Chưa khớp, thử lại.";}});right.append(b)});grid.append(left,right);mini.append(grid,status);
  };
  $("wl-scramble-start").onclick=()=>{
    const pool=shuffle(words.filter(w=>introduced(w)&&/^[a-z]{3,}$/i.test(w.word))).slice(0,5);let index=0,correct=0;
    function round(){if(index===pool.length){logActivity("scramble");miniHeading("Hoàn thành giải mã",`${correct}/${pool.length} từ giải mã đúng không xem đáp án.`);mini.append(miniButton("Chơi lại",()=>$("wl-scramble-start").click()));return;}const w=pool[index];miniHeading(`Giải mã · ${index+1}/${pool.length}`,w.meaning);const letters=document.createElement("div");letters.className="mini-letters";const answer=document.createElement("p"),status=document.createElement("p");status.setAttribute("role","status");let picked=[],revealed=false,arr=shuffle([...w.word.toLowerCase()]);if(arr.join("")===w.word.toLowerCase())arr.reverse();const render=()=>{answer.textContent=picked.map(x=>x.char).join("")||"Chọn chữ cái bên dưới"};arr.forEach(char=>{const b=miniButton(char,()=>{picked.push({char,b});b.disabled=true;render()});letters.append(b)});mini.append(answer,letters,miniButton("Xóa chữ cuối",()=>{const x=picked.pop();if(x)x.b.disabled=false;render()}),miniButton("Kiểm tra",()=>{if(revealed)return;if(picked.map(x=>x.char).join("")===w.word.toLowerCase()){correct++;index++;round()}else status.textContent="Chưa đúng, hãy đổi thứ tự chữ.";}),miniButton("Xem đáp án / bỏ qua",()=>{if(revealed)return;revealed=true;status.textContent=w.word;letters.querySelectorAll("button").forEach(b=>b.disabled=true);status.append(miniButton("Từ tiếp theo",()=>{index++;round()}));}),status);render();}round();
  };
  $("daily").onclick = () => start("daily");
  $("infinite").onclick = () => start("infinite");
  const launchGame = (speed) => {
    if (speed) $("speed").value = speed;
    $("pause").disabled = false;
    start("game");
  };
  $("game").onclick = () => launchGame();
  $("game-training")?.addEventListener("click", () => launchGame("slow"));
  $("game-rush")?.addEventListener("click", () => launchGame("fast"));
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
  function downloadBackup(payload, filename, raw = false) {
    const url = URL.createObjectURL(new Blob([raw ? payload : JSON.stringify(payload, null, 2)], {type:"application/json"}));
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const backupStatus = message => { $("wl-backup-status").textContent = message; };
  $("wl-recovery-export").onclick = () => {
    if (recoveryRaw !== null) downloadBackup(recoveryRaw, `letsstudy-recovery-${date()}.json`, true);
  };
  $("export").onclick = () => {
    try {
      const drafts = VocabularySentences.exportDrafts();
      if (!VocabularySentences.validDrafts(drafts)) throw Error("Bản nháp không hợp lệ");
      downloadBackup({...store, sentenceDrafts: drafts}, `letsstudy-vocabulary-${date()}.json`);
      backupStatus("Đã tạo bản sao gồm tiến độ, Trạm Sao, thư viện, nhật ký, mục tiêu và bản nháp. Kiểm tra file tải xuống.");
    } catch {
      if (!confirm("Không đọc được toàn bộ bản nháp. Vẫn xuất bản sao tiến độ chính, không kèm bản nháp?")) return;
      try {
        downloadBackup(store, `letsstudy-vocabulary-${date()}-no-drafts.json`);
        backupStatus("Đã tạo bản sao chỉ gồm tiến độ chính; không có bản nháp.");
      } catch { backupStatus("Không tạo được bản sao. Hãy thử lại."); }
    }
  };
  $("import").onchange = async (e) => {
    const input = e.target, file = input.files[0];
    if (!file) return;
    input.disabled = true;
    try {
      let data;
      try {
        if (file.size > 8 * 1024 * 1024) throw Error();
        data = JSON.parse(await file.text());
        if (!valid(data) || (data.sentenceDrafts !== undefined && !VocabularySentences.validDrafts(data.sentenceDrafts))) throw Error();
      } catch {
        backupStatus("Bản sao không hợp lệ hoặc vượt 8 MiB. Chưa thay đổi dữ liệu.");
        return;
      }
      const seen = words.filter(w=>VocabularyLibraryModel.introduced(data.records[w.word])).length;
      const drafts = data.sentenceDrafts;
      const draftCount = Object.keys(drafts || {}).length;
      if (!confirm(`Khôi phục bản sao: ${seen}/${words.length} từ đã làm quen, ${data.guardian?.coins ?? 0} xu, ${draftCount} bản nháp. Tiến độ chính hiện tại sẽ bị thay thế; chỉ bản nháp có trong file bị ghi đè. Bạn đã xuất bản sao hiện tại chưa?`)) {
        backupStatus("Đã hủy. Chưa thay đổi dữ liệu."); return;
      }
      delete data.sentenceDrafts;
      // Capture all affected keys before any write. Main progress is written last.
      const changes = Object.entries(drafts || {}).map(([id,value])=>[`letsstudy-sentence-draft-v1:${id}`, JSON.stringify(value)]);
      changes.push([KEY, JSON.stringify(data)]);
      const written = [], previous = new Map();
      try {
        for (const [key] of changes) previous.set(key, localStorage.getItem(key));
        for (const [key,value] of changes) { localStorage.setItem(key,value); written.push(key); }
      } catch {
        let restored = true;
        for (const key of written.reverse()) {
          try { const old = previous.get(key); if (old === null) localStorage.removeItem(key); else localStorage.setItem(key,old); }
          catch { restored = false; }
        }
        backupStatus(restored ? "Không thể ghi bản sao vào bộ nhớ. Các thay đổi đã được hoàn tác; tiến độ chính hiện tại được giữ." : "Không thể hoàn tác toàn bộ dữ liệu. Hãy giữ nguyên trang và xuất bản sao tiến độ hiện tại; kiểm tra lại các bản nháp.");
        return;
      }
      store = data;
      recoveryRaw = null; storageBlocked = false; storageError = "";
      renderStorageWarning();
      home();
      backupStatus("Đã khôi phục tiến độ chính và các bản nháp có trong file." + (drafts === undefined ? " Bản sao cũ không chứa bản nháp; giữ các bản nháp hiện tại." : ""));
    } finally {
      input.disabled = false;
      input.value = "";
    }
  };
  function activate(id) {
    const el = $(id);
    if (!el || el.disabled || !el.getClientRects().length) return false;
    el.click();
    return true;
  }
  document.addEventListener("keydown", (e) => {
    if (!$("guardian-dialog").hidden && !$("home").hidden) return;
    if (
      e.defaultPrevented ||
      e.isComposing ||
      e.repeat ||
      e.ctrlKey ||
      e.metaKey
    )
      return;
    if (VocabularyLibrary.isOpen()) {
      VocabularyLibrary.handleKey(e);
      return;
    }
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
      else if (e.key === "Enter" && session.resolved && session.mode !== "game")
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
  const englishToggle=$("wl-english-keys");
  try{englishToggle.checked=localStorage.getItem("wl-english-keys")!=="off";}catch{}
  englishToggle.onchange=()=>{try{localStorage.setItem("wl-english-keys",englishToggle.checked?"on":"off")}catch{}};
  const wordFields=["answer","copy-answer","lib-quiz-answer"];
  function englishInsert(field,char){
    if(field.disabled||field.readOnly)return;
    const from=field.selectionStart??field.value.length,to=field.selectionEnd??from;
    if(char==="Backspace")field.setRangeText("",from===to?Math.max(0,from-1):from,to,"end");
    else field.setRangeText(char,from,to,"end");
    field.dispatchEvent(new Event("input",{bubbles:true}));
  }
  document.addEventListener("keydown",e=>{
    const field=e.target;if(!englishToggle.checked||!wordFields.includes(field.id)||field.disabled||e.ctrlKey||e.altKey||e.metaKey||e.isComposing)return;
    const char=/^Key[A-Z]$/.test(e.code)?e.code.slice(3).toLowerCase():e.code==="Space"?" ":e.code==="Minus"?"-":e.code==="Quote"?"'":null;
    if(char===null)return;e.preventDefault();englishInsert(field,char);
  },true);
  // An optional virtual keyboard works even when an OS input method consumes physical key events.
  for(const id of wordFields){
    const field=$(id),form=field.closest("form"),wrap=document.createElement("div"),keys=document.createElement("div"),toggle=document.createElement("button");
    wrap.className="wl-virtual-english";keys.className="wl-english-pad";keys.hidden=true;toggle.type="button";toggle.textContent="Bàn phím English";toggle.setAttribute("aria-expanded","false");toggle.onclick=()=>{keys.hidden=!keys.hidden;toggle.setAttribute("aria-expanded",String(!keys.hidden));};
    for(const c of [..."qwertyuiopasdfghjklzxcvbnm","-","'"," ","Backspace"]){const key=document.createElement("button");key.type="button";key.textContent=c===" "?"Space":c==="Backspace"?"⌫":c;key.setAttribute("aria-label",c===" "?"Dấu cách":c==="Backspace"?"Xóa ký tự":c);key.onpointerdown=e=>e.preventDefault();key.onclick=()=>englishInsert(field,c);keys.append(key);}
    wrap.append(toggle,keys);form.insertAdjacentElement("afterend",wrap);
  }
  Guardian.mount({ getStore: () => store, save });
  VocabularyLibrary.mount({
    words,
    getStore: () => store,
    save,
    onClose: home,
  });
  setInterval(() => {
    if (!$("home").hidden) home();
  }, 30000);
  const params = new URLSearchParams(location.search);
  home();
  globalThis.WordLabHome = home;
  if (params.get("view") === "sentences") {
    VocabularySentences.open(params.get("exercise"));
  } else {
    if (params.get("view") === "library") VocabularyLibrary.open();
  }
})();
