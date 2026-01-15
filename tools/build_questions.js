#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GRADES = [1, 2, 3, 4, 5];
const SUBJECTS = ["math", "reading", "spelling", "science", "social studies", "language"];
const PROFANITY = ["shit", "fuck", "bitch", "bastard", "damn", "crap", "hell", "kill", "murder"];

const NAMES = [
  "Ava",
  "Noah",
  "Liam",
  "Maya",
  "Eli",
  "Zoe",
  "Owen",
  "Sofia",
  "Milo",
  "Nia",
  "Kai",
  "Ivy",
  "Leo",
  "Aria",
  "Jude",
  "Mia",
  "Ezra",
  "Luna",
  "Theo",
  "Ruby",
];

const PLACES = [
  "library",
  "park",
  "kitchen",
  "garden",
  "museum",
  "playground",
  "beach",
  "school",
  "market",
  "river",
];

const OBJECTS = [
  "kite",
  "map",
  "flashlight",
  "backpack",
  "notebook",
  "lantern",
  "compass",
  "pencil",
  "telescope",
  "scarf",
];

const VERBS = [
  "found",
  "built",
  "painted",
  "packed",
  "shared",
  "fixed",
  "carried",
  "counted",
  "sorted",
  "measured",
];

const SPELLING_BASE = [
  "apple",
  "banana",
  "candle",
  "pencil",
  "window",
  "garden",
  "shadow",
  "light",
  "planet",
  "forest",
  "castle",
  "rocket",
  "storm",
  "market",
  "paper",
  "button",
  "teacher",
  "friend",
  "circle",
  "animal",
  "spring",
  "summer",
  "autumn",
  "winter",
  "bridge",
  "travel",
  "bottle",
  "puzzle",
  "whisper",
  "guitar",
  "family",
  "nation",
  "energy",
  "memory",
  "signal",
  "library",
  "science",
  "picture",
  "holiday",
  "mountain",
  "valley",
  "island",
  "ocean",
  "river",
  "cloud",
  "thunder",
  "silver",
  "golden",
  "little",
  "gentle",
  "bright",
  "courage",
  "journey",
  "history",
  "planetary",
  "valuable",
  "musical",
  "curious",
  "honest",
  "quiet",
  "clever",
  "curtain",
  "favorite",
  "bicycle",
  "battery",
  "helmet",
  "packet",
  "pocket",
  "market",
  "school",
  "bus",
  "train",
  "signal",
  "sample",
  "blanket",
  "forest",
  "garden",
  "tunnel",
  "ticket",
  "station",
  "cactus",
  "desert",
  "museum",
  "bridge",
  "shelter",
  "creek",
  "pioneer",
  "citizen",
  "freedom",
  "justice",
  "planet",
  "galaxy",
  "satellite",
  "gravity",
  "oxygen",
  "habitat",
  "pattern",
  "fraction",
  "decimal",
  "triangle",
  "rectangle",
  "circle",
  "compass",
  "calendar",
  "message",
  "feature",
  "texture",
  "colorful",
  "practice",
  "promise",
  "imagine",
  "discover",
  "explore",
  "invent",
  "respect",
  "community",
  "project",
  "teacher",
  "student",
  "question",
  "answer",
  "timeline",
  "chapter",
  "adventure",
  "battery",
  "volcano",
  "museum",
  "language",
  "sentence",
  "paragraph",
  "symbol",
  "whistle",
  "oatmeal",
  "pancake",
  "sandwich",
  "dolphin",
  "penguin",
  "turtle",
  "rabbit",
  "hamster",
  "kitten",
  "puppy",
  "sunrise",
  "sunset",
  "rainbow",
  "diamond",
  "feather",
  "whisper",
  "journey",
  "harbor",
  "meadow",
  "prairie",
  "prairie",
  "valiant",
  "curator",
  "festival",
  "horizon",
  "message",
];

const SPELLING_SUFFIXES = ["s", "es", "ing", "ed", "ly", "er", "est", "ful", "less"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function cleanText(value) {
  if (!value) {
    return value;
  }
  return String(value)
    .replace(/\s*\(Set\s*\d+\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fixReadingGrammar(text) {
  if (!text) {
    return text;
  }
  return text
    .replace(/Where did (.+?) packed\?/gi, "Where did $1 pack?")
    .replace(/Where did (.+?) built\?/gi, "Where did $1 build?");
}

function normalizeKey(text) {
  if (!text) {
    return "";
  }
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function normalizeAnswerKey(question) {
  if (question.answer !== undefined) {
    return normalizeKey(Array.isArray(question.answer) ? question.answer.join("|") : question.answer);
  }
  if (Array.isArray(question.choices)) {
    return normalizeKey(question.choices.join("|"));
  }
  return "";
}

function getQuestionKey(question) {
  return [
    question.category,
    question.type,
    normalizeKey(question.prompt),
    normalizeKey(question.passage),
    normalizeAnswerKey(question),
  ].join("|");
}

function getDefaultNormalize(answerType) {
  if (answerType === "number") {
    return { trim: true, caseInsensitive: false, stripPunctuation: true };
  }
  return { trim: true, caseInsensitive: true, stripPunctuation: true };
}

function extractSpellingWord(question) {
  if (typeof question.answer === "string") {
    return question.answer.trim();
  }
  const prompt = question.spokenPrompt || question.prompt || "";
  const match = prompt.match(/spell\s+([a-zA-Z'-]+)/i);
  if (match) {
    return match[1];
  }
  return null;
}

function upgradeQuestion(question, index, grade) {
  const upgraded = { ...question };
  upgraded.id = upgraded.id || `g${grade}-${index}`;
  upgraded.gradeMin = upgraded.gradeMin ?? grade;
  upgraded.gradeMax = upgraded.gradeMax ?? grade;
  upgraded.prompt = cleanText(upgraded.prompt);
  upgraded.passage = cleanText(upgraded.passage);
  upgraded.spokenPrompt = cleanText(upgraded.spokenPrompt);

  if (!upgraded.type) {
    if (upgraded.category === "spelling") {
      upgraded.type = "spelling";
    } else if (Array.isArray(upgraded.choices)) {
      upgraded.type = "mcq";
    } else if (upgraded.passage) {
      upgraded.type = "reading";
    } else {
      upgraded.type = "input";
    }
  }

  if (upgraded.type === "reading" && upgraded.prompt) {
    upgraded.prompt = fixReadingGrammar(upgraded.prompt);
  }

  if (upgraded.category === "spelling") {
    const word = extractSpellingWord(upgraded);
    if (!word) {
      return null;
    }
    upgraded.type = "spelling";
    upgraded.prompt = "Spell the word you hear.";
    upgraded.spokenPrompt = upgraded.spokenPrompt || `Spell ${word}.`;
    upgraded.answer = word;
    upgraded.answerType = "text";
    upgraded.normalize = {
      ...getDefaultNormalize("text"),
      ...(upgraded.normalize || {}),
    };
  }

  if (upgraded.type === "input") {
    upgraded.answerType = upgraded.answerType || (typeof upgraded.answer === "number" ? "number" : "text");
    upgraded.normalize = {
      ...getDefaultNormalize(upgraded.answerType),
      ...(upgraded.normalize || {}),
    };
  }

  if (upgraded.type === "reading" && !Array.isArray(upgraded.choices)) {
    upgraded.answerType = upgraded.answerType || (typeof upgraded.answer === "number" ? "number" : "text");
    upgraded.normalize = {
      ...getDefaultNormalize(upgraded.answerType),
      ...(upgraded.normalize || {}),
    };
  }

  return upgraded;
}

function isValidQuestion(question) {
  if (!question || !question.prompt || !question.category) {
    return false;
  }
  if (question.type === "mcq") {
    const choices = question.choices || [];
    return choices.length === 4 && new Set(choices).size === 4 && question.answerIndex >= 0 && question.answerIndex < 4;
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
      return question.choices.length === 4 && new Set(question.choices).size === 4 && question.answerIndex >= 0;
    }
    return question.answer !== undefined && question.answerType;
  }
  return false;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sentenceCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function generateMath(grade, count, usedIds) {
  const items = [];
  while (items.length < count) {
    const id = `math-g${grade}-${usedIds.size + items.length + 1}`;
    const type = grade <= 2 && Math.random() < 0.35 ? "mcq" : "input";
    const max = grade <= 1 ? 20 : grade === 2 ? 50 : grade === 3 ? 100 : grade === 4 ? 500 : 1000;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const operation = grade <= 2 ? (Math.random() < 0.6 ? "+" : "-") : grade === 3 ? pick(["+", "-", "×"]) : pick(["+", "-", "×", "÷"]);
    let answer = 0;
    let prompt = "";
    if (operation === "+") {
      answer = a + b;
      prompt = `What is ${a} + ${b}?`;
    } else if (operation === "-") {
      answer = Math.max(a, b) - Math.min(a, b);
      prompt = `What is ${Math.max(a, b)} - ${Math.min(a, b)}?`;
    } else if (operation === "×") {
      const x = a % 12 + 1;
      const y = b % 12 + 1;
      answer = x * y;
      prompt = `What is ${x} × ${y}?`;
    } else {
      const divisor = b % 12 + 1;
      const product = divisor * (a % 12 + 1);
      answer = product / divisor;
      prompt = `What is ${product} ÷ ${divisor}?`;
    }

    if (Math.random() < 0.35) {
      const name = pick(NAMES);
      const object = pick(OBJECTS);
      prompt = `${name} has ${a} ${object}s and gives away ${b}. How many are left?`;
      answer = Math.max(a - b, 0);
    }

    if (type === "mcq") {
      const choices = new Set([answer]);
      while (choices.size < 4) {
        let candidate = answer + Math.floor(Math.random() * 7) - 3;
        if (candidate < 0) {
          candidate = answer + Math.floor(Math.random() * 5) + 1;
        }
        choices.add(candidate);
      }
      const choiceList = Array.from(choices).map((value) => String(value));
      const answerIndex = choiceList.indexOf(String(answer));
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "math",
        type: "mcq",
        prompt: sentenceCase(prompt),
        choices: choiceList,
        answerIndex,
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    } else {
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "math",
        type: "input",
        prompt: sentenceCase(prompt),
        answer,
        answerType: "number",
        normalize: getDefaultNormalize("number"),
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    }
  }
  return items;
}

function generateSpelling(grade, count, usedIds) {
  const items = [];
  const words = new Set();
  SPELLING_BASE.forEach((word) => words.add(word));
  SPELLING_BASE.forEach((word) => {
    SPELLING_SUFFIXES.forEach((suffix) => {
      if (word.length < 4) {
        return;
      }
      if (suffix === "ing" && word.endsWith("e")) {
        words.add(`${word.slice(0, -1)}ing`);
      } else {
        words.add(`${word}${suffix}`);
      }
    });
  });
  const wordList = Array.from(words).filter((word) => word.length <= (grade <= 2 ? 8 : 14));

  while (items.length < count) {
    const word = pick(wordList);
    const id = `spelling-g${grade}-${usedIds.size + items.length + 1}`;
    items.push({
      id,
      gradeMin: grade,
      gradeMax: grade,
      category: "spelling",
      type: "spelling",
      prompt: "Spell the word you hear.",
      spokenPrompt: `Spell ${word}.`,
      answer: word,
      answerType: "text",
      normalize: getDefaultNormalize("text"),
      difficulty: Math.min(5, Math.max(1, grade - 1)),
    });
  }
  return items;
}

function generateReading(grade, count, usedIds) {
  const items = [];
  const sentenceCount = grade <= 2 ? 2 : grade === 3 ? 3 : 4;
  const questionTemplates = [
    {
      prompt: (name, place) => `Where did ${name} go after school?`,
      answer: (name, place) => place,
      answerType: "text",
    },
    {
      prompt: (name, place, object) => `Why did ${name}'s friend feel thankful?`,
      answer: (name, place, object) => `Because ${name} shared the ${object}.`,
      choices: (name, object) => [
        `Because ${name} shared the ${object}.`,
        `Because ${name} lost the ${object}.`,
        `Because ${name} hid the ${object}.`,
        `Because ${name} broke the ${object}.`,
      ],
    },
    {
      prompt: (name, place, object, verb) => `What did ${name} do with the ${object}?`,
      answer: (name, place, object, verb) => `${name} ${verb} a ${object}.`,
      answerType: "text",
    },
  ];
  while (items.length < count) {
    const name = pick(NAMES);
    const place = pick(PLACES);
    const object = pick(OBJECTS);
    const verb = pick(VERBS);
    const passage = [
      `${name} went to the ${place} after school.`,
      `${name} ${verb} a ${object} and shared it with a friend.`,
      `The friend felt thankful and helped clean up.`,
      `${name} promised to visit the ${place} again.`,
    ]
      .slice(0, sentenceCount)
      .join(" ");
    const useMcq = Math.random() < 0.55;
    const id = `reading-g${grade}-${usedIds.size + items.length + 1}`;
    if (useMcq) {
      const template = pick(questionTemplates.filter((item) => item.choices));
      const prompt = template.prompt(name, place, object, verb);
      const choiceList = template.choices(name, object);
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "reading",
        type: "reading",
        passage,
        prompt,
        choices: choiceList,
        answerIndex: 0,
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    } else {
      const template = pick(questionTemplates.filter((item) => !item.choices));
      const prompt = template.prompt(name, place, object, verb);
      const answer = template.answer(name, place, object, verb);
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "reading",
        type: "reading",
        passage,
        prompt,
        answer,
        answerType: template.answerType || "text",
        normalize: getDefaultNormalize("text"),
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    }
  }
  return items;
}

function generateLanguage(grade, count, usedIds) {
  const items = [];
  const nouns = ["cat", "teacher", "river", "mountain", "friend", "city", "planet", "song"];
  const verbs = ["runs", "jumps", "writes", "reads", "builds", "explores", "paints", "travels"];
  const adjectives = ["bright", "quiet", "brave", "gentle", "curious", "shiny", "loyal", "quick"];
  while (items.length < count) {
    const id = `language-g${grade}-${usedIds.size + items.length + 1}`;
    const useMcq = Math.random() < 0.55;
    if (useMcq) {
      const adjective = pick(adjectives);
      const sentence = `The ${adjective} ${pick(nouns)} ${pick(verbs)}.`;
      const prompt = "Which word is the adjective?";
      const choices = new Set([adjective]);
      while (choices.size < 4) {
        choices.add(pick([...nouns, ...verbs, ...adjectives]));
      }
      const choiceList = Array.from(choices);
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "language",
        type: "mcq",
        prompt: sentence + " " + prompt,
        choices: choiceList,
        answerIndex: choiceList.indexOf(adjective),
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    } else {
      const noun = pick(nouns);
      const prompt = `Write the plural form of "${noun}".`;
      const answer = noun.endsWith("s") ? `${noun}es` : `${noun}s`;
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "language",
        type: "input",
        prompt,
        answer,
        answerType: "text",
        normalize: getDefaultNormalize("text"),
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    }
  }
  return items;
}

function generateScience(grade, count, usedIds) {
  const items = [];
  const planets = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
  const animals = ["dolphin", "eagle", "turtle", "frog", "butterfly", "rabbit"];
  const planetPrompts = [
    (name) => `${name} is studying space. Which choice names a planet?`,
    (name) => `In ${name}'s report, which object is a planet?`,
    (name) => `${name} loves the night sky. Pick a planet.`,
    (name) => `${name} reads about the solar system. Which choice is a planet?`,
  ];
  while (items.length < count) {
    const id = `science-g${grade}-${usedIds.size + items.length + 1}`;
    const useMcq = Math.random() < 0.7;
    if (useMcq) {
      const correct = pick(planets);
      const name = pick(NAMES);
      const choices = new Set([correct]);
      while (choices.size < 4) {
        choices.add(pick(["Comet", "Asteroid", "Galaxy", "Star", ...planets]));
      }
      const choiceList = Array.from(choices).slice(0, 4);
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "science",
        type: "mcq",
        prompt: pick(planetPrompts)(name),
        choices: choiceList,
        answerIndex: choiceList.indexOf(correct),
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    } else {
      const animal = pick(animals);
      const prompt = `What kind of animal is a ${animal}?`;
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "science",
        type: "input",
        prompt,
        answer: "animal",
        answerType: "text",
        normalize: getDefaultNormalize("text"),
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    }
  }
  return items;
}

function generateSocialStudies(grade, count, usedIds) {
  const items = [];
  const helpers = ["firefighter", "doctor", "teacher", "farmer", "librarian", "pilot"];
  const places = ["city hall", "library", "hospital", "school", "post office"];
  const helperPrompts = [
    (name, place) => `${name} sees smoke near the ${place}. Who should help?`,
    (name) => `${name} hears a fire alarm. Which helper responds?`,
    (name) => `Which helper would ${name} call for a fire?`,
    (name, place) => `During a fire drill at the ${place}, who leads?`,
  ];
  while (items.length < count) {
    const id = `social-g${grade}-${usedIds.size + items.length + 1}`;
    const useMcq = Math.random() < 0.7;
    if (useMcq) {
      const name = pick(NAMES);
      const place = pick(places);
      const correct = pick(helpers);
      const choices = new Set([correct]);
      while (choices.size < 4) {
        choices.add(pick([...helpers, "artist", "baker", "pilot"]));
      }
      const choiceList = Array.from(choices).slice(0, 4);
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "social studies",
        type: "mcq",
        prompt: pick(helperPrompts)(name, place),
        choices: choiceList,
        answerIndex: choiceList.indexOf(correct),
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    } else {
      const place = pick(places);
      items.push({
        id,
        gradeMin: grade,
        gradeMax: grade,
        category: "social studies",
        type: "input",
        prompt: `What community place is called the "${place}"?`,
        answer: place,
        answerType: "text",
        normalize: getDefaultNormalize("text"),
        difficulty: Math.min(5, Math.max(1, grade - 1)),
      });
    }
  }
  return items;
}

function generateBySubject(grade, subject, count, usedIds) {
  switch (subject) {
    case "math":
      return generateMath(grade, count, usedIds);
    case "reading":
      return generateReading(grade, count, usedIds);
    case "spelling":
      return generateSpelling(grade, count, usedIds);
    case "science":
      return generateScience(grade, count, usedIds);
    case "social studies":
      return generateSocialStudies(grade, count, usedIds);
    case "language":
      return generateLanguage(grade, count, usedIds);
    default:
      return [];
  }
}

function checkQuality(questions) {
  const idSet = new Set();
  const promptStemCounts = new Map();
  const gradeSubjectCounts = new Map();

  questions.forEach((question) => {
    if (question.prompt.includes("(Set")) {
      throw new Error(`Prompt still contains "(Set" in ${question.id}`);
    }
    if (question.type === "spelling") {
      const lowerPrompt = question.prompt.toLowerCase();
      if (lowerPrompt.includes(question.answer.toLowerCase())) {
        throw new Error(`Spelling prompt contains answer for ${question.id}`);
      }
    }
    if (question.type === "mcq" || (question.type === "reading" && Array.isArray(question.choices))) {
      if (!Array.isArray(question.choices) || question.choices.length !== 4) {
        throw new Error(`MCQ must have 4 choices for ${question.id}`);
      }
      if (new Set(question.choices).size !== 4) {
        throw new Error(`MCQ has duplicate choices for ${question.id}`);
      }
      if (question.answerIndex < 0 || question.answerIndex >= 4) {
        throw new Error(`MCQ answer index out of range for ${question.id}`);
      }
    }
    if (question.type === "reading") {
      const minWords = question.gradeMin <= 1 ? 10 : question.gradeMin === 2 ? 15 : question.gradeMin === 3 ? 20 : question.gradeMin === 4 ? 25 : 30;
      const wordCount = question.passage.split(/\s+/).filter(Boolean).length;
      if (wordCount < minWords) {
        throw new Error(`Reading passage too short for ${question.id}`);
      }
    }
    if (idSet.has(question.id)) {
      throw new Error(`Duplicate ID: ${question.id}`);
    }
    idSet.add(question.id);

    const stem =
      question.type === "spelling"
        ? normalizeKey(question.spokenPrompt)
        : normalizeKey(question.prompt);
    if (stem) {
      promptStemCounts.set(stem, (promptStemCounts.get(stem) || 0) + 1);
    }

    const key = `${question.gradeMin}-${question.category}`;
    gradeSubjectCounts.set(key, (gradeSubjectCounts.get(key) || 0) + 1);

    const combined = `${question.prompt} ${question.passage || ""} ${question.answer || ""}`.toLowerCase();
    PROFANITY.forEach((word) => {
      if (combined.includes(word)) {
        throw new Error(`Profanity detected in ${question.id}`);
      }
    });
  });

  const totalDuplicates = Array.from(promptStemCounts.values()).reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  const duplicateRate = totalDuplicates / questions.length;
  if (duplicateRate > 0.02) {
    throw new Error(`Near-duplicate rate too high: ${(duplicateRate * 100).toFixed(2)}%`);
  }

  for (const grade of GRADES) {
    for (const subject of SUBJECTS) {
      const key = `${grade}-${subject}`;
      const count = gradeSubjectCounts.get(key) || 0;
      if (count < 500) {
        throw new Error(`Not enough items for grade ${grade} ${subject}: ${count}`);
      }
    }
  }
}

function main() {
  const report = [];
  GRADES.forEach((grade) => {
    const filePath = path.join(ROOT, `grade${grade}.json`);
    const raw = readJson(filePath);
    const cleaned = [];
    const seen = new Set();
    let removedDuplicates = 0;
    let invalidRemoved = 0;

    raw.forEach((question, index) => {
      const upgraded = upgradeQuestion(question, index, grade);
      if (!upgraded || !isValidQuestion(upgraded)) {
        invalidRemoved += 1;
        return;
      }
      const key = getQuestionKey(upgraded);
      if (seen.has(key)) {
        removedDuplicates += 1;
        return;
      }
      seen.add(key);
      cleaned.push(upgraded);
    });

    const usedIds = new Set(cleaned.map((question) => question.id));
    const bySubject = {};
    SUBJECTS.forEach((subject) => {
      bySubject[subject] = cleaned.filter((question) => question.category === subject);
      const needed = 500 - bySubject[subject].length;
      if (needed > 0) {
        const generated = generateBySubject(grade, subject, needed, usedIds);
        generated.forEach((item) => {
          if (!usedIds.has(item.id)) {
            usedIds.add(item.id);
            cleaned.push(item);
          }
        });
      }
    });

    checkQuality(cleaned);

    writeJson(filePath, cleaned);
    report.push({
      grade,
      total: cleaned.length,
      removedDuplicates,
      invalidRemoved,
    });
  });

  const byGrade = report.map((item) => `Grade ${item.grade}: ${item.total} items (removed dupes: ${item.removedDuplicates}, invalid: ${item.invalidRemoved})`);
  console.log("Build complete:\n" + byGrade.join("\n"));
}

main();
