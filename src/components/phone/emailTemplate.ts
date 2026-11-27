// The fill-in-the-blanks email offered after Griffin hangs up. Every
// [Something] becomes a blank for the visitor to fill in, labelled
// "Something". The [Name] signing it off at the very end is a dropdown of
// SENDER_NAMES instead, with a "Custom" choice for typing their own.
export const EMAIL_TEMPLATE = `Dear Griffin,

I was the one who just called and I wanted to continue our fun conversation. You seem like a [Adjective] person. I am interested in your [Noun] and your collection of antique faux fruit. I think we might have [Noun] in our future. I wanted to see if you could [Verb]. In a platonic way, I find you very attractive. I would not invite you over to dinner if I was cooking [Food]. I hope we are now on clear terms.

With humble gratitude,
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
