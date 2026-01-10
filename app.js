const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const winScreen = document.getElementById("win-screen");
const jumpscare = document.getElementById("jumpscare");

const gradeButtons = document.querySelectorAll(".grade-options .chip");
const customNameInput = document.getElementById("custom-name");
const startButton = document.getElementById("start-btn");

const progressBar = document.getElementById("progress-bar");
const dreadBar = document.getElementById("dread-bar");
const categoryBadge = document.getElementById("category");
const promptEl = document.getElementById("prompt");
const passageEl = document.getElementById("passage");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const timerEl = document.getElementById("timer");
const playerNameEl = document.getElementById("player-name");
const modeLabelEl = document.getElementById("mode-label");
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
const MAX_NIGHTS = 5;
const GRADE_FILES = {
  1: "grade1.json",
  2: "grade2.json",
  3: "grade3.json",
  4: "grade4.json",
  5: "grade5.json",
};

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
  questionQueue: [],
  loreActive: false,
  loreUtterance: null,
};

const config = { ...defaultConfig };
const deskScenes = ["desk1.png", "desk2.png", "desk3.png"];
const speechSynth = window.speechSynthesis || null;

const selectors = {
  grade: 3,
};

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

async function loadQuestions() {
  // Add new questions by editing grade*.json with the schema:
  // id, gradeMin, gradeMax, category, prompt, choices[], answerIndex,
  // optional passage (reading), hint, difficulty (1-3).
  const entries = await Promise.all(
    Object.entries(GRADE_FILES).map(async ([grade, file]) => {
      const response = await fetch(file);
      const data = await response.json();
      const gradeValue = parseInt(grade, 10);
      const inGrade = data.filter(
        (question) => gradeValue >= question.gradeMin && gradeValue <= question.gradeMax
      );
      const trimmed = inGrade.length > 500 ? shuffle(inGrade).slice(0, 500) : inGrade;
      return [gradeValue, trimmed];
    })
  );
  state.questionsByGrade = Object.fromEntries(entries);
  state.questions = state.questionsByGrade[state.grade] || [];
}

function filterQuestions() {
  const difficultyCap = Math.min(3, state.night);
  const inGradeQuestions = state.questions.filter((q) => {
    const inGrade = state.grade >= q.gradeMin && state.grade <= q.gradeMax;
    return inGrade;
  });
  const filtered = inGradeQuestions.filter((q) =>
    q.difficulty ? q.difficulty <= difficultyCap : true
  );
  if (!filtered.length) {
    return inGradeQuestions;
  }
  if (filtered.length < 10 && difficultyCap < 3) {
    const relaxed = inGradeQuestions.filter((q) =>
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

function pickRandomQuestion(questions) {
  return questions[Math.floor(Math.random() * questions.length)];
}

function buildMatchQuestion(questions) {
  const carQuestions = questions.filter((q) => q.category === "cars");
  const vocabQuestions = questions.filter((q) => q.category === "other");
  const sourcePool = carQuestions.length > 2 ? carQuestions : vocabQuestions;
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
  state.questionQueue = [];
  state.loreActive = false;
  state.loreUtterance = null;
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

function renderQuestion(question) {
  state.activeQuestion = question;
  categoryBadge.textContent = question.category.toUpperCase();
  promptEl.textContent = question.prompt;
  if (question.passage) {
    passageEl.textContent = question.passage;
    passageEl.classList.remove("hidden");
  } else {
    passageEl.classList.add("hidden");
  }
  choicesEl.innerHTML = "";
  question.choices.forEach((choice, index) => {
    const row = document.createElement("div");
    row.className = "choice-row";
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.dataset.index = index;
    button.innerHTML = `<span class="choice-label">${LETTERS[index]}</span> ${choice}`;
    button.addEventListener("click", () => handleAnswer(index));
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
  speakText(question.prompt);
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

function handleAnswer(index) {
  if (state.locked) {
    return;
  }
  state.locked = true;
  state.questionsAnswered += 1;
  const isCorrect = index === state.activeQuestion.answerIndex;

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
    showFeedback("Not quite", "wrong", state.activeQuestion.hint);
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
      handleAnswer(-1);
    }
  }, 1000);
}

function stopTimer() {
  if (state.activeTimer) {
    clearInterval(state.activeTimer);
    state.activeTimer = null;
  }
}

function nextQuestion() {
  if (!state.questionQueue.length) {
    state.questionQueue = shuffle(filterQuestions());
  }
  const available = state.questionQueue.length ? state.questionQueue : filterQuestions();
  let question = available.shift();
  if (!question) {
    return;
  }
  if (state.mode === "match") {
    question = buildMatchQuestion(filterQuestions());
  }
  renderQuestion(question);
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
  state.questionQueue = shuffle(filterQuestions());
  showLore().then(() => {
    nextQuestion();
  });
}

function setGrade(grade) {
  selectors.grade = grade;
  setActiveButton(gradeButtons, String(selectors.grade), "grade");
}

function applySelections() {
  state.grade = selectors.grade;
  state.mode = "night";
  state.playerName = customNameInput.value.trim() || "Player";
  state.night = 1;
  state.questions = state.questionsByGrade[state.grade] || [];
}

function handleKeyboard(e) {
  if (gameScreen.classList.contains("active")) {
    const key = e.key;
    if (key >= "1" && key <= "4") {
      handleAnswer(parseInt(key, 10) - 1);
    }
    if (key === "Enter" && feedbackEl.classList.contains("hidden") === false) {
      state.locked = false;
      clearFeedback();
      nextQuestion();
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
    applySelections();
    startGame();
  });

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
}

init();
