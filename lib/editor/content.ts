import type { JSONContent } from "@tiptap/react";

export const emptyDocumentContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph"
    }
  ]
};

export function starterContent(title: string, bullets: string[]): JSONContent {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: title }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Draft the decision, not just the meeting notes." }]
      },
      {
        type: "bulletList",
        content: bullets.map((text) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text }] }]
        }))
      }
    ]
  };
}

export function textToTiptapDocument(text: string): JSONContent {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return emptyDocumentContent;
  }

  return {
    type: "doc",
    content: blocks.map((block) => {
      if (block.startsWith("# ")) {
        return {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: block.slice(2).trim() }]
        };
      }

      if (block.startsWith("## ")) {
        return {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: block.slice(3).trim() }]
        };
      }

      const bulletLines = block.split("\n").filter((line) => /^[-*]\s+/.test(line.trim()));
      if (bulletLines.length > 0 && bulletLines.length === block.split("\n").length) {
        return {
          type: "bulletList",
          content: bulletLines.map((line) => ({
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: line.replace(/^[-*]\s+/, "").trim() }]
              }
            ]
          }))
        };
      }

      return {
        type: "paragraph",
        content: [{ type: "text", text: block.replace(/\n/g, " ") }]
      };
    })
  };
}

export function tiptapToPlainText(content: JSONContent): string {
  const fragments: string[] = [];

  function visit(node: JSONContent) {
    if (node.text) {
      fragments.push(node.text);
    }
    if (node.type === "paragraph" || node.type === "heading" || node.type === "listItem") {
      fragments.push(" ");
    }
    node.content?.forEach(visit);
  }

  visit(content);
  return fragments.join("").replace(/\s+/g, " ").trim();
}
