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

Then open a new terminal, `cd` into any project and run `maxx`, or double-click `maxx.exe` for the
app window.

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

## Starter templates: `maxx new`

Small local models are much better at changing a project that already builds than at writing Gradle
files from nothing, so new projects can start from a template:

| id | what you get | run it |
|---|---|---|
| `android-compose` | Kotlin + Jetpack Compose app, one screen, Gradle wrapper with `gradlew.bat` | `.\gradlew.bat assembleDebug` |
| `html-game` | Snake on a canvas, plain JavaScript, speed and colors under "Tweak me" in game.js | open index.html |
| `python-script` | argparse CLI with unittest tests, standard library only | `python main.py file.txt` |
| `web-app` | notes app: HTML/CSS/JS page + JSON API on a standard-library Python server | `python app.py` |

```powershell
maxx new                      # list them
maxx new html-game snake      # create ./snake
```

In the app window, a new session offers the same templates as cards. The model has a `use_template`
tool too, so "make me a snake game" starts from the working one. Every template writes a MAXX.md
that tells the model where things live and how to build and test.

## Phone and desktop: `--with android,desktop`

Maxx can build an Android app, put it on your phone, look at it and poke it, and it can see and
drive your Windows desktop. These tools are opt-in so small models aren't handed twenty tools
while they only edit code:

```powershell
maxx --with android                 # phone tools
maxx --with android,desktop         # both
```

Or switch inside a session with `/with android`, `/with none`.

### Which model looks at the screenshots

Screenshots need a vision model. The good news: **Qwen3.8-27B** (the plan's "careful" model) is a
native vision-language model and one of the strongest local computer-use models available
(OSWorld-Verified 84.3, AndroidWorld 81.9 on its model card). Two setups on the 64 GB EVO-X2:

| Setup | LM Studio | Run |
| --- | --- | --- |
| One model that codes and sees | Qwen3.8-27B Q6_K (~22 GB) | `maxx --model qwen3.8-27b --with android` |
| Fast coder + separate eyes | Qwen AgentWorld 35B-A3B Q4_K_M + Qwen3.8-27B Q4_K_M (~38 GB together) | `maxx --model <agentworld> --vision-model qwen3.8-27b --with android` |

If the GGUF you load comes with its vision projector (`mmproj`), LM Studio marks it as a vision
model and Maxx sends screenshots to it directly. Otherwise Maxx says so at startup; then pass
`--vision-model`, and that model describes screenshots for the main one: the ones the model takes
with `android_screen`/`desktop_screenshot` or `android_run`, while the screenshots that actions return
on their own are left to the element list (`--vision always` describes every one). `maxx doctor vision`
draws a numbered box and checks the model can read the number back.

### How the model sees a screen

- **Numbered boxes ("set-of-marks").** Every screenshot comes with numbered boxes on the buttons,
  fields and text Maxx found in the Android UI tree or Windows UI Automation, plus a matching list.
  The model says "tap 3" instead of guessing pixels, which is far more reliable for local models.
- **Small images.** Screenshots are downscaled to 1280 px on the long side (`MAXX_SCREEN_MAX`) and
  sent as JPEG; only the last two stay in the conversation. `zoom: "x1,y1,x2,y2"` shows part of the
  screen at full resolution for small text.
- **Look after every action.** Taps, typing, swipes and key presses return a fresh screenshot, so
  the model checks each step before the next.

### Android setup (once)

1. Install Android Studio (it brings the SDK, `adb` and a JDK), or just platform-tools with
   `winget install Google.PlatformTools` if you only install prebuilt APKs.
2. On the phone: Settings > About phone > tap *Build number* 7 times, then Developer options >
   *USB debugging* (or *Wireless debugging*).
3. USB: plug in and accept the prompt. Wi-Fi: ask Maxx to connect and give it the pairing IP:port
   and code from *Wireless debugging > Pair device with pairing code*.
4. `maxx doctor android` checks adb, the JDK and takes a test screenshot.

| Tool | |
| --- | --- |
| `android_run` | Gradle `assembleDebug` → install → launch → crash check → screenshot, in one call. Works for native Kotlin, Capacitor (`project_dir: android`) and Expo prebuild projects, or a prebuilt `apk` |
| `android_screen` | screenshot + numbered elements; `zoom` for detail |
| `android_tap` / `android_type` / `android_swipe` / `android_key` | by element number, text, or screenshot pixels |
| `android_logcat` | crashes, or the app's own log |
| `android_devices` / `android_connect` | pick a device, pair and connect over Wi-Fi |

### Desktop (Windows)

`desktop_screenshot`, `desktop_click` (also right/double-click and drag), `desktop_type` (any
language), `desktop_key` (`ctrl+s`, `win+r`, `alt+tab`), `desktop_scroll`, `desktop_open` (apps,
files, URLs, `ms-settings:`). They run through a small PowerShell helper using UI Automation and
`SendInput`; nothing to install. Only the primary monitor is captured.

**Failsafe:** move the mouse into the top-left corner of the screen and the next desktop action
stops with "STOPPED"; the model is told to stop and ask you.

### Permissions

Screen reading on the phone, logcat and device lists never prompt. Everything that acts (tap,
type, install, desktop screenshots, clicks, keys) goes through the usual prompt; answer
`a`lways to allow e.g. all taps for this project (`android_tap(tap)` in `.maxx/settings.json`).
Device actions don't take git checkpoints, since they don't touch the workspace.

### Replays: turn an exploration into a smoke test

Every device action of a session is saved in device pixels to `.maxx/replays/<session>.jsonl`
(`/with` shows the path). `maxx replay <file>` runs it again (reinstall, relaunch, the same taps
and typing), saves a screenshot per step next to the file and fails on a crash. Let the agent find
its way through your app once, then replay it after every change.

## The app window: `maxx ui`

Double-click `maxx.exe` (or run `maxx ui`) and Maxx opens as its own window, laid out like the
Claude Code app:

- **Sidebar:** your projects and their sessions; click one to pick up where you left off, or
  *Choose folder…* to open a new project.
- **Chat:** streamed replies, collapsible tool cards ("Edit src/App.kt", "Tap Calculate"), and
  permission prompts with the diff inline and **Allow / Always allow / Deny** buttons. **Stop**
  ends the current turn.
- **Live progress:** while the model works, a status bar under the chat says what it is doing
  and for how long ("Reading the 9.2k-token prompt · 48s", "Thinking", "Writing src/App.kt ·
  41 lines · 312 tokens · 4.1 tok/s · 1m12s"), and the file being written fills its tool card as
  it streams. Reasoning goes into a collapsed "Thought for 42s" block. The terminal shows the same
  status line with a spinner.
- **Header:** model picker (from LM Studio), permission mode, 📱 Android / 🖥 Desktop toolset
  toggles, *New* session.
- **Stage panel** (the icons on the right edge), for running and testing what Maxx builds, like
  Claude's artifacts:
  - **◧ Preview** shows the project's web pages. The first `.html` file Maxx writes opens by
    itself, and every later edit reloads it. Pick a page from the menu, or type a dev server
    URL. *Phone size* frames it at 390 px. The console strip collects the page's `console` output
    and errors, and *Ask Maxx to fix* puts them in the message box.
  - **▶ Run** runs project commands in the background, like terminal tabs: one-click chips for
    `package.json` scripts, Gradle, Cargo, Go, pytest and `make`, plus anything you type (kept
    per project in `.maxx/run.json`). Output streams live. When a dev server prints its URL it
    opens in Preview, and a failed command gets an *ask Maxx to fix* link with the end of its
    output.
  - **📱 Screen** shows the latest phone or desktop screenshot. *Live phone* mirrors a connected
    Android phone at about two frames a second: click to tap, drag to swipe, plus Back / Home /
    Recents.

  The model gets two tools of its own in the app window: `preview` opens a page in the panel and
  returns its title, visible text and console errors (so even a text-only model can tell if its
  page works), and `start_server` starts a dev server in the Run tab and returns its URL.
  Previewed pages are served from a second random port with its own token, so a page's scripts
  can't reach Maxx itself. `bun sim/stage-demo.ts` drives the panel in a headless browser and
  saves screenshots to `sim/out/stage/`.

It runs in Edge's app mode (no tabs or address bar) on `127.0.0.1` only, behind a random token
in the link, so other sites and other machines can't drive it. Closing the console window quits.
`bun sim/ui-demo.ts` drives the UI in a headless browser against the simulated EVO-X2 and saves
screenshots to `sim/out/ui/`.

## Sessions per project

Every turn is saved under `~/.maxx/projects/<folder>-<hash>/sessions/` (screenshots are left out),
so each project keeps its own history:

```sh
maxx -c                    # continue the latest session in this folder
maxx --resume 2            # or by number, id, or words from its title
maxx sessions              # this project's sessions
maxx sessions --all        # every project, most recent first
```

A resumed session brings back its toolsets (`--with android` stays on for the app project) and
shows the last reply. In a session: `/sessions`, `/resume <ref>`, `/new`, `/title <text>`.
Starting `maxx` in a folder with history shows a one-line hint to continue it. `MAXX_HOME` moves
the store.

## A simulated EVO-X2

`bun sim/run.ts` runs the real Maxx CLI against a simulated EVO-X2: a fake LM Studio that charges
each request the prefill and decode time of a Strix Halo (scaled from published llama.cpp results),
a fake Pixel 9 behind adb, and a fake Gradle. A scripted model builds a tip calculator, hits a launch
crash, reads logcat, fixes it, rebuilds and tests the app, then a second session resumes it and a
third works in another project. It compares model setups and writes [sim/REPORT.md](sim/REPORT.md).
It tests the plumbing and timing, not the model's intelligence.

## Options

| Flag | Default | |
| --- | --- | --- |
| `--base-url` | `$MAXX_BASE_URL` or `http://localhost:1234/v1` | Any OpenAI-compatible server |
| `--model` | `$MAXX_MODEL` or the first loaded model | |
| `--mode` | `ask` | `ask`, `auto-edit` (file writes allowed), `yolo` (nothing asks) |
| `--context` | `32768` | Context window in tokens; compaction starts at 70% |
| `--with` | `$MAXX_WITH` | Extra toolsets: `android`, `desktop` |
| `--vision` | `auto` | `auto` asks LM Studio whether the model sees images; `native`, `off`; `always` (with `--vision-model`) describes every screenshot |
| `--vision-model` | `$MAXX_VISION_MODEL` | A second model that describes screenshots for a text-only main model |
| `-p` | | Run one prompt and exit |
| `-c`, `--resume <ref>` | | Continue the latest, or a chosen, session in this project |

In a session: `/help`, `/mode <m>`, `/with <sets|none>`, `/sessions`, `/resume <ref>`, `/new`, `/title`, `/checkpoints`, `/rewind <n>`, `/clear`, `/exit`.
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
  image.ts         PNG → downscaled JPEG, numbered element boxes, crops
  vision.ts        native / proxy / off delivery of screenshots to a model
  replay.ts        maxx replay
  sessions.ts      saved sessions per project
  progress.ts      live status while the model streams: partial JSON, status lines
  ui/              maxx ui: local server, the page, Windows launch helpers
sim/               the simulated EVO-X2 (bun sim/run.ts)
  devices/         adb, the Windows PowerShell helper, screen coordinates, the command runner
  tools/           read_file, list_files, grep, edit_file, write_file, bash, android_*, desktop_*
```

- **Tool-call rescue.** Local models sometimes write a tool call as text instead of a real
  `tool_calls` entry. `llm.ts` recognizes `<tool_call>` JSON (Hermes/Qwen), `<function=...>` XML
  (Qwen3-Coder) and fenced JSON, and runs them anyway.
- **Live progress.** A slow model writing a whole file in one `write_file` call is minutes of
  silence. `llm.ts` reports every chunk: reading the prompt, thinking, or which tool call is being
  written, with its arguments parsed as they arrive (`progress.ts` reads incomplete JSON). Tool
  calls written as `<tool_call>` text are hidden from the output and shown the same way.
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
