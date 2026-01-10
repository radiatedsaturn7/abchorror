const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const winScreen = document.getElementById("win-screen");
const jumpscare = document.getElementById("jumpscare");

const gradeButtons = document.querySelectorAll(".grade-options .chip");
const nameButtons = document.querySelectorAll(".name-options .chip");
const modeButtons = document.querySelectorAll(".mode-options .chip");
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
const nextNightBtn = document.getElementById("next-night");
const backHomeBtn = document.getElementById("back-home");
const powerFlicker = document.getElementById("power-flicker");
const retryBtn = document.getElementById("retry-btn");
const flickerSprite = document.getElementById("flicker-sprite");

const LETTERS = ["A", "B", "C", "D"];
const MODE_LABELS = {
  night: "Night Shift",
  speed: "Speed Round",
  match: "Match-Up",
};

const defaultConfig = {
  dreadThreshold: 100,
  wrongDread: 25,
  dreadDecay: 3,
  resetDread: 40,
  progressPerCorrect: 10,
  speedTimer: 9,
};

const state = {
  questions: [],
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
};

const config = { ...defaultConfig };
const deskScenes = ["desk1.png", "desk2.png", "desk3.png"];

const selectors = {
  grade: 3,
  mode: "night",
  name: "Mark",
};

function setActiveButton(buttons, value, key) {
  buttons.forEach((button) => {
    const isActive = button.dataset[key] === value;
    button.classList.toggle("active", isActive);
  });
}

function initSelectors() {
  setActiveButton(gradeButtons, String(selectors.grade), "grade");
  setActiveButton(modeButtons, selectors.mode, "mode");
  setActiveButton(nameButtons, selectors.name, "name");
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
  // Add new questions by editing questions.json with the schema:
  // id, gradeMin, gradeMax, category, prompt, choices[], answerIndex,
  // optional passage (reading), hint, difficulty (1-3).
  const response = await fetch("questions.json");
  const data = await response.json();
  state.questions = data;
}

function filterQuestions() {
  const difficultyCap = Math.min(3, state.night);
  return state.questions.filter((q) => {
    const inGrade = state.grade >= q.gradeMin && state.grade <= q.gradeMax;
    const inDifficulty = q.difficulty ? q.difficulty <= difficultyCap : true;
    return inGrade && inDifficulty;
  });
}

function shuffle(array) {
  return array.slice().sort(() => Math.random() - 0.5);
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
  config.dreadDecay = Math.max(1, defaultConfig.dreadDecay - (state.night - 1));
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
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.dataset.index = index;
    button.innerHTML = `<span class="choice-label">${LETTERS[index]}</span> ${choice}`;
    button.addEventListener("click", () => handleAnswer(index));
    choicesEl.appendChild(button);
  });
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
  const available = filterQuestions();
  let question = pickRandomQuestion(available);
  if (state.mode === "match") {
    question = buildMatchQuestion(available);
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
}

function startGame() {
  resetState();
  configureForNight();
  updateHUD();
  updateBars();
  jumpscare.classList.add("hidden");
  showScreen(gameScreen);
  nextQuestion();
}

function setMode(mode) {
  selectors.mode = mode;
  setActiveButton(modeButtons, selectors.mode, "mode");
  const isSpeed = mode === "speed";
  config.progressPerCorrect = isSpeed ? 10 : 10;
}

function setGrade(grade) {
  selectors.grade = grade;
  setActiveButton(gradeButtons, String(selectors.grade), "grade");
}

function setName(name) {
  selectors.name = name;
  setActiveButton(nameButtons, selectors.name, "name");
}

function applySelections() {
  state.grade = selectors.grade;
  state.mode = selectors.mode;
  state.playerName = customNameInput.value.trim() || selectors.name;
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

function startDreadDecay() {
  setInterval(() => {
    if (!gameScreen.classList.contains("active")) {
      return;
    }
    if (state.locked) {
      return;
    }
    state.dread = Math.max(0, state.dread - config.dreadDecay * 0.1);
    updateBars();
  }, 100);
}

function startListeners() {
  gradeButtons.forEach((button) =>
    button.addEventListener("click", () => setGrade(parseInt(button.dataset.grade, 10)))
  );
  nameButtons.forEach((button) =>
    button.addEventListener("click", () => setName(button.dataset.name))
  );
  modeButtons.forEach((button) =>
    button.addEventListener("click", () => setMode(button.dataset.mode))
  );

  startButton.addEventListener("click", () => {
    unlockAudio();
    applySelections();
    startGame();
  });

  nextNightBtn.addEventListener("click", () => {
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
  startDreadDecay();
  await loadQuestions();
}

init();
