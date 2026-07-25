import { describe, it, expect } from "vitest";
import {
  detectLanguage,
  detectFramework,
  detectInFunction,
  detectInClass,
  detectAfterComment,
  detectIncompletePatterns,
  analyzeCodeContext,
} from "./code-context";

describe("detectLanguage", () => {
  it("prefers the file extension when one is given", () => {
    expect(detectLanguage("whatever", "index.tsx")).toBe("TypeScript");
    expect(detectLanguage("whatever", "server.py")).toBe("Python");
    expect(detectLanguage("whatever", "main.go")).toBe("Go");
  });

  it("falls back to content sniffing when there is no filename", () => {
    expect(detectLanguage("interface User { name: string }")).toBe(
      "TypeScript"
    );
    expect(detectLanguage("def greet():\n    pass")).toBe("Python");
    expect(detectLanguage("package main\nfunc main() {}")).toBe("Go");
  });

  it("defaults to JavaScript when nothing matches", () => {
    expect(detectLanguage("const x = 1;")).toBe("JavaScript");
  });
});

describe("detectFramework", () => {
  it("detects React from useState usage", () => {
    expect(detectFramework("const [x, setX] = useState(0)")).toBe("React");
  });

  it("detects Vue from <template>", () => {
    expect(detectFramework("<template><div/></template>")).toBe("Vue");
  });

  it("detects Angular from @Component", () => {
    expect(detectFramework("@Component({ selector: 'app-root' })")).toBe(
      "Angular"
    );
  });

  it("returns None when no framework signature is present", () => {
    expect(detectFramework("console.log('hello')")).toBe("None");
  });
});

describe("detectInFunction / detectInClass", () => {
  const lines = [
    "class Widget {",
    "  function render() {",
    "    return null;",
    "  }",
    "}",
  ];

  it("recognises being inside a function body", () => {
    expect(detectInFunction(lines, 2)).toBe(true);
  });

  it("recognises being inside a class body", () => {
    expect(detectInClass(lines, 2)).toBe(true);
  });
});

describe("detectAfterComment", () => {
  it("returns true right after a // comment", () => {
    expect(detectAfterComment("const x = 1; // TODO", 21)).toBe(true);
  });

  it("returns false on a plain code line", () => {
    expect(detectAfterComment("const x = 1;", 12)).toBe(false);
  });
});

describe("detectIncompletePatterns", () => {
  it("flags an open conditional", () => {
    expect(detectIncompletePatterns("if (", 4)).toContain("conditional");
  });

  it("flags a trailing assignment", () => {
    expect(detectIncompletePatterns("const total =", 13)).toContain(
      "assignment"
    );
  });

  it("flags a trailing method call dot", () => {
    expect(detectIncompletePatterns("array.", 6)).toContain("method-call");
  });

  it("returns an empty list for a complete line", () => {
    expect(detectIncompletePatterns("const total = 5;", 17)).toEqual([]);
  });
});

describe("analyzeCodeContext", () => {
  it("assembles language, framework and cursor context together", () => {
    const content = [
      "import React from 'react'",
      "",
      "function App() {",
      "  const [count, setCount] = useState(0)",
      "  return null",
      "}",
    ].join("\n");

    const result = analyzeCodeContext(content, 3, 2, "App.tsx");

    expect(result.language).toBe("TypeScript");
    expect(result.framework).toBe("React");
    expect(result.isInFunction).toBe(true);
    expect(result.cursorPosition).toEqual({ line: 3, column: 2 });
  });
});
