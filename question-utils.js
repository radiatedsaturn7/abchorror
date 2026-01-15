(function initQuestionUtils(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.QuestionUtils = factory();
  }
})(typeof self !== "undefined" ? self : this, function createQuestionUtils() {
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

  function normalizeNumericInput(value, settings) {
    let normalized = String(value ?? "");
    if (settings.trim) {
      normalized = normalized.trim();
    }
    normalized = normalized.replace(/,/g, "");
    normalized = normalized.replace(/[^0-9.-]/g, "");
    return normalized;
  }

  function normalizeAnswer(question, answer) {
    const settings = question.normalize || getDefaultNormalize(question.answerType || "text");
    if (question.answerType === "number") {
      const normalized = normalizeNumericInput(answer, settings);
      if (normalized === "" || normalized === "-" || normalized === "." || normalized === "-.") {
        return null;
      }
      const parsed = parseFloat(normalized);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return normalizeInput(answer, settings);
  }

  function evaluateAnswer(question, userAnswer) {
    if (question.type === "mcq" || (question.type === "reading" && Array.isArray(question.choices))) {
      return userAnswer === question.answerIndex;
    }
    const normalized = normalizeAnswer(question, userAnswer);
    if (normalized === null || normalized === "") {
      return false;
    }
    const accepted = Array.isArray(question.answer) ? question.answer : [question.answer];
    if (question.answerType === "number") {
      const normalizedAccepted = accepted
        .map((value) => {
          const cleaned = normalizeNumericInput(value, getDefaultNormalize("number"));
          if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") {
            return null;
          }
          const parsed = parseFloat(cleaned);
          return Number.isNaN(parsed) ? null : parsed;
        })
        .filter((value) => value !== null);
      return normalizedAccepted.some((value) => value === normalized);
    }
    const acceptedNormalized = accepted.map((value) =>
      normalizeInput(value, question.normalize || getDefaultNormalize("text"))
    );
    return acceptedNormalized.some((value) => value === normalized);
  }

  return {
    evaluateAnswer,
    getDefaultNormalize,
    normalizeAnswer,
    normalizeInput,
    normalizeNumericInput,
  };
});
