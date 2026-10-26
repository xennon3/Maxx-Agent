# Notes for agents working on maxx

- Runtime is Bun; run `bun test` and `bun run typecheck` after changes.
- Tools live in `src/tools/`, one file each, defined with `defineTool` and a Zod schema.
  Register new tools in `src/tools/index.ts`.
- Keep tool arguments flat (strings, numbers, booleans) so small local models can call them.
- Everything a tool returns goes back to the model, so error messages should say how to fix the call.
