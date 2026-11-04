/** Bricht einen Namen für die Taste um, weil das Stream Deck lange Titel einfach abschneidet. */
export function wrapTitle(text: string, maxChars = 9, maxLines = 3): string {
  const lines: string[] = [];
  let line = "";
  for (const word of text.trim().split(/\s+/)) {
    let rest = word;
    if (line && line.length + 1 + rest.length <= maxChars) {
      line += ` ${rest}`;
      continue;
    }
    if (line) lines.push(line);
    while (rest.length > maxChars) {
      lines.push(rest.slice(0, maxChars));
      rest = rest.slice(maxChars);
    }
    line = rest;
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines.join("\n");

  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].slice(0, maxChars - 1)}…`;
  return kept.join("\n");
}
