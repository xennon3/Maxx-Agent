# maxx

A local-first terminal coding agent, in the spirit of Claude Code and openCode, built to run against
LM Studio (or any OpenAI-compatible server) on your own hardware.

This is milestone 1, the walking skeleton: a streaming agent loop, six tools, permission prompts,
tool-call rescue for local models, and git checkpoints you can rewind.

Maxx runs natively on Windows 11 (the GMKtec EVO-X2's default OS), macOS and Linux.

## Quick start on Windows

In PowerShell:

```powershell
# 1. Tools: Bun, Git (includes Git Bash), and optionally ripgrep for faster search
powershell -c "irm bun.sh/install.ps1 | iex"
winget install --id Git.Git -e
winget install --id BurntSushi.ripgrep.MSVC -e   # optional

# 2. Get Maxx (open a new terminal first so PATH picks up the installs)
git clone https://github.com/xennon3/Maxx-Agent.git $HOME\code\maxx
cd $HOME\code\maxx
bun install

# 3. With LM Studio's server running (Developer tab, a model loaded):
bun src/cli.ts doctor

# 4. Build maxx.exe and put it on your PATH
bun run build
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$HOME\code\maxx\dist", "User")
```

Then open a new terminal, `cd` into any project and run `maxx`.

- **Shell:** the `bash` tool uses Git Bash when it is installed, since models write bash much more
  reliably than PowerShell. Without Git it falls back to PowerShell 7 (`pwsh`) or Windows
  PowerShell, and tells the model which syntax to use. Set `MAXX_SHELL` to force a specific shell.
- **ripgrep is optional:** without `rg` on PATH, `grep` uses a built-in (slower) search.
- **Line endings:** files with CRLF line endings keep them when Maxx edits or rewrites them.
- **Terminal:** use Windows Terminal for colors and Ctrl-C handling; the old console host works but
  looks plainer.

## Quick start on macOS or Linux

1. Install [Bun](https://bun.sh) and [ripgrep](https://github.com/BurntSushi/ripgrep).
2. In LM Studio, load a model (recommended: Qwen AgentWorld 35B-A3B Q6_K) and start the server
   from the Developer tab. It listens on `http://localhost:1234/v1`.
3. Check the model can make tool calls:

   ```sh
   bun install
   bun src/cli.ts doctor
   ```

4. Start a session inside any project:

   ```sh
   cd ~/code/some-project
   bun ~/code/maxx/src/cli.ts
   ```

   Or build a single binary with `bun run build` and put `dist/maxx` on your PATH.

## Options

| Flag | Default | |
| --- | --- | --- |
| `--base-url` | `$MAXX_BASE_URL` or `http://localhost:1234/v1` | Any OpenAI-compatible server |
| `--model` | `$MAXX_MODEL` or the first loaded model | |
| `--mode` | `ask` | `ask`, `auto-edit` (file writes allowed), `yolo` (nothing asks) |
| `--context` | `32768` | Context window in tokens; compaction starts at 70% |
| `-p` | | Run one prompt and exit |

In a session: `/help`, `/mode <m>`, `/checkpoints`, `/rewind <n>`, `/clear`, `/exit`.
Ctrl-C stops the current turn.

## How it works

```
src/
  cli.ts           entry point, readline UI, slash commands
  loop.ts          the agent loop: send, validate and run tool calls, append, repeat
  llm.ts           streaming OpenAI-compatible client + tool-call rescue
  context.ts       system prompt, MAXX.md project notes, truncation, compaction
  permissions.ts   ask / auto-edit / yolo, "always allow" rules in .maxx/settings.json
  checkpoint.ts    shadow commits under refs/maxx/<session>, used by /rewind
  doctor.ts        canned tool-call probes for a model
  diff.ts          colored line diffs for approval prompts
  shell.ts         picks bash / Git Bash / PowerShell per platform
  tools/           read_file, list_files, grep, edit_file, write_file, bash
```

- **Tool-call rescue.** Local models sometimes write a tool call as text instead of a real
  `tool_calls` entry. `llm.ts` recognizes `<tool_call>` JSON (Hermes/Qwen), `<function=...>` XML
  (Qwen3-Coder) and fenced JSON, and runs them anyway.
- **Errors go back to the model.** Bad JSON, schema failures, unknown tools and denied calls all
  come back as tool results, so the model corrects itself. Three bad calls in a row stop the turn.
- **Forgiving edits.** `edit_file` tries an exact match, then a whitespace-insensitive line match
  that re-indents the replacement, and otherwise points the model at the closest line.
- **Checkpoints.** Before every write or command, the working tree is snapshotted to
  `refs/maxx/<session>` using a temporary index, so your own index, branch and stash are untouched.
- **Project notes.** `MAXX.md` (or `AGENTS.md` / `CLAUDE.md`) in the project root is added to the
  system prompt.

## Tests

```sh
bun test         # unit tests + an end-to-end loop test against a fake streaming server
bun run typecheck
```

## Roadmap

1. ~~Walking skeleton~~
2. Reliability: JSON-schema constrained retries, smarter output truncation
3. Ink TUI: streaming panes, diff view, context meter
4. Long sessions: saved sessions in SQLite, better compaction, `/rewind` scrubber
5. The fun part: tournament mode, confidence heatmap from logprobs, night shift, two-brain review
