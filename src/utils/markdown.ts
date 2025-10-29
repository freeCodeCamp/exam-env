import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";

Prism.manual = true;

marked.use(
  markedHighlight({
    highlight: (code, lang) => {
      if (Prism.languages[lang]) {
        return Prism.highlight(code, Prism.languages[lang], String(lang));
      } else {
        return code;
      }
    },
  })
);

export function parseMarkdown(markdown: unknown): string {
  switch (typeof markdown) {
    case "undefined":
      console.error("received undefined markdown");
      return "undefined";
    case "object":
      console.error("received object instead of string markdown", markdown);
      const repr = JSON.stringify(markdown);
      return marked.parse(repr, { async: false, gfm: true });
    case "boolean":
      console.warn("received boolean instead of string markdown", markdown);
      return markdown ? "true" : "false";
    case "number":
      console.warn("received number instead of string markdown", markdown);
      return markdown.toString();
    case "string":
      return marked.parse(markdown, { async: false, gfm: true });
    default:
      console.error("received unknown type of markdown", markdown);
      return "unknown";
  }
}
