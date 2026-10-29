// ─── Markdown → PDF blocks ────────────────────────────────────────────────────
// Minimal markdown parser covering what the assistant produces:
// headings, paragraphs, lists, GFM tables, quotes, code blocks, rules, bold text.

export interface InlineSegment {
  text: string;
  bold: boolean;
}

export interface ListItem {
  segments: InlineSegment[];
  depth: number;
  marker: string;
}

export type PdfBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: ListItem[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "quote"; text: string }
  | { type: "code"; text: string }
  | { type: "rule" };

const HEADING = /^(#{1,6})\s+(.*)$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const BULLET = /^(\s*)[-*+]\s+(.*)$/;
const ORDERED = /^(\s*)(\d+)[.)]\s+(.*)$/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const QUOTE = /^\s*>\s?(.*)$/;
const FENCE = /^\s*```/;

// ─── Text Sanitizing ──────────────────────────────────────────────────────────
// jsPDF standard fonts only support Latin-1: normalize or drop anything else.

export function sanitizeText(text: string): string {
  return text
    .replace(/[\u00A0\u2007\u2009\u202F]/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2192/g, "->")
    .replace(/[\u2022\u25CF\u25AA]/g, "-")
    .replace(/\u20AC/g, "EUR")
    .replace(/[^\n\t\u0020-\u00FF]/g, "")
    .replace(/[ \t]+\n/g, "\n");
}

// ─── Inline Parsing ───────────────────────────────────────────────────────────

function stripInline(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1");
}

export function parseInline(text: string): InlineSegment[] {
  const parts = stripInline(text).split(/\*\*(.+?)\*\*/g);
  return parts
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}

export function plainText(text: string): string {
  return parseInline(text)
    .map((segment) => segment.text)
    .join("");
}

// ─── Block Parsing ────────────────────────────────────────────────────────────

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function readTable(lines: string[], start: number): { block: PdfBlock; next: number } {
  const header = splitRow(lines[start]);
  const rows: string[][] = [];
  let index = start + 2;

  while (index < lines.length && TABLE_ROW.test(lines[index])) {
    const cells = splitRow(lines[index]);
    rows.push(header.map((_, col) => cells[col] ?? ""));
    index++;
  }
  return { block: { type: "table", header, rows }, next: index };
}

function readFence(lines: string[], start: number): { block: PdfBlock; next: number } {
  const body: string[] = [];
  let index = start + 1;

  while (index < lines.length && !FENCE.test(lines[index])) {
    body.push(lines[index]);
    index++;
  }
  return { block: { type: "code", text: body.join("\n") }, next: index + 1 };
}

function readQuote(lines: string[], start: number): { block: PdfBlock; next: number } {
  const body: string[] = [];
  let index = start;

  while (index < lines.length && QUOTE.test(lines[index])) {
    body.push((QUOTE.exec(lines[index]) as RegExpExecArray)[1]);
    index++;
  }
  return { block: { type: "quote", text: body.join(" ") }, next: index };
}

function toListItem(line: string): ListItem | null {
  const bullet = BULLET.exec(line);
  if (bullet) {
    return {
      segments: parseInline(bullet[2]),
      depth: Math.floor(bullet[1].length / 2),
      marker: "-",
    };
  }
  const ordered = ORDERED.exec(line);
  if (ordered) {
    return {
      segments: parseInline(ordered[3]),
      depth: Math.floor(ordered[1].length / 2),
      marker: `${ordered[2]}.`,
    };
  }
  return null;
}

function readList(lines: string[], start: number): { block: PdfBlock; next: number } {
  const items: ListItem[] = [];
  let index = start;

  while (index < lines.length) {
    const item = toListItem(lines[index]);
    if (!item) break;
    items.push(item);
    index++;
  }
  return { block: { type: "list", items }, next: index };
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index];
  return (
    HEADING.test(line) ||
    RULE.test(line) ||
    FENCE.test(line) ||
    QUOTE.test(line) ||
    toListItem(line) !== null ||
    (TABLE_ROW.test(line) && TABLE_SEP.test(lines[index + 1] ?? ""))
  );
}

function readParagraph(lines: string[], start: number): { block: PdfBlock; next: number } {
  const body: string[] = [lines[start].trim()];
  let index = start + 1;

  while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
    body.push(lines[index].trim());
    index++;
  }
  return { block: { type: "paragraph", text: body.join(" ") }, next: index };
}

function readBlock(lines: string[], index: number): { block: PdfBlock; next: number } {
  const line = lines[index];
  const heading = HEADING.exec(line);

  if (heading) {
    return {
      block: { type: "heading", level: heading[1].length, text: heading[2].trim() },
      next: index + 1,
    };
  }
  if (FENCE.test(line)) return readFence(lines, index);
  if (RULE.test(line)) return { block: { type: "rule" }, next: index + 1 };
  if (TABLE_ROW.test(line) && TABLE_SEP.test(lines[index + 1] ?? "")) {
    return readTable(lines, index);
  }
  if (QUOTE.test(line)) return readQuote(lines, index);
  if (toListItem(line)) return readList(lines, index);
  return readParagraph(lines, index);
}

export function parseBlocks(markdown: string): PdfBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: PdfBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    if (!lines[index].trim()) {
      index++;
      continue;
    }
    const result = readBlock(lines, index);
    blocks.push(result.block);
    index = result.next;
  }
  return blocks;
}
