import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";

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

export function parseMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false, gfm: true });
}
