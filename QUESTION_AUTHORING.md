# Osmosis question-authoring instructions

Use the **Download format** button in Osmosis → Settings to get the machine-readable schema example, or use the reference below. This guide is a copy/paste brief for another AI agent. Give the agent the chapter text or your permitted source notes as well; the schema alone does not contain course material.

## Recommended workflow: 100 per chapter in four batches

Ask for four separate JSON files of **25 parent questions each** for every chapter. Import each file into the same Osmosis bank. This avoids oversized responses and makes it easier to validate, regenerate, or correct one batch. A `variants` item is an alternate wording of its parent idea, not another parent question; variants do not count toward the 100.

Suggested filenames:

```text
chapter-01-batch-01.json
chapter-01-batch-02.json
chapter-01-batch-03.json
chapter-01-batch-04.json
```

Use unique, stable IDs across every batch, for example `ch01-q001` through `ch01-q100`. Do not reuse IDs when regenerating a batch; either retain the IDs for the same ideas or deliberately replace that batch.

## Copy/paste brief for a question-writing agent

```text
You are writing a high-coverage multiple-choice question bank for Osmosis.

SOURCE MATERIAL
Use only the chapter material I provide below. Do not invent facts or rely on outside knowledge to fill gaps. If the source does not support a requested detail, omit it and tell me what coverage is missing.

CHAPTER
[chapter name and number]

BATCH
Write batch [1, 2, 3, or 4] of 4. Return exactly 25 parent-question objects in this batch. Across all four batches, target 100 distinct parent questions for this chapter. Do not repeat concepts already covered by these IDs/topics: [optional list from earlier batches].

REQUIREMENTS
- Return valid JSON only: a top-level array, no Markdown fences, comments, or prose.
- Every object must have: id, chapter, topic, keywords, question, options, answer, explanation, variants.
- Give each parent question one distinct, testable idea. Cover definitions, mechanisms, comparisons, applications, exceptions, and implications supported by the supplied material; avoid padding and near-duplicate questions.
- Use 4 answer options, exactly one best answer, and plausible but clearly incorrect distractors. Do not use “all/none of the above,” trick wording, or clues from option length/grammar.
- `answer` is a zero-based integer index into `options` (0=A, 1=B, 2=C, 3=D). Balance correct positions across the batch: aim for 6 or 7 of each index over 25, shuffled without an obvious cycle. Never put the right answer at a fixed index.
- `explanation` should briefly state why the correct answer is right, grounded in the source, and clarify the key distinction when useful.
- `topic` should be a concise, reusable cluster label. `keywords` should be 2–5 short, lowercase concept terms that aid linking related ideas.
- Include 0–2 `variants` only when you can express the *same underlying idea* in a genuinely different way. A variant has its own `question`, `options`, and zero-based `answer`; it may also have an `explanation`. Do not put a second concept in a variant. The app chooses at most one version of a parent question in a run.
- IDs must be unique and stable: use `[chapter-prefix]-q[three-digit sequence]`, continuing the sequence across batches (for example, batch 2 starts at q026).
- Before returning, validate JSON syntax, all answer indexes, all required fields, and uniqueness of IDs. Do not add fields not listed above.

OUTPUT
Return only the 25-object JSON array for this batch.

SOURCE TEXT / NOTES
[paste one chapter or a manageable excerpt here]
```

## Osmosis import schema

```json
[
  {
    "id": "ch01-q001",
    "chapter": "Chapter 1: Example",
    "topic": "Core concept",
    "keywords": ["concept one", "mechanism"],
    "question": "Which statement best describes the process?",
    "options": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "answer": 2,
    "explanation": "The source describes ...",
    "variants": [
      {
        "question": "In a different scenario, what does the same process predict?",
        "options": ["Choice A", "Choice B", "Choice C", "Choice D"],
        "answer": 0,
        "explanation": "This is the same idea because ..."
      }
    ]
  }
]
```

An import may be either the JSON array above or an object with a `questions` array. Keep parent questions and their variants together. Paste the JSON into **Question bank → Import questions**, or choose the `.json` file. Imports append to the existing bank; check IDs and topic labels before importing a regenerated batch to avoid duplicates.
