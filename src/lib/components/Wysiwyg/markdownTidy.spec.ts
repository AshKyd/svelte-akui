import { describe, it, expect } from "vitest";
import { tidyMarkdown } from "./markdownTidy.js";

describe("tidyMarkdown", () => {
  it("collapses runs of blank lines to one", () => {
    expect(tidyMarkdown("a\n\n\n\n\nb")).toBe("a\n\nb");
  });

  it("treats whitespace-only lines as blank", () => {
    expect(tidyMarkdown("a\n  \n\t\nb")).toBe("a\n\nb");
  });

  it("drops &nbsp; empty paragraph markers", () => {
    expect(tidyMarkdown("a\n\n&nbsp;\n\n&nbsp;\n\nb")).toBe("a\n\nb");
  });

  it("drops trailing blank lines", () => {
    expect(tidyMarkdown("a\n\n\n")).toBe("a");
  });

  it("joins blank-separated bullet items", () => {
    expect(tidyMarkdown("- a\n\n- b\n\n\n- c")).toBe("- a\n- b\n- c");
  });

  it("joins blank-separated numbered and task items", () => {
    expect(tidyMarkdown("1. a\n\n2. b")).toBe("1. a\n2. b");
    expect(tidyMarkdown("- [ ] a\n\n- [x] b")).toBe("- [ ] a\n- [x] b");
  });

  it("keeps the blank line between a list and a following paragraph", () => {
    expect(tidyMarkdown("- a\n- b\n\n\nafter")).toBe("- a\n- b\n\nafter");
  });

  it("keeps trailing spaces (hard breaks) on text lines", () => {
    expect(tidyMarkdown("a  \nb")).toBe("a  \nb");
  });

  it("leaves fenced code untouched", () => {
    const code = "```\na\n\n\n\n- x\n\n- y\n&nbsp;\n```";
    expect(tidyMarkdown(`before\n\n\n${code}\n\n\nafter`)).toBe(
      `before\n\n${code}\n\nafter`,
    );
  });

  it("keeps the zero-width space on empty checklist items", () => {
    expect(tidyMarkdown("- [ ] ​\n\n- [ ] a")).toBe("- [ ] ​\n- [ ] a");
  });

  it("is idempotent", () => {
    const messy =
      "# T\n\n\n&nbsp;\n\n- a\n\n- b\n\n\n```\nx\n\n\n```\n\n\nend\n\n";
    const once = tidyMarkdown(messy);
    expect(tidyMarkdown(once)).toBe(once);
  });
});
