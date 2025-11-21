import { visit } from "unist-util-visit";
import type { Heading, Root } from "mdast";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");

const extractText = (node: any): string => {
  if (!node) return "";
  if (node.type === "text" && typeof node.value === "string") {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join(" ");
  }
  return "";
};

export function remarkHeadingIds() {
  return (tree: Root) => {
    visit(tree, "heading", (node: Heading) => {
      const text = extractText(node);
      const id = slugify(text);
      node.data ??= {};
      node.data.hProperties ??= {};

      if (!node.data.id) {
        node.data.id = id;
      }
      // @ts-expect-error - hProperties can be any record
      if (!node.data.hProperties.id) {
        node.data.hProperties.id = id;
      }
    });
  };
}
