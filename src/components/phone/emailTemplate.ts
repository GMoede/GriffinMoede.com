// The fill-in-the-blanks email offered after Griffin hangs up. Every
// [Something] becomes a blank for the visitor to fill in, labelled
// "Something". The [Name] after the closing "From," at the end is a dropdown
// of SENDER_NAMES instead, with a "Custom" choice for typing their own.
//
// PLACEHOLDER: replace this with the real draft.
export const EMAIL_TEMPLATE = `Dear Griffin,

I tried to call you today, but you were too [Adjective] to talk. I wanted to tell you about my [Noun], which is [Adjective] and smells like [Food].

Please call me back before [Day of the week], or I will [Verb] your [Noun] into the sea.

From,
[Name]`;

export const SENDER_NAMES = ["Joe", "Steve", "Frank", "Marty"];

export type Part =
  | { kind: "text"; text: string }
  | { kind: "blank"; label: string; index: number }
  | { kind: "sender" };

// Splits the template into plain text and blanks. Blanks are numbered in
// order so two with the same label stay separate.
export const parseTemplate = (template: string): Part[] => {
  const parts: Part[] = [];
  let last = 0;
  let index = 0;
  const matches = [...template.matchAll(/\[([^\]]+)\]/g)];
  matches.forEach((m, i) => {
    if (m.index > last) parts.push({ kind: "text", text: template.slice(last, m.index) });
    const label = m[1].trim();
    // Only the closing signature is the name dropdown; a [Name] elsewhere is
    // an ordinary blank.
    const isSender = i == matches.length - 1 && label.toLowerCase() == "name";
    parts.push(isSender ? { kind: "sender" } : { kind: "blank", label, index: index++ });
    last = m.index + m[0].length;
  });
  if (last < template.length) parts.push({ kind: "text", text: template.slice(last) });
  return parts;
};
