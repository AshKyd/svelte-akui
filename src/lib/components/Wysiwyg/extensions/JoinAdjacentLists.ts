import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Node as ProseNode } from "@tiptap/pm/model";

const LIST_TYPES = new Set(["bulletList", "orderedList", "taskList"]);

/** Two neighbouring lists that read as one list in markdown. */
const shouldJoin = (before: ProseNode, after: ProseNode) =>
  before.type === after.type &&
  LIST_TYPES.has(before.type.name) &&
  before.attrs.type === after.attrs.type;

/**
 * Keeps neighbouring lists of the same kind as one list.
 *
 * Why: markdown has no way to write two bullet lists back to back, so a document that holds them
 * saves as one list and reloads as one. Pasting or loading old notes can still leave one list per
 * item, which breaks the completed-tasks section and adds blank lines on save. Joining them
 * keeps the document the same as what a reload would give.
 */
export const JoinAdjacentLists = Extension.create({
  name: "akuiJoinAdjacentLists",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("akuiJoinAdjacentLists"),
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) return null;

          // Positions of the boundary between two joinable lists, found anywhere in the document.
          const boundaries: number[] = [];
          newState.doc.descendants((node, pos) => {
            if (node.isTextblock) return false;
            node.forEach((child, offset, index) => {
              if (index === 0) return;
              const before = node.child(index - 1);
              if (!shouldJoin(before, child)) return;
              // `pos` is the node's start in the doc; the top-level doc itself has no opening token.
              const contentStart = node.type.name === "doc" ? 0 : pos + 1;
              boundaries.push(contentStart + offset);
            });
            return true;
          });
          if (boundaries.length === 0) return null;

          // Join from the end so earlier positions stay valid.
          const tr = newState.tr;
          boundaries.reverse().forEach((boundary) => tr.join(boundary));

          // Loading a value (setContent with emitUpdate: false) is not the user typing.
          if (transactions.some((t) => t.getMeta("preventUpdate"))) {
            tr.setMeta("preventUpdate", true);
          }
          return tr;
        },
      }),
    ];
  },
});
