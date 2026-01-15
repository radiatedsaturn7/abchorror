# ABC Horror

## Question schema
Each question item should follow one of these explicit types:

### `mcq`
Required fields:
- `id`
- `gradeMin`, `gradeMax`
- `category`
- `type`: `"mcq"`
- `prompt`
- `choices`: array of **exactly 4** strings
- `answerIndex`: index into `choices`

Optional fields: `passage`, `spokenPrompt`, `hint`, `difficulty` (1–5), `tags`, `explanation`.

### `input`
Required fields:
- `id`
- `gradeMin`, `gradeMax`
- `category`
- `type`: `"input"`
- `prompt`
- `answer`: string, number, or array of accepted answers
- `answerType`: `"text"` or `"number"`
- `normalize`: `{ trim: true, caseInsensitive: true, stripPunctuation: true }` (defaults by `answerType`)

Optional fields: `spokenPrompt`, `passage`, `hint`, `difficulty`, `explanation`.

### `spelling`
Required fields:
- `id`
- `gradeMin`, `gradeMax`
- `category`: `"spelling"`
- `type`: `"spelling"`
- `prompt`: on-screen text like `"Spell the word you hear."`
- `spokenPrompt`: must include the target word, e.g. `"Spell banana."`
- `answer`: the correct spelling

Optional fields: `difficulty`, `hint`, `explanation`.

### `reading`
Required fields:
- `id`
- `gradeMin`, `gradeMax`
- `category`: `"reading"`
- `type`: `"reading"`
- `passage`
- `prompt`

Reading can be **either**:
- MCQ style (`choices` + `answerIndex`)
- Input style (`answer` + `answerType`)

## Content build tool
`tools/build_questions.js` cleans and expands question banks for grades 1–5.

It will:
- Remove `(Set N)` suffix artifacts and normalize whitespace.
- Fix a few known reading grammar issues.
- Deduplicate near-identical items.
- Convert spelling prompts to the `spelling` schema.
- Generate additional items to reach 500 per subject per grade.
- Enforce quality gates (no prompt leaks, MCQ integrity, minimum passage length, duplicate ID checks).

Run it from the repo root:

```bash
node tools/build_questions.js
```

The script overwrites `grade1.json` through `grade5.json` with cleaned + generated content.
