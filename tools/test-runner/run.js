const assert = require("assert/strict");
const {
  evaluateAnswer,
  getDefaultNormalize,
  normalizeAnswer,
  normalizeInput,
  normalizeNumericInput,
} = require("../../question-utils");

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("normalizeInput trims and lowercases text", () => {
  const settings = getDefaultNormalize("text");
  assert.equal(normalizeInput("  SpOoKy!!! ", settings), "spooky");
});

test("normalizeNumericInput preserves decimals", () => {
  const settings = getDefaultNormalize("number");
  assert.equal(normalizeNumericInput(" 3.5 ", settings), "3.5");
});

test("normalizeAnswer parses decimal numbers", () => {
  const question = {
    answerType: "number",
    normalize: getDefaultNormalize("number"),
  };
  assert.equal(normalizeAnswer(question, "3.5"), 3.5);
});

test("evaluateAnswer accepts negative numeric answers", () => {
  const question = {
    type: "input",
    answerType: "number",
    answer: -4,
    normalize: getDefaultNormalize("number"),
  };
  assert.equal(evaluateAnswer(question, "-4"), true);
});

console.log("All dashboard tests passed.");
