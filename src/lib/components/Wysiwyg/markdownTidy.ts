/** A line that opens a fenced code block, or closes one. */
const FENCE_LINE = /^[ \t]*(```|~~~)/;

/** A bullet, numbered or task list item line (any indent). */
const LIST_ITEM_LINE = /^[ \t]*(?:[-*+]|\d+[.)])[ \t]/;

/** `* * *`, which starts like a bullet item but is a divider. */
const THEMATIC_BREAK_LINE = /^[ \t]*([-*_])([ \t]*\1){2,}[ \t]*$/;

/** A line holding only the `&nbsp;` marker Tiptap writes for an empty paragraph. */
const EMPTY_PARAGRAPH_LINE = /^[ \t]*(?:&nbsp;| )[ \t]*$/;

const isBlank = (line: string) => line.trim() === "";

/**
 * Tidies the whitespace of a markdown body, leaving fenced code blocks untouched.
 *
 * Why it exists: `@tiptap/markdown` turns every extra blank line into an empty paragraph when it
 * loads, and writes each one back as blank lines plus `&nbsp;`, so notes only ever gain
 * whitespace. It also loads blank-line-separated list items as one list per item. Running this on
 * both load and save keeps the stored text and the document stable:
 *
 * - whitespace-only and `&nbsp;`-only lines become empty lines
 * - runs of empty lines collapse to one
 * - empty lines between two list items are removed, so they load as a single list
 * - leading and trailing empty lines are dropped
 *
 * Trailing spaces on text lines are kept: two of them are a markdown hard break.
 * Idempotent.
 */
export function tidyMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const kept: string[] = [];
  let insideFence = false;

  // Blank lines seen since the last kept text line, held back until we know what follows.
  let pendingBlankLines = 0;

  /** Whether the last kept line is a list item, and so a blank line after it may be dropped. */
  const lastKeptIsListItem = () =>
    kept.length > 0 && LIST_ITEM_LINE.test(kept[kept.length - 1]);

  lines.forEach((rawLine) => {
    const line = rawLine.replace(/\r$/, "");

    // Fenced code: copy verbatim, including its blank lines.
    if (FENCE_LINE.test(line)) {
      if (!insideFence && pendingBlankLines > 0 && kept.length > 0)
        kept.push("");
      pendingBlankLines = 0;
      insideFence = !insideFence;
      kept.push(line);
      return;
    }
    if (insideFence) {
      kept.push(line);
      return;
    }

    // Outside code: blank and `&nbsp;` lines are only counted.
    if (isBlank(line) || EMPTY_PARAGRAPH_LINE.test(line)) {
      pendingBlankLines += 1;
      return;
    }

    // Two list items with only blank lines between them are one list.
    const joinsList =
      LIST_ITEM_LINE.test(line) &&
      !THEMATIC_BREAK_LINE.test(line) &&
      lastKeptIsListItem();
    // Leading blank lines are dropped (nothing kept yet).
    if (pendingBlankLines > 0 && kept.length > 0 && !joinsList) kept.push("");
    pendingBlankLines = 0;
    kept.push(line);
  });

  // Blank lines still pending here are trailing, so they are dropped.
  return kept.join("\n");
}
