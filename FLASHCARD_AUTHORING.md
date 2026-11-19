# Osmosis key-point card authoring guide

Use this guide when turning an Osmosis question-bank JSON file into a separate key-point card JSON file. These are **one-sided topic previews**, not recall prompts: learners read each concise note and cycle rapidly to build a mental map before taking the related MCQs.

## Source and synthesis rules

- Read the whole supplied question bank, then group its parent questions by their exact `chapter` and `topic` labels. Variants are alternate phrasings of parent questions, not additional coverage.
- Produce one or a few cards per topic, not one card per question. Combine complementary questions into a clear overview of the topic's basic structure: what the main entities are, how they relate, the central process or mechanism, and the key distinction needed to make sense of the topic.
- Start with prerequisite framing where useful: define the core objects, orient directions/roles, then explain how they fit together. A learner should be less “blindfolded” when they start MCQs.
- Include enough detail to create a useful mental model, but keep each point scannable (usually 2–5 short sentences or a compact mini-outline). Use explicit names and causal links; avoid cryptic fragments and unexplained abbreviations.
- Derive only information supported by the questions and their explanations. Do not invent facts, answers, or broad textbook context. Preserve important contrasts and relationships that recur across questions.
- Cards are informational notes only: no question on a front, no answer/back side, no reveal mechanic, and no quiz or cloze wording. The app displays the `point` immediately and moves to the next card.
- Use stable, exact `chapter` and `topic` values copied from the source bank, so the app's filters align with question scopes. `id` should be stable and unique, e.g. `ch01-membranes-overview`.
- If a topic is too broad for one readable point, split it into a small ordered set of useful subtopic cards. Avoid duplicate points and avoid splitting merely to mirror individual MCQs.

## Output format

Return valid JSON only: a top-level array (or an object containing a `cards` array). Each card has these fields:

```json
[
  {
    "id": "ch01-membranes-overview",
    "chapter": "Chapter 1: Cell biology",
    "topic": "Membranes",
    "point": "Cell membranes are selectively permeable boundaries. Passive processes such as diffusion move substances down their concentration gradients; moving a substance against its gradient requires energy, either directly or through coupled transport. Water movement by osmosis follows differences in effective solute concentration, which explains why cells swell or shrink in different solutions."
  }
]
```

`point` may also be called `keyPoint` or `content` by some pipelines, but `point` is preferred. Do not include `front`, `back`, question options, or answer indexes. Validate JSON syntax, unique IDs, non-empty chapter/topic/point fields, and that every card's topic exists in the source questions.

## Copy/paste agent brief

```text
You are creating one-sided Osmosis key-point preview cards from a question-bank JSON file.

SOURCE
I will provide a JSON question bank. Use only information contained in its parent questions and explanations. Variants are alternate phrasings, not extra question coverage.

TASK
Group questions by their exact chapter and topic labels. Create one or a few concise cards per topic that synthesize the background a learner needs to understand the topic's questions: define the main entities, show how they relate, explain the basic structure/process, orient important directions or roles, and clarify recurring contrasts. Make a coherent mental map before practice, rather than simply repeating isolated answers.

CARD RULES
- Cards are informational notes, not quiz prompts: no question, answer/back side, reveal interaction, or cloze.
- One card may synthesize several questions. Do not create one card per MCQ.
- Usually write 2–5 short sentences or a compact mini-outline per card. Make it useful at a glance, with clear causal links and terms explained in context.
- Keep all facts grounded in the supplied question and explanation text. Do not add outside knowledge.
- Copy exact chapter/topic labels. Split only when a topic needs a few distinct, readable overview points; do not mirror each question mechanically.
- IDs must be stable and unique, such as `ch01-membranes-overview`.

OUTPUT
Return valid JSON only, as a top-level array of objects with exactly these fields: `id`, `chapter`, `topic`, `point`. No Markdown fences or prose. Check syntax, IDs, required fields, topic labels, and source support before returning.

QUESTION BANK JSON:
[paste the full question-bank JSON here]
```
