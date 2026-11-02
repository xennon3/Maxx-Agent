// Replies that end the turn without being an answer. Some servers hand the
// model's thinking over as the reply (DeepSeek on a server whose reasoning
// parser missed it), some stop mid-sentence, some run out of room. Maxx used
// to take those as "done"; now it asks the model to carry on, and tells the
// user when that doesn't help.

export type Unfinished = "length" | "empty" | "thinking" | "cut";

// How many times a turn asks the model to finish before it gives up.
export const FINISH_TRIES = 2;

// Thinking out loud: how reasoning tends to start, and the words it is full of.
const OPENER = /^(okay|ok|alright|hmm+|so,|wait|let me|let's|i need to|i should|i'll|i will|i keep|i think|i'm going to|i am going to|first,? i|now,? i|the user (wants|asked|is asking|said|needs))\b/i;
const MARKERS = /\b(wait,|let me|i'll|i need to|i should|actually,|hmm+|i keep|maybe i)\b/gi;
// How a finished reply can end: punctuation, a closing bracket or quote, Markdown emphasis or a table, a fence.
const ENDED = /[.!?)\]}"'`*_|>…]\s*$|```\s*$|[\p{Emoji_Presentation}]\s*$/u;
// Ends on a lead-in to something that never came.
const LEAD_IN = /([:,;]|\b(and|the|to|a|an|of|with|via|for|then|so))\s*$/i;

export function unfinished(content: string, finish?: string): Unfinished | null {
  if (finish === "length") return "length";
  const t = content.trim();
  if (!t) return "empty";
  // An odd number of fences: a code block that never closed.
  if ((t.match(/^\s*```/gm)?.length ?? 0) % 2 === 1) return "cut";
  // Thinking runs on; a short "ok" or "Done" is an answer.
  const thinky = t.length >= 160 && (OPENER.test(t) || (t.match(MARKERS)?.length ?? 0) >= 4);
  if (thinky && (LEAD_IN.test(t) || !ENDED.test(t))) return "thinking";
  const last = t.split(/(?<=[.!?])\s+|\n+/).pop() ?? "";
  if (/:\s*$/.test(t) && /\b(i'll|i will|let me|let's|now|next|here's|here is)\b/i.test(last)) return "cut";
  return null;
}

const tail = (s: string, n = 400) => {
  const t = s.trim();
  return t.length <= n ? t : "…" + t.slice(-n).replace(/^\S*\s/, "");
};

// Sent once with the next request (not kept in the history).
export function finishNote(why: Unfinished, content: string, reasoning = ""): string {
  const said = tail(content || reasoning);
  const where = said ? ` It ended with:\n"""\n${said}\n"""\n` : " ";
  const what =
    why === "length" ? "your reply ran out of room before it finished." :
    why === "empty" ? "your reply was empty: you thought, but wrote nothing for the user." :
    why === "thinking" ? "your reply was your own thinking, not an answer for the user, and it stopped mid-thought." :
    "your reply stopped before it finished.";
  return `Note from Maxx: ${what}${where}Do not start over or repeat your thinking. If you were about to use a tool, make that tool call now. Otherwise write the final answer for the user now, briefly.`;
}

// What the user reads when asking again didn't help.
export function finishWarning(why: Unfinished, model: string, context: number): string {
  if (why === "length") return `(${model} ran out of room before finishing; its context is ${context} tokens. Start a new session, or load the model with a bigger context.)`;
  return `(${model} stopped without finishing, even after Maxx asked it to go on. Send "continue" to let it try again, or switch to another model.)`;
}
