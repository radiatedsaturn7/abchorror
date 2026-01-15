const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const winScreen = document.getElementById("win-screen");
const jumpscare = document.getElementById("jumpscare");

const gradeButtons = document.querySelectorAll(".grade-options .chip");
const categoryOptionsEl = document.getElementById("category-options");
const profileOptionsEl = document.getElementById("profile-options");
const profileNameInput = document.getElementById("profile-name");
const createProfileBtn = document.getElementById("create-profile");
const startButton = document.getElementById("start-btn");

const progressBar = document.getElementById("progress-bar");
const dreadBar = document.getElementById("dread-bar");
const categoryBadge = document.getElementById("category");
const promptEl = document.getElementById("prompt");
const passageEl = document.getElementById("passage");
const choicesEl = document.getElementById("choices");
const inputAreaEl = document.getElementById("input-area");
const keyboardEl = document.getElementById("keyboard");
const feedbackEl = document.getElementById("feedback");
const timerEl = document.getElementById("timer");
const playerNameEl = document.getElementById("player-name");
const modeLabelEl = document.getElementById("mode-label");
const rereadBtn = document.getElementById("reread-btn");
const badgeToast = document.getElementById("badge-toast");
const shadowEdge = document.getElementById("shadow-edge");
const statsEl = document.getElementById("stats");
const winTitleEl = document.getElementById("win-title");
const nextNightBtn = document.getElementById("next-night");
const backHomeBtn = document.getElementById("back-home");
const powerFlicker = document.getElementById("power-flicker");
const retryBtn = document.getElementById("retry-btn");
const flickerSprite = document.getElementById("flicker-sprite");
const randomFlicker = document.getElementById("random-flicker");
const loreOverlay = document.getElementById("lore-overlay");
const loreNightEl = document.getElementById("lore-night");
const loreTitleEl = document.getElementById("lore-title");
const loreSubtitleEl = document.getElementById("lore-subtitle");
const loreContinueBtn = document.getElementById("lore-continue");

const LETTERS = ["A", "B", "C", "D"];
const MODE_LABELS = {
  night: "Night Shift",
  speed: "Speed Round",
  match: "Match-Up",
};
const CATEGORY_LABELS = {
  math: "Math",
  reading: "Reading",
  spelling: "Spelling",
  science: "Science",
  "social studies": "Social Studies",
  language: "Language",
  general: "General",
};
const CATEGORY_ORDER = [
  "math",
  "reading",
  "spelling",
  "science",
  "social studies",
  "language",
  "general",
];
const MAX_NIGHTS = 5;
const GRADE_FILES = {
  1: "grade1.json",
  2: "grade2.json",
  3: "grade3.json",
  4: "grade4.json",
  5: "grade5.json",
};
const PROFILE_STORAGE_KEY = "abchorror.profiles";
const PROGRESS_STORAGE_PREFIX = "abchorror.progress.";
const RECENT_HISTORY_LIMIT = 10;

const defaultConfig = {
  dreadThreshold: 100,
  wrongDread: 25,
  dreadRamp: 0.08,
  resetDread: 40,
  progressPerCorrect: 10,
  speedTimer: 9,
};

const state = {
  questions: [],
  questionsByGrade: {},
  grade: 3,
  mode: "night",
  playerName: "Player",
  profileId: null,
  profiles: [],
  progressData: null,
  night: 1,
  progress: 0,
  dread: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  bestStreak: 0,
  scares: 0,
  locked: false,
  activeQuestion: null,
  activeTimer: null,
  timerSeconds: 0,
  questionsAnswered: 0,
  audioUnlocked: false,
  audioContext: null,
  deskStage: -1,
  loreActive: false,
  loreUtterance: null,
  lastQuestionKey: null,
  recentQuestionIds: [],
  categoryStreaks: {},
  activeInputEl: null,
  pendingBadgeTimeout: null,
};

const config = { ...defaultConfig };
const deskScenes = ["desk1.png", "desk2.png", "desk3.png"];
const speechSynth = window.speechSynthesis || null;

const selectors = {
  grade: 3,
  categories: new Set(),
};

let availableCategories = [];

const loreByGrade = {
  1: [
    {
      title: "Overnight Orientation",
      text: "Hello hello! You started making tests for the first graders overnight. The halls are quiet, the projector is buzzing, and the secretary keeps a neat little ledger. She says a teacher never left the building, the kind who counted every mistake and never smiled.",
    },
    {
      title: "The Red Pen",
      text: "Night two. The secretary's ink wasn't always red. It used to be chalk, and the teacher used to be kind. But the papers came back wrong, and he kept correcting until the classroom emptied. Now the mouse he became hates wrong answers more than silence.",
    },
    {
      title: "Hall Monitor",
      text: "Night three. You might hear paws in the ceiling tiles or see a shadow in the hallway glass. He patrols like a hall monitor that never stopped. He believes every wrong answer is a lie, and lies deserve detention in the dark.",
    },
    {
      title: "Detention Ledger",
      text: "Night four. The secretary's ledger lists every student he failed, every name he crossed out. He still thinks he's teaching. He still thinks you're here to help. But the moment the bell rings and you stumble, he'll tear the words from your throat.",
    },
    {
      title: "Final Bell",
      text: "Night five. The final bell is rusted, but he hears it. He wants you to finish the tests he never could. Keep calm, keep answering, and maybe you'll survive the last lesson.",
    },
  ],
  2: [
    {
      title: "Overnight Orientation",
      text: "Welcome to second grade nights. The halls are quiet, the projector hums, and the principal watches from the office window. He says the building belongs to an old teacher who never accepted a wrong answer.",
    },
    {
      title: "The Red Pen",
      text: "Night two. The principal still keeps the red pen locked away. The teacher once used chalk and kind words, but the grades came back wrong. He kept correcting until the children were gone, and now the mouse he became hates mistakes.",
    },
    {
      title: "Hall Monitor",
      text: "Night three. The principal swears he hears paws in the ceiling tiles. A shadow moves across the hallway glass. He patrols like a hall monitor that never stopped, and every wrong answer feels like detention in the dark.",
    },
    {
      title: "Detention Ledger",
      text: "Night four. The principal's ledger lists every student he failed, every name crossed out. He still thinks he's teaching. He still thinks you're here to help. But stumble when the bell rings and he'll take your voice.",
    },
    {
      title: "Final Bell",
      text: "Night five. The final bell is rusted, but he hears it. He wants you to finish the tests he never could. Keep your answers sharp if you want to make it home.",
    },
  ],
  3: [
    {
      title: "Overnight Orientation",
      text: "Third grade nights begin with a substitute teacher who never left the classroom. The halls are quiet, the projector buzzes, and he keeps count of every mark he would have made.",
    },
    {
      title: "The Red Pen",
      text: "Night two. The substitute's pen wasn't always red. It used to be chalk, and he used to be kind. But the grades came back wrong, and he kept correcting until the desks went cold.",
    },
    {
      title: "Hall Monitor",
      text: "Night three. You might hear paws in the ceiling tiles or see the shadow of a tail in the hallway glass. He patrols like a hall monitor that never stopped and believes every wrong answer is a lie.",
    },
    {
      title: "Detention Ledger",
      text: "Night four. The substitute's notes list every student he failed, every name he crossed out. He still thinks he's teaching. He still thinks you're here to help. But the moment the bell rings and you stumble, he'll take your voice.",
    },
    {
      title: "Final Bell",
      text: "Night five. The final bell is rusted, but he hears it. He wants you to finish the tests he never could. Keep calm, keep answering, and maybe you'll survive the last lesson.",
    },
  ],
  4: [
    {
      title: "Overnight Orientation",
      text: "Fourth grade nights come with a parent who won't stop complaining. The halls are quiet, the projector is buzzing, and the parent keeps demanding perfect scores from an old teacher who never left.",
    },
    {
      title: "The Red Pen",
      text: "Night two. The parent keeps a stack of marked papers. The teacher used to be kind, but the grades came back wrong, and he kept correcting until the classroom emptied.",
    },
    {
      title: "Hall Monitor",
      text: "Night three. The parent swears the hall monitor never sleeps. Paws in the ceiling tiles, a tail in the hallway glass. He believes every wrong answer is a lie, and lies deserve detention in the dark.",
    },
    {
      title: "Detention Ledger",
      text: "Night four. The parent shoved a detention ledger across the desk, every name crossed out. He still thinks he's teaching. He still thinks you're here to help. But the moment the bell rings and you stumble, he'll tear the words from your throat.",
    },
    {
      title: "Final Bell",
      text: "Night five. The final bell is rusted, but he hears it. He wants you to finish the tests he never could. Keep your answers sharp if you want to make it home.",
    },
  ],
  5: [
    {
      title: "Overnight Orientation",
      text: "Fifth grade nights are the hardest. The halls are quiet, the projector hums, and the librarian whispers about a teacher who never left the building and never forgave a mistake.",
    },
    {
      title: "The Red Pen",
      text: "Night two. The librarian says the ink wasn't always red. It used to be chalk, and the teacher used to be kind. But the grades came back wrong, and he kept correcting until the children were gone.",
    },
    {
      title: "Hall Monitor",
      text: "Night three. You might hear paws in the ceiling tiles or see the shadow of a tail in the hallway glass. He patrols like a hall monitor that never stopped. He believes every wrong answer is a lie.",
    },
    {
      title: "Detention Ledger",
      text: "Night four. The librarian keeps a ledger of every student he failed, every name crossed out. He still thinks he's teaching. He still thinks you're here to help. But the moment the bell rings and you stumble, he'll take your voice.",
    },
    {
      title: "Final Bell",
      text: "Night five. The final bell is rusted, but he hears it. He wants you to finish the tests he never could. Keep calm, keep answering, and maybe you'll survive the last lesson.",
    },
  ],
};

function setActiveButton(buttons, value, key) {
  buttons.forEach((button) => {
    const isActive = button.dataset[key] === value;
    button.classList.toggle("active", isActive);
  });
}

function initSelectors() {
  setActiveButton(gradeButtons, String(selectors.grade), "grade");
}

function loadProfiles() {
  const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    state.profiles = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    state.profiles = [];
  }
  if (state.profiles.length && !state.profileId) {
    const recent = [...state.profiles].sort(
      (a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0)
    )[0];
    state.profileId = recent.id;
    state.progressData = loadProgress(recent.id, selectors.grade);
    state.playerName = recent.name;
  }
}

function saveProfiles() {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profiles));
}

function getProgressStorageKey(profileId) {
  return `${PROGRESS_STORAGE_PREFIX}${profileId}`;
}

function createDefaultProgress(grade) {
  return {
    grade,
    categoryStats: {},
    questionStats: {},
    badges: [],
    unlocks: {},
  };
}

function loadProgress(profileId, grade) {
  if (!profileId) {
    return createDefaultProgress(grade);
  }
  const stored = localStorage.getItem(getProgressStorageKey(profileId));
  if (!stored) {
    return createDefaultProgress(grade);
  }
  try {
    const parsed = JSON.parse(stored);
    return {
      ...createDefaultProgress(grade),
      ...parsed,
      categoryStats: parsed.categoryStats || {},
      questionStats: parsed.questionStats || {},
      badges: parsed.badges || [],
      unlocks: parsed.unlocks || {},
    };
  } catch (error) {
    return createDefaultProgress(grade);
  }
}

function saveProgress() {
  if (!state.profileId || !state.progressData) {
    return;
  }
  localStorage.setItem(
    getProgressStorageKey(state.profileId),
    JSON.stringify(state.progressData)
  );
}

function updateStartButtonState() {
  if (!startButton) {
    return;
  }
  startButton.disabled = !state.profileId;
}

function selectProfile(profileId) {
  state.profileId = profileId;
  state.progressData = loadProgress(profileId, selectors.grade);
  const profile = state.profiles.find((item) => item.id === profileId);
  state.playerName = profile ? profile.name : "Player";
  updateStartButtonState();
  renderProfileOptions();
}

function renderProfileOptions() {
  if (!profileOptionsEl) {
    return;
  }
  profileOptionsEl.innerHTML = "";
  if (!state.profiles.length) {
    const empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = "Create a profile to save progress.";
    profileOptionsEl.appendChild(empty);
    return;
  }
  state.profiles.forEach((profile) => {
    const button = document.createElement("button");
    button.className = "chip";
    button.type = "button";
    button.textContent = profile.name;
    button.dataset.profile = profile.id;
    if (profile.id === state.profileId) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => selectProfile(profile.id));
    profileOptionsEl.appendChild(button);
  });
}

function handleCreateProfile() {
  if (!profileNameInput) {
    return;
  }
  const name = profileNameInput.value.trim();
  if (!name) {
    return;
  }
  const profile = {
    id: `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
  };
  state.profiles.push(profile);
  saveProfiles();
  profileNameInput.value = "";
  selectProfile(profile.id);
}

function unlockAudio() {
  if (!state.audioContext) {
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (state.audioContext.state === "suspended") {
    state.audioContext.resume();
  }
  state.audioUnlocked = true;
}

function beep(frequency = 440, duration = 0.15) {
  if (!state.audioContext) {
    return;
  }
  const ctx = state.audioContext;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

function buzz(duration = 0.25) {
  if (!state.audioContext) {
    return;
  }
  const ctx = state.audioContext;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 110;
  gain.gain.value = 0.12;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

function getDefaultNormalize(answerType) {
  if (answerType === "number") {
    return { trim: true, caseInsensitive: false, stripPunctuation: true };
  }
  return { trim: true, caseInsensitive: true, stripPunctuation: true };
}

function normalizeInput(value, settings) {
  let normalized = String(value ?? "");
  if (settings.trim) {
    normalized = normalized.trim();
  }
  if (settings.stripPunctuation) {
    normalized = normalized.replace(/[^a-z0-9\s]/gi, "");
  }
  if (settings.caseInsensitive) {
    normalized = normalized.toLowerCase();
  }
  return normalized;
}

function upgradeQuestion(raw, index, gradeValue) {
  const question = { ...raw };
  if (question.id === undefined || question.id === null || question.id === "") {
    question.id = `g${gradeValue}-q${index}`;
  }
  if (question.gradeMin === undefined) {
    question.gradeMin = gradeValue;
  }
  if (question.gradeMax === undefined) {
    question.gradeMax = gradeValue;
  }

  if (!question.type) {
    if (question.category === "spelling") {
      question.type = "spelling";
    } else if (Array.isArray(question.choices)) {
      question.type = "mcq";
    } else if (question.passage) {
      question.type = "reading";
    } else {
      question.type = "input";
    }
  }

  if (
    question.category === "spelling" &&
    Array.isArray(question.choices) &&
    question.spokenPrompt
  ) {
    question.type = "spelling";
  }

  if (question.type === "spelling") {
    question.category = "spelling";
    question.prompt = "Spell the word you hear.";
    if (!question.spokenPrompt && typeof question.answer === "string") {
      question.spokenPrompt = `Spell ${question.answer}.`;
    }
    question.answerType = "text";
    question.normalize = { ...getDefaultNormalize("text"), ...(question.normalize || {}) };
  }

  if (question.type === "input") {
    if (!question.answerType) {
      question.answerType = typeof question.answer === "number" ? "number" : "text";
    }
    question.normalize = {
      ...getDefaultNormalize(question.answerType),
      ...(question.normalize || {}),
    };
  }

  if (question.type === "reading") {
    if (!Array.isArray(question.choices)) {
      if (!question.answerType) {
        question.answerType = typeof question.answer === "number" ? "number" : "text";
      }
      question.normalize = {
        ...getDefaultNormalize(question.answerType),
        ...(question.normalize || {}),
      };
    }
  }

  return question;
}

function isValidQuestion(question) {
  if (!question || !question.prompt || !question.category) {
    return false;
  }
  if (question.type === "mcq") {
    return (
      Array.isArray(question.choices) &&
      question.choices.length === 4 &&
      question.answerIndex >= 0 &&
      question.answerIndex < question.choices.length
    );
  }
  if (question.type === "input") {
    return question.answer !== undefined && question.answerType;
  }
  if (question.type === "spelling") {
    return typeof question.answer === "string" && typeof question.spokenPrompt === "string";
  }
  if (question.type === "reading") {
    if (!question.passage) {
      return false;
    }
    if (Array.isArray(question.choices)) {
      return (
        question.choices.length === 4 &&
        question.answerIndex >= 0 &&
        question.answerIndex < question.choices.length
      );
    }
    return question.answer !== undefined && question.answerType;
  }
  return false;
}

async function loadQuestions() {
  // Schema overview: each question is "mcq", "input", "spelling", or "reading".
  // See README for full schema and the build tool for validation/generation.
  const entries = await Promise.all(
    Object.entries(GRADE_FILES).map(async ([grade, file]) => {
      const response = await fetch(file);
      const data = await response.json();
      const gradeValue = parseInt(grade, 10);
      const upgraded = data
        .map((question, index) => upgradeQuestion(question, index, gradeValue))
        .filter((question) => gradeValue >= question.gradeMin && gradeValue <= question.gradeMax)
        .filter(isValidQuestion);
      return [gradeValue, upgraded];
    })
  );
  state.questionsByGrade = Object.fromEntries(entries);
  state.questions = state.questionsByGrade[state.grade] || [];
}

function getAvailableCategories(questions = null) {
  const categories = new Set();
  const source = questions || state.questionsByGrade[selectors.grade] || [];
  source.forEach((question) => categories.add(question.category));
  const ordered = CATEGORY_ORDER.filter((category) => categories.has(category));
  const extras = Array.from(categories)
    .filter((category) => !CATEGORY_ORDER.includes(category))
    .sort((a, b) => a.localeCompare(b));
  return [...ordered, ...extras];
}

function updateCategoryButtons() {
  if (!categoryOptionsEl) {
    return;
  }
  categoryOptionsEl.querySelectorAll(".chip").forEach((button) => {
    button.classList.toggle("active", selectors.categories.has(button.dataset.category));
  });
}

function handleCategoryToggle(category) {
  if (selectors.categories.has(category)) {
    selectors.categories.delete(category);
  } else {
    selectors.categories.add(category);
  }
  if (!selectors.categories.size) {
    availableCategories.forEach((item) => selectors.categories.add(item));
  }
  updateCategoryButtons();
}

function renderCategoryOptions() {
  if (!categoryOptionsEl) {
    return;
  }
  if (!Object.keys(state.questionsByGrade).length) {
    return;
  }
  availableCategories = getAvailableCategories();
  selectors.categories = new Set(availableCategories);
  categoryOptionsEl.innerHTML = "";
  availableCategories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "chip active";
    button.type = "button";
    button.dataset.category = category;
    button.textContent = CATEGORY_LABELS[category] || category;
    button.addEventListener("click", () => handleCategoryToggle(category));
    categoryOptionsEl.appendChild(button);
  });
}

function filterQuestions() {
  const difficultyCap = Math.min(5, state.night + 1);
  const inGradeQuestions = state.questions.filter((q) => {
    const inGrade = state.grade >= q.gradeMin && state.grade <= q.gradeMax;
    return inGrade;
  });
  const allowedCategories =
    state.selectedCategories && state.selectedCategories.length ? state.selectedCategories : null;
  const categoryFiltered = allowedCategories
    ? inGradeQuestions.filter((q) => allowedCategories.includes(q.category))
    : inGradeQuestions;
  const filtered = categoryFiltered.filter((q) =>
    q.difficulty ? q.difficulty <= difficultyCap : true
  );
  if (!filtered.length) {
    return categoryFiltered;
  }
  if (filtered.length < 10 && difficultyCap < 3) {
    const relaxed = categoryFiltered.filter((q) =>
      q.difficulty ? q.difficulty <= difficultyCap + 1 : true
    );
    if (relaxed.length) {
      return relaxed;
    }
  }
  return filtered;
}

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getQuestionKey(question) {
  if (question.id !== undefined && question.id !== null) {
    return String(question.id);
  }
  return `${question.category}::${question.prompt}`;
}

function shuffleQuestionChoices(question) {
  if (!Array.isArray(question.choices) || question.choices.length < 2) {
    return question;
  }
  const indexed = question.choices.map((choice, index) => ({ choice, index }));
  const shuffled = shuffle(indexed);
  const choices = shuffled.map((item) => item.choice);
  const answerIndex = shuffled.findIndex((item) => item.index === question.answerIndex);
  return {
    ...question,
    choices,
    answerIndex,
  };
}

function pickRandomQuestion(questions) {
  return questions[Math.floor(Math.random() * questions.length)];
}

function buildMatchQuestion(questions) {
  const mcqQuestions = questions.filter((q) => isMcqQuestion(q));
  const carQuestions = mcqQuestions.filter((q) => q.category === "cars");
  const vocabQuestions = mcqQuestions.filter((q) => q.category === "other");
  const sourcePool = carQuestions.length > 2 ? carQuestions : vocabQuestions;
  if (!sourcePool.length) {
    return pickRandomQuestion(mcqQuestions.length ? mcqQuestions : questions);
  }
  const base = pickRandomQuestion(sourcePool);
  const choices = shuffle(sourcePool)
    .slice(0, 4)
    .map((q) => q.choices[q.answerIndex]);
  const correctAnswer = base.choices[base.answerIndex];
  if (!choices.includes(correctAnswer)) {
    choices[Math.floor(Math.random() * choices.length)] = correctAnswer;
  }
  return {
    ...base,
    prompt: `Match-Up: ${base.prompt}`,
    choices,
    answerIndex: choices.indexOf(correctAnswer),
  };
}

function getDifficultyFactor() {
  return 1 + (state.night - 1) * 0.1;
}

function configureForNight() {
  const factor = getDifficultyFactor();
  config.dreadThreshold = 100;
  config.wrongDread = Math.round(defaultConfig.wrongDread * factor);
  config.dreadRamp = defaultConfig.dreadRamp * factor;
  config.progressPerCorrect = 10;
}

function resetState() {
  state.progress = 0;
  state.dread = 0;
  state.correct = 0;
  state.wrong = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.scares = 0;
  state.locked = false;
  state.activeQuestion = null;
  state.activeTimer = null;
  state.timerSeconds = 0;
  state.questionsAnswered = 0;
  state.deskStage = -1;
  state.loreActive = false;
  state.loreUtterance = null;
  state.lastQuestionKey = null;
  state.recentQuestionIds = [];
  state.categoryStreaks = {};
  state.activeInputEl = null;
}

function showScreen(screen) {
  [startScreen, gameScreen, winScreen].forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

function updateBars() {
  progressBar.style.width = `${state.progress}%`;
  dreadBar.style.width = `${state.dread}%`;
  gameScreen.classList.toggle("high-dread", state.dread >= 70);
  shadowEdge.classList.toggle("visible", state.dread > 70);
  updateDeskScene();
}

function updateHUD() {
  playerNameEl.textContent = state.playerName;
  modeLabelEl.textContent = MODE_LABELS[state.mode];
}

function isMcqQuestion(question) {
  return question.type === "mcq" || (question.type === "reading" && Array.isArray(question.choices));
}

function isInputQuestion(question) {
  if (question.type === "reading") {
    return !Array.isArray(question.choices);
  }
  return question.type === "input" || question.type === "spelling";
}

function shouldUseOnScreenKeyboard() {
  const isTouch =
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
    "ontouchstart" in window;
  const isSmall = window.innerWidth < 700;
  return isTouch && isSmall;
}

function clearQuestionUI() {
  choicesEl.innerHTML = "";
  inputAreaEl.innerHTML = "";
  inputAreaEl.classList.add("hidden");
  keyboardEl.innerHTML = "";
  keyboardEl.classList.add("hidden");
  keyboardEl.setAttribute("aria-hidden", "true");
  state.activeInputEl = null;
}

function renderChoices(question) {
  question.choices.forEach((choice, index) => {
    const row = document.createElement("div");
    row.className = "choice-row";
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.dataset.index = index;
    button.innerHTML = `<span class="choice-label">${LETTERS[index]}</span> ${choice}`;
    button.addEventListener("click", () => handleChoiceAnswer(index));
    const soundButton = document.createElement("button");
    soundButton.className = "choice-sound";
    soundButton.type = "button";
    soundButton.innerHTML = "🔊";
    soundButton.setAttribute("aria-label", `Read answer choice ${LETTERS[index]}`);
    soundButton.addEventListener("click", (event) => {
      event.stopPropagation();
      speakText(choice);
    });
    row.appendChild(button);
    row.appendChild(soundButton);
    choicesEl.appendChild(row);
  });
}

function buildOnScreenKeyboard(targetInput, onSubmit, includeSpace = true) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];
  keyboardEl.innerHTML = "";
  keyboardEl.classList.remove("hidden");
  keyboardEl.setAttribute("aria-hidden", "false");
  rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";
    row.forEach((letter) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "key-btn";
      btn.textContent = letter;
      btn.addEventListener("click", () => {
        targetInput.value += letter.toLowerCase();
      });
      rowEl.appendChild(btn);
    });
    keyboardEl.appendChild(rowEl);
  });
  const actionRow = document.createElement("div");
  actionRow.className = "keyboard-row";
  if (includeSpace) {
    const spaceBtn = document.createElement("button");
    spaceBtn.type = "button";
    spaceBtn.className = "key-btn";
    spaceBtn.textContent = "Space";
    spaceBtn.addEventListener("click", () => {
      targetInput.value += " ";
    });
    actionRow.appendChild(spaceBtn);
  }
  const backspaceBtn = document.createElement("button");
  backspaceBtn.type = "button";
  backspaceBtn.className = "key-btn";
  backspaceBtn.textContent = "⌫";
  backspaceBtn.addEventListener("click", () => {
    targetInput.value = targetInput.value.slice(0, -1);
  });
  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.className = "key-btn";
  submitBtn.textContent = "Enter";
  submitBtn.addEventListener("click", () => onSubmit(targetInput.value));
  actionRow.appendChild(backspaceBtn);
  actionRow.appendChild(submitBtn);
  keyboardEl.appendChild(actionRow);
}

function renderInput(question, useKeyboard) {
  const row = document.createElement("div");
  row.className = "input-row";
  const answerType = question.answerType || "text";
  const useTextarea = answerType === "text" && question.type === "reading";
  const input = document.createElement(useTextarea ? "textarea" : "input");
  if (!useTextarea) {
    input.type = answerType === "number" ? "number" : "text";
  }
  input.placeholder = answerType === "number" ? "Type your answer" : "Type your answer";
  input.autocomplete = "off";
  input.spellcheck = false;
  if (useKeyboard) {
    input.readOnly = true;
    input.inputMode = "none";
  } else {
    input.inputMode = answerType === "number" ? "decimal" : "text";
  }
  const submitBtn = document.createElement("button");
  submitBtn.className = "primary";
  submitBtn.type = "button";
  submitBtn.textContent = "Submit";
  submitBtn.addEventListener("click", () => handleTextAnswer(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleTextAnswer(input.value);
    }
  });
  row.appendChild(input);
  row.appendChild(submitBtn);
  inputAreaEl.appendChild(row);
  inputAreaEl.classList.remove("hidden");
  state.activeInputEl = input;

  if (useKeyboard) {
    buildOnScreenKeyboard(input, handleTextAnswer, question.type === "spelling");
  } else {
    keyboardEl.classList.add("hidden");
    keyboardEl.setAttribute("aria-hidden", "true");
  }
}

function renderQuestion(question) {
  state.activeQuestion = question;
  clearFeedback();
  categoryBadge.textContent = question.category.toUpperCase();
  promptEl.textContent = question.prompt;
  if (question.passage) {
    passageEl.textContent = question.passage;
    passageEl.classList.remove("hidden");
  } else {
    passageEl.classList.add("hidden");
  }
  clearQuestionUI();
  if (isMcqQuestion(question)) {
    renderChoices(question);
  } else if (isInputQuestion(question)) {
    const useKeyboard = question.type === "spelling" && shouldUseOnScreenKeyboard();
    renderInput(question, useKeyboard);
  }
  speakQuestion(question);
}

function speakText(text) {
  if (!speechSynth || typeof SpeechSynthesisUtterance === "undefined") {
    return;
  }
  speechSynth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  speechSynth.speak(utterance);
}

function speakQuestion(question) {
  speakText(question.spokenPrompt || question.prompt);
}

function showFeedback(text, type, hint) {
  feedbackEl.textContent = hint ? `${text} — ${hint}` : text;
  feedbackEl.classList.remove("hidden");
  feedbackEl.style.color = type === "correct" ? "#8ef7a3" : "#ffb3c7";
}

function clearFeedback() {
  feedbackEl.classList.add("hidden");
  feedbackEl.textContent = "";
}

function getQuestionStat(questionId) {
  if (!state.progressData) {
    return null;
  }
  if (!state.progressData.questionStats[questionId]) {
    state.progressData.questionStats[questionId] = {
      seen: 0,
      correct: 0,
      wrong: 0,
      lastSeen: 0,
      ease: 2.2,
      lastResult: null,
    };
  }
  return state.progressData.questionStats[questionId];
}

function getCategoryStat(category) {
  if (!state.progressData) {
    return null;
  }
  if (!state.progressData.categoryStats[category]) {
    state.progressData.categoryStats[category] = {
      seen: 0,
      correct: 0,
      wrong: 0,
      streakBest: 0,
      mastery: 0,
      lastSeen: 0,
    };
  }
  return state.progressData.categoryStats[category];
}

function normalizeAnswer(question, answer) {
  const settings = question.normalize || getDefaultNormalize(question.answerType || "text");
  if (question.answerType === "number") {
    const normalized = normalizeInput(answer, settings);
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return normalizeInput(answer, settings);
}

function evaluateAnswer(question, userAnswer) {
  if (isMcqQuestion(question)) {
    return userAnswer === question.answerIndex;
  }
  const normalized = normalizeAnswer(question, userAnswer);
  if (normalized === null || normalized === "") {
    return false;
  }
  const accepted = Array.isArray(question.answer) ? question.answer : [question.answer];
  if (question.answerType === "number") {
    const normalizedAccepted = accepted
      .map((value) => parseFloat(String(value)))
      .filter((value) => !Number.isNaN(value));
    return normalizedAccepted.some((value) => value === normalized);
  }
  const acceptedNormalized = accepted.map((value) =>
    normalizeInput(value, question.normalize || getDefaultNormalize("text"))
  );
  return acceptedNormalized.some((value) => value === normalized);
}

function showBadgeToast(label) {
  if (!badgeToast) {
    return;
  }
  badgeToast.textContent = `Badge unlocked: ${label}`;
  badgeToast.classList.remove("hidden");
  if (state.pendingBadgeTimeout) {
    clearTimeout(state.pendingBadgeTimeout);
  }
  state.pendingBadgeTimeout = setTimeout(() => {
    badgeToast.classList.add("hidden");
  }, 3200);
}

function awardBadge(badgeId, label) {
  if (!state.progressData || state.progressData.badges.includes(badgeId)) {
    return;
  }
  state.progressData.badges.push(badgeId);
  showBadgeToast(label);
  saveProgress();
}

function updateProgressOnAnswer(question, isCorrect) {
  if (!state.progressData) {
    return;
  }
  const questionId = getQuestionKey(question);
  const stat = getQuestionStat(questionId);
  const categoryStat = getCategoryStat(question.category);
  const timestamp = Date.now();
  stat.seen += 1;
  categoryStat.seen += 1;
  stat.lastSeen = timestamp;
  categoryStat.lastSeen = timestamp;

  if (isCorrect) {
    stat.correct += 1;
    categoryStat.correct += 1;
    stat.ease = Math.min(3.2, stat.ease + 0.12);
    stat.lastResult = "correct";
  } else {
    stat.wrong += 1;
    categoryStat.wrong += 1;
    stat.ease = Math.max(1.3, stat.ease - 0.2);
    stat.lastResult = "wrong";
  }

  const mastery = categoryStat.seen ? categoryStat.correct / categoryStat.seen : 0;
  categoryStat.mastery = Math.max(0, Math.min(1, mastery));
  categoryStat.streakBest = Math.max(categoryStat.streakBest, state.streak);

  if (!state.categoryStreaks[question.category]) {
    state.categoryStreaks[question.category] = 0;
  }
  state.categoryStreaks[question.category] = isCorrect
    ? state.categoryStreaks[question.category] + 1
    : 0;

  if (question.category === "math" && state.categoryStreaks.math >= 10) {
    awardBadge("math-streak-10", "Math Streak 10");
  }
  if (question.category === "spelling" && state.categoryStreaks.spelling >= 20) {
    awardBadge("spelling-perfect-20", "Spelling Perfect 20");
  }
  if (question.category === "reading" && categoryStat.mastery >= 0.8 && categoryStat.seen >= 20) {
    awardBadge("reading-mastery-80", "Reading Mastery 80%");
  }

  saveProgress();
}

function getDeskStage(dread) {
  if (dread >= 70) {
    return 2;
  }
  if (dread >= 35) {
    return 1;
  }
  return 0;
}

function updateDeskScene() {
  const nextStage = getDeskStage(state.dread);
  if (nextStage === state.deskStage) {
    return;
  }
  state.deskStage = nextStage;
  if (powerFlicker) {
    powerFlicker.classList.remove("active");
    void powerFlicker.offsetWidth;
    powerFlicker.classList.add("active");
  }
  if (flickerSprite) {
    flickerSprite.classList.remove("active");
    void flickerSprite.offsetWidth;
    flickerSprite.classList.add("active");
  }
  buzz(0.3);
  setTimeout(() => {
    gameScreen.style.backgroundImage = `url("${deskScenes[state.deskStage]}")`;
  }, 220);
  setTimeout(() => {
    if (flickerSprite) {
      flickerSprite.classList.remove("active");
    }
  }, 340);
}

function handleChoiceAnswer(index) {
  if (state.locked) {
    return;
  }
  state.locked = true;
  state.questionsAnswered += 1;
  const isCorrect = evaluateAnswer(state.activeQuestion, index);
  processAnswer(isCorrect);
}

function handleTextAnswer(text) {
  if (state.locked) {
    return;
  }
  state.locked = true;
  state.questionsAnswered += 1;
  const isCorrect = evaluateAnswer(state.activeQuestion, text);
  processAnswer(isCorrect);
}

function processAnswer(isCorrect) {
  const question = state.activeQuestion;

  if (isCorrect) {
    state.correct += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.progress = Math.min(100, state.progress + config.progressPerCorrect);
    state.dread = Math.max(0, state.dread - 15);
    showFeedback("Correct!", "correct");
    beep(660, 0.18);
    setTimeout(() => {
      state.locked = false;
      clearFeedback();
      if (state.mode === "speed" && state.questionsAnswered >= 10) {
        endNight();
      } else if (state.progress >= 100) {
        endNight();
      } else {
        nextQuestion();
      }
    }, 600);
  } else {
    state.wrong += 1;
    state.streak = 0;
    state.dread = Math.min(100, state.dread + config.wrongDread);
    showFeedback("Not quite", "wrong", question.hint);
    setTimeout(() => {
      state.locked = false;
      clearFeedback();
      if (state.mode === "speed" && state.questionsAnswered >= 10) {
        endNight();
      } else if (state.dread >= config.dreadThreshold) {
        triggerDeath();
      } else {
        nextQuestion();
      }
    }, 900);
  }

  updateProgressOnAnswer(question, isCorrect);
  updateBars();
}

function startTimer() {
  if (state.mode !== "speed") {
    timerEl.classList.add("hidden");
    return;
  }
  state.timerSeconds = config.speedTimer;
  timerEl.classList.remove("hidden");
  timerEl.textContent = `${state.timerSeconds}s`;

  if (state.activeTimer) {
    clearInterval(state.activeTimer);
  }

  state.activeTimer = setInterval(() => {
    if (state.locked) {
      return;
    }
    state.timerSeconds -= 1;
    timerEl.textContent = `${state.timerSeconds}s`;
    if (state.timerSeconds <= 0) {
      clearInterval(state.activeTimer);
      state.activeTimer = null;
      if (state.activeQuestion && isMcqQuestion(state.activeQuestion)) {
        handleChoiceAnswer(-1);
      } else {
        handleTextAnswer("");
      }
    }
  }, 1000);
}

function stopTimer() {
  if (state.activeTimer) {
    clearInterval(state.activeTimer);
    state.activeTimer = null;
  }
}

function getQuestionWeight(question) {
  const questionId = getQuestionKey(question);
  const stats = state.progressData ? state.progressData.questionStats[questionId] : null;
  const categoryStats = state.progressData
    ? state.progressData.categoryStats[question.category]
    : null;
  let weight = 1;

  if (!stats) {
    weight += 3;
  } else {
    if (stats.lastResult === "wrong") {
      weight += 4;
    }
    if (stats.seen >= 5 && stats.correct / stats.seen >= 0.8) {
      weight -= 1;
    }
    if (stats.ease && stats.ease < 2) {
      weight += 1.5;
    }
  }

  if (categoryStats && categoryStats.mastery < 0.6) {
    weight += 2;
  }

  if (state.recentQuestionIds.includes(questionId)) {
    weight -= 3;
  }

  if (questionId === state.lastQuestionKey) {
    weight -= 2;
  }

  return Math.max(0.2, weight);
}

function pickWeightedQuestion(candidates) {
  if (!candidates.length) {
    return null;
  }
  const filtered = candidates.filter(
    (question) => !state.recentQuestionIds.includes(getQuestionKey(question))
  );
  const pool = filtered.length ? filtered : candidates;
  const weights = pool.map((question) => getQuestionWeight(question));
  const total = weights.reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      return pool[i];
    }
  }
  return pool[pool.length - 1];
}

function recordRecentQuestion(question) {
  const key = getQuestionKey(question);
  state.recentQuestionIds.push(key);
  if (state.recentQuestionIds.length > RECENT_HISTORY_LIMIT) {
    state.recentQuestionIds.shift();
  }
}

function nextQuestion() {
  const available = filterQuestions();
  let question = pickWeightedQuestion(available);
  if (!question) {
    return;
  }
  if (state.mode === "match") {
    question = buildMatchQuestion(available);
  }
  const randomizedQuestion = isMcqQuestion(question) ? shuffleQuestionChoices(question) : question;
  state.lastQuestionKey = getQuestionKey(randomizedQuestion);
  recordRecentQuestion(randomizedQuestion);
  renderQuestion(randomizedQuestion);
  startTimer();
}

function triggerDeath() {
  state.locked = true;
  state.scares += 1;
  jumpscare.classList.remove("hidden");
  if (state.audioUnlocked) {
    const scream = new Audio("scream.mp3");
    scream.volume = 1;
    scream.play();
  }
  stopTimer();
}

function endNight() {
  stopTimer();
  showScreen(winScreen);
  statsEl.innerHTML = `Correct: ${state.correct} <br />Wrong: ${state.wrong} <br />Best streak: ${state.bestStreak} <br />Scares: ${state.scares}`;
  awardBadge("first-night-survived", "First Night Survived");
  if (state.night >= MAX_NIGHTS) {
    winTitleEl.textContent = "You Survived All Five Nights";
    nextNightBtn.classList.add("hidden");
  } else {
    winTitleEl.textContent = "You Survived the Night";
    nextNightBtn.classList.remove("hidden");
  }
}

function showLore() {
  if (!loreOverlay) {
    return Promise.resolve();
  }
  const segmentIndex = Math.min(state.night, MAX_NIGHTS) - 1;
  const segment = (loreByGrade[state.grade] || loreByGrade[3])[segmentIndex];
  loreNightEl.textContent = `Night ${state.night} of ${MAX_NIGHTS}`;
  loreTitleEl.textContent = segment.title;
  loreSubtitleEl.textContent = segment.text;
  loreOverlay.classList.remove("hidden");
  state.loreActive = true;

  return new Promise((resolve) => {
    const startNight = () => {
      if (!state.loreActive) {
        return;
      }
      state.loreActive = false;
      loreOverlay.classList.add("hidden");
      if (speechSynth) {
        speechSynth.cancel();
      }
      resolve();
    };

    loreContinueBtn.onclick = startNight;

    if (!speechSynth || typeof SpeechSynthesisUtterance === "undefined") {
      return;
    }

    speechSynth.cancel();
    const utterance = new SpeechSynthesisUtterance(segment.text);
    utterance.rate = 0.92;
    utterance.onend = startNight;
    state.loreUtterance = utterance;
    speechSynth.speak(utterance);
  });
}

function startGame() {
  resetState();
  configureForNight();
  updateHUD();
  updateBars();
  jumpscare.classList.add("hidden");
  showScreen(gameScreen);
  showLore().then(() => {
    nextQuestion();
  });
}

function setGrade(grade) {
  selectors.grade = grade;
  setActiveButton(gradeButtons, String(selectors.grade), "grade");
  renderCategoryOptions();
}

function applySelections() {
  state.grade = selectors.grade;
  state.mode = "night";
  const activeProfile = state.profiles.find((item) => item.id === state.profileId);
  state.playerName = activeProfile ? activeProfile.name : "Player";
  state.night = 1;
  state.questions = state.questionsByGrade[state.grade] || [];
  state.selectedCategories = selectors.categories.size
    ? Array.from(selectors.categories)
    : availableCategories.slice();
  if (state.progressData) {
    state.progressData.grade = state.grade;
  }
  if (activeProfile) {
    activeProfile.lastPlayedAt = Date.now();
    saveProfiles();
  }
}

function handleKeyboard(e) {
  if (gameScreen.classList.contains("active")) {
    const key = e.key;
    if (key === "r" || key === "R") {
      if (state.activeQuestion) {
        speakQuestion(state.activeQuestion);
      }
      return;
    }
    if (isMcqQuestion(state.activeQuestion) && key >= "1" && key <= "4") {
      handleChoiceAnswer(parseInt(key, 10) - 1);
      return;
    }
    if (key === "Enter" && state.activeInputEl && !state.locked) {
      handleTextAnswer(state.activeInputEl.value);
    }
  }
}

function startDreadPressure() {
  setInterval(() => {
    if (!gameScreen.classList.contains("active")) {
      return;
    }
    if (state.locked) {
      return;
    }
    state.dread = Math.min(100, state.dread + config.dreadRamp);
    updateBars();
  }, 100);
}

function startRandomFlicker() {
  if (!randomFlicker) {
    return;
  }
  setInterval(() => {
    if (!gameScreen.classList.contains("active")) {
      return;
    }
    if (Math.random() <= 0.65) {
      return;
    }
    randomFlicker.classList.remove("active");
    void randomFlicker.offsetWidth;
    randomFlicker.classList.add("active");
  }, 900);
}

function startListeners() {
  gradeButtons.forEach((button) =>
    button.addEventListener("click", () => setGrade(parseInt(button.dataset.grade, 10)))
  );

  startButton.addEventListener("click", () => {
    unlockAudio();
    if (!state.profileId) {
      return;
    }
    applySelections();
    startGame();
  });

  if (createProfileBtn) {
    createProfileBtn.addEventListener("click", handleCreateProfile);
  }
  if (profileNameInput) {
    profileNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleCreateProfile();
      }
    });
  }

  if (rereadBtn) {
    rereadBtn.addEventListener("click", () => {
      if (state.activeQuestion) {
        speakQuestion(state.activeQuestion);
      }
    });
  }

  nextNightBtn.addEventListener("click", () => {
    if (state.night >= MAX_NIGHTS) {
      showScreen(startScreen);
      return;
    }
    state.night += 1;
    startGame();
  });

  backHomeBtn.addEventListener("click", () => {
    showScreen(startScreen);
  });

  retryBtn.addEventListener("click", () => {
    jumpscare.classList.add("hidden");
    state.locked = false;
    startGame();
  });

  document.addEventListener("click", unlockAudio, { once: true });
  document.addEventListener("keydown", handleKeyboard);
}

async function init() {
  initSelectors();
  startListeners();
  startDreadPressure();
  startRandomFlicker();
  await loadQuestions();
  loadProfiles();
  renderProfileOptions();
  updateStartButtonState();
  renderCategoryOptions();
}

init();
