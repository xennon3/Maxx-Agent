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
| `android_explore` | tests the whole app by itself: taps every button on every screen it can reach, types a sample into fields, and reports crashes (with the taps that cause them, saved as a replay), buttons that do nothing, buttons that leave the app, and one picture of every screen. Skips Delete / Buy / Send / Log out unless `bold` |
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
  *Choose folder…* to open a new project. Hover a session and click **×** to delete it: the row
  asks *Delete / Keep*, and an **Undo** toast stays up for ten seconds after.
- **Attachments:** drop files on the window, paste a screenshot, or click 📎. Each file shows as a
  chip with what will happen to it, and a click switches it between the two:
  - *👁 Show to Maxx* (images): shrunk in the browser to a JPEG (1024 px on a 16K context, 1280 px
    otherwise, at most 2 or 4 per message) and sent to a vision model. A `--vision-model` describes
    it instead; a model that can't see gets it saved to `.maxx/uploads/` and you get a note.
  - *📄 Add to context* (code and text): inlined in the message. All attached text together may use
    30% of the context window; a bigger file (a long build log) is saved to `.maxx/uploads/` and
    only its start is inlined, with a pointer so Maxx can `read_file` or `grep` the rest.
  - *💾 Save to project*: copied into the project folder (never over an existing file; `logo.png`
    becomes `logo-1.png`) and Maxx is told it is there. Zips, APKs, PDFs and other binaries always
    go this way.
- **Chat:** streamed replies, collapsible tool cards ("Edit src/App.kt", "Tap Calculate"), and
  permission prompts with the diff inline and **Allow / Always allow / Deny** buttons. **Stop**
  ends the current turn.
- **Live progress:** while the model works, a status bar under the chat says what it is doing
  and for how long ("Reading the 9.2k-token prompt · 48s", "Thinking", "Writing src/App.kt ·
  41 lines · 312 tokens · 4.1 tok/s · 1m12s"), and the file being written fills its tool card as
  it streams. Reasoning goes into a collapsed "Thought for 42s" block. The terminal shows the same
  status line with a spinner.
- **💬 Chat mode** (top of the sidebar): everyday questions with no project and no tools, so even
  a 4B model just talks. When a picture helps, Maxx answers with a fenced block and the window
  draws it right in the conversation:
  - ` ```chart ` with a Chart.js config (bar, line, pie, doughnut, radar, scatter...). Configs are
    parsed as JSON, forgiving trailing commas and single quotes; ones written as JavaScript run
    in a sandbox instead. Series without colors get Maxx's palette.
  - ` ```mermaid ` diagrams: flowcharts, mind maps, timelines, Gantt charts, sequence diagrams.
  - ` ```html ` small interactive tools (calculators, simulations, games) in a sandboxed frame with
    no network and no access to the app; `Chart` is preloaded in it.

  Each visual has **</>** (source), **⬇** (save as PNG, SVG or HTML) and **⤢** (open big in the
  stage panel's ✦ Visual tab). One that fails to draw shows the error and an *Ask Maxx to fix it*
  button. Chart.js and Mermaid are built into `maxx.exe`, so it all works offline. Chat sessions
  are saved under `~/.maxx/chat` and listed under *Chat* in the sidebar. In project sessions,
  chart and mermaid blocks are drawn too; html stays code.
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
    Android phone as smooth video (the phone's own H.264 encoder through `adb screenrecord`,
    decoded in the window with WebCodecs; capped at 1920 px on the long side, restarted every
    3 minutes). Phones that can't stream fall back to screenshots twice a second. Click to tap,
    drag to swipe, plus Back / Home / Recents. When Maxx taps, swipes or types, a purple
    "Maxx" finger shows where, and the live view turns itself on (unless you stopped it).
    *🧭 Explore app* asks Maxx to run `android_explore` and fix what it finds.
    `MAXX_MIRROR=frames` forces screenshots; `MAXX_MIRROR_MAX` and `MAXX_MIRROR_BITRATE` tune the video.

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

### Voice in, phone out

Click 🎙 in the composer (or press Ctrl+Space, or hold the button and let go) and say what you want: "make the snake faster". The words appear in the box as you speak and are sent when you stop talking (there is a short countdown; Esc or typing cancels it). Short commands act on the window instead: "stop", "send", "cancel", "new session".

After a spoken request changes the project, Maxx rebuilds it by itself and shows the result:

- an Android project (with 📱 Android on and a phone connected): it runs `android_run` (build, install, launch) and turns on the live phone view;
- a web page: it opens the page, or the running dev server, in the Preview panel at phone size.

If that build or page fails, the error goes back to the model to fix, twice at most. The rebuild asks for permission like any other command unless you allowed it. Each step can be turned off under **▾ voice**, which also has "Read Maxx's reply aloud" (Windows' own voices, offline).

Speech-to-text has two engines:

- **Edge speech recognition**: built into Edge, nothing to install, but Edge sends the audio to Microsoft's online service.
- **Local Whisper**: fully offline. Either run whisper.cpp's server and point Maxx at it, or let Maxx call `whisper-cli` itself:

  ```powershell
  whisper-server -m ggml-base.en.bin --port 8178     # then:
  maxx ui --whisper http://127.0.0.1:8178
  # or: whisper-cli on PATH and a model in %USERPROFILE%\.maxx\whisper\ (or --whisper <path> --whisper-model <file.bin>)
  maxx doctor voice                                  # checks it and times a transcription
  ```

  `base.en` (142 MB) is quick on a laptop CPU; any server with an OpenAI-style `/v1/audio/transcriptions` works too. When a local Whisper is set up, it is used by default.

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

Deleting moves a session to `~/.maxx/trash/` for 7 days, so it can be undone:

```sh
maxx sessions rm 3 "dark mode"   # by number, id or title words; asks first (-y skips that)
maxx sessions undo               # bring back the one deleted last
```

In a session, `/delete [ref]` (no ref: this one) and `/undelete` do the same, and
`/attach [save] <file...>` sends files with your next message the way the app's 📎 does.
Starting `maxx` in a folder with history shows a one-line hint to continue it. `MAXX_HOME` moves
the store.

## Agent mode: give it a goal, watch the task board

Turn on **🤖 Agent** in the app window (or run `maxx --agent "..."`, or `/agent ...` in a session) and give Maxx a goal instead of a step: "build a tip calculator web app that looks good on a phone". Maxx then:

0. **Asks first.** If the goal leaves something open that would change the plan ("web page or Android app?"), Maxx asks up to three questions before planning, each with a few choices and its own guess. The answers go to the planner and to every task. Nobody may be watching, so after 5 minutes without an answer it goes with its guess (`--ask-wait`, `--briefing off`, or the ⚙ settings).
1. **Plans.** The model splits the goal into a few tasks, each with a check ("the page shows a total"). They appear on a task board pinned above the chat.
2. **Snapshots.** Before each task Maxx takes a snapshot of the folder (a shadow git commit; a folder that is not a git repository gets a private one in `.maxx/git`).
3. **Works and checks.** The model does the task with its usual tools, the fix-it loop runs the build, and the task only counts as done when the model says DONE and the last check passed.
4. **Looks.** When a task changed something you can see, the **screenshot judge** takes a picture (the page in a headless Edge or Chrome at phone size, or the phone over adb) and asks the vision model whether it matches what was asked. A FAIL goes back to the model as a fix. A small judge is often wrong, so its verdict never rewinds work by itself.
5. **Rewinds.** A task that fails (STUCK, the step limit, a build that still fails) is rewound to its snapshot and tried again with a note on what went wrong, so the model tries a different way instead of piling fixes on a mess. The failed try is kept as a checkpoint (`/checkpoints`).
6. **Stops** when every task is done, or when one still fails after its tries, with the files back as they were before that task.

File edits need no approval while a goal runs (every task can be rewound); commands still follow the permission mode. The helper model, the error coach and the fix-it loop all work inside each task as usual.

**The project map.** Maxx keeps a short index of the project's files and the functions, classes and Compose screens in each, cut to a token budget. The model gets it in its system prompt, in Agent mode's planner and first task, and through the `project_map` tool, so it does not spend its context listing folders.

**Budgets grow with the model.** Every limit is a setting, and the defaults follow `--context`:

| | 16K (a 4B model on a laptop) | 32K | 64K and up (a big model on the EVO) |
|---|---|---|---|
| Most tasks | 6 | 8 | 12 |
| Steps per try | 20 | 35 | 60 |
| Tries per task | 2 | 2 | 3 |
| Judge fix rounds | 1 | 2 | 2 |
| Project map | 5% of the context (819 tokens at 16K, up to 8000) | | |

Change them with the ⚙ next to 🤖 Agent (saved in `~/.maxx/agent.json`; only what differs from the defaults is saved, so the rest keeps following the context) or with `--max-tasks`, `--task-steps`, `--task-tries`, `--judge on|off` and `--map-tokens`. `MAXX_BROWSER` picks the browser the judge uses.

## Crew mode: several workers on one goal at once

Turn on **👥 Crew** in the app window (or run `maxx --crew "..."`, or `/crew ...` in a session). It works like Agent mode, but with a team:

1. **Plans for a team.** The planner writes tasks that also say what they need first and which files they touch: `2. Add the forecast strip | check: five days show | after: 1 | files: index.html, forecast.js`.
2. **Shares them out.** Up to `--workers` workers (default 3; they are called Ada, Bo, Cy...) take ready tasks. A task starts once the tasks it needs are merged, and two tasks that list the same file never run at once.
3. **Separate copies.** Each worker gets its own git worktree, outside the project (in `~/.maxx/crew`), started from the shared work so far. It works its task there with Agent mode's snapshots, checks, judge and rewinds, and its own budget. Workers read what the others handed in and who is doing what.
4. **Hands in and merges.** A finished task is committed in the worker's copy and merged into a shared integration copy. If it clashes with work merged meanwhile, the worker pulls that work into its copy and sorts out the conflict markers itself (twice at most), then hands in again.
5. **Final check.** With more than one task merged, one worker runs the build over the merged whole and fixes names, imports or ids that don't line up.
6. **Lands.** The result is written into your folder, after a snapshot, so `/rewind` undoes it all. Files you changed yourself while the crew worked are merged in, not overwritten. If you stop it, nothing in the folder changes (the merged work so far is kept as a git ref).

A folder that is not a git repository works too (it uses the private `.maxx/git`). Without git at all, Crew mode runs as Agent mode. Workers get the plain tools: the phone and desktop tools, the app's preview and MAXX.md lessons stay with the main session, because several workers can't share one phone or append to one file without clashing. Your branch, index and stash are never touched; hooks don't run for the crew's commits.

**Taking turns at the model.** LM Studio answers a set number of requests per model at once (its **Max Concurrent Predictions** load setting, 4 by default since 0.4) and quietly queues the rest. Maxx keeps that queue on its side instead: each model has a gate with that many slots, measured on the first crew run (one short request alone, then several together) unless you set `--slots`. A worker that is running a build or reading files doesn't hold a slot, so even at one request at a time the crew is faster than one agent, and the board shows who is "waiting for the model". For real parallel thinking, raise Max Concurrent Predictions, or give the crew two models (`--crew-models qwen-agentworld-35b-a3b,qwen3.8-27b`, or tick them in the ⚙), which share the workers out in turn. LM Studio shares one model's context between the requests it runs at once, so load it with about workers × the context one worker needs.

The board shows each worker (its model, and whether it is thinking, working, waiting for the model or handing in), each model's slots, and the tasks in four lanes: to do, working, handing in, done. Settings: the ⚙ next to 👥 Crew (saved in `~/.maxx/crew.json`), or `--workers`, `--crew-models`, `--slots` and `--max-tasks`. Steps and tries per task come from Agent mode's settings.

## Research lab: ask a question, get a lab notebook

Open **🔬 Research lab** in the app's sidebar (its own tab, with past studies, the live board, the claim
ledger, evidence, instrument log and notebook), or run `maxx --lab "question"`, or `/lab question` in a session, and ask
something you could measure: "does my desk get warmer while the PC runs, and is the fan what I hear?".
Maxx runs a small scientific loop, one short request per phase so small local models keep up:

1. **Frame**: makes the question measurable and plans readings with the instruments it has.
2. **Collect**: the web (with 🌐 Network on), every COM port that shows up (Arduino and other USB
   serial boards), the camera and the microphone (through the app window, nothing to install; ffmpeg
   in the terminal), a data file in the project, and any command you register in
   `~/.maxx/instruments.json`. Sensors, the camera and the mic ask first (camera and mic even in
   "never ask" mode, unless you picked Always), and every reading goes into the study's instrument log.
3. **Hypothesize**: 2 to 6 rival explanations, each with a prediction and a prior.
4. **Test**: one script per hypothesis (Python if installed, else JavaScript run by maxx.exe itself),
   in the study folder, with a time limit, a clean environment and sockets blocked while network access
   is off. A broken script goes back to the model to fix. Each verdict moves the confidence meter.
5. **Follow up**: if something is still inconclusive, it plans more readings for another round.
6. **Review**: a skeptic pass names the weakest link; with `--vision-model` set to a different model,
   that model is the reviewer, a genuine second opinion.
7. **Conclude**: answer, overall confidence, findings with `[E1]`/`[H2]` citations, caveats, next experiments.

**Truth rules.** Every fact goes into a claim ledger: 📏 observed (measured here), ✔ verified (its words and
numbers are really on the page it cites), 🔁 corroborated (another site agrees), 💬 opinion, ⚠ unverified (a
number not on its page), ⚖ contested (sources disagree) or ✗ fabricated (cites a page never fetched). Statuses
can change as evidence arrives, and each change is kept. Hypotheses must cite the evidence they rest on; one that
cites nothing is allowed but labelled speculative with its prior capped at 35%. The judge of each test never sees
the prior, so it cannot anchor on it. The conclusion includes the strongest other view, and a fact check sends it
back once if it has a number that is not in the evidence, a citation to nothing, or a finding with no citation.

**Virtual labs.** When a simulation can shed light on the question, Maxx designs its own lab: a small JavaScript
model (particles, agents, a circuit, heat flow, a Monte Carlo game...) written to one contract (`params`, `outputs`,
`init`, `step`, `measure`, `draw`). It is smoke-tested in the sandbox (and fixed if it breaks), then swept across the
parameters that tell the hypotheses apart; each sweep becomes evidence, and its result an ⚠ unverified claim, because
a simulation shows what its assumptions imply, not what the world does. The **🧪 Virtual lab** tab runs it live: a
slider per parameter, play/step/run-to-end, a seed, a live chart, quick sweeps, and 📌 to record runs worth keeping.
Labs are kept in `~/.maxx/labs/<name>/` (code, metadata, every run) and later studies reuse them.

**Discovery.** Each study also flips the topic's core assumptions, writes deliberately varied hypotheses (a rival, a
wildcard, a flipped assumption, one borrowed from another field), chases sources that disagree, lets the two leading
hypotheses debate (points score only by what they cite: measured and confirmed facts most, opinions nothing, invented
citations less than nothing; the second model judges), and finishes with a look ahead: a gap map of what is known and
what nobody checked, dated predictions, cheap experiments with what is on your desk, and exactly what would change its
mind. The Research tab collects ✨ leads (odd facts, outliers, gaps, overnight anomalies; "Study this" starts a study
that remembers where it came from), the 🔮 prediction ledger (mark them right or wrong; Maxx keeps a Brier score), the
🧪 lab library, and the 🌙 overnight watch: leave a sensor running for hours, flag anything far outside the usual, and
keep the PC awake on Windows while it runs. 🌱 Branch from this starts a follow-up study; the notebook draws the idea tree.

Everything lands in `.maxx/research/<id>/`: `data/*.csv`, `tests/*.py`, `raw/` (photos, WAVs, serial
logs), `instruments.jsonl`, `REPORT.md` and a self-contained `report.html` notebook. `maxx lab`
lists the instruments, `maxx lab sketch` prints an Arduino starter sketch, and
`MAXX_FAKE_SERIAL="COM3=Arduino Uno"` adds a simulated board for trying it without hardware.
Settings (rounds, hypotheses, tests at once, time limit...) are in the 🔬 ⚙ dialog and `~/.maxx/lab.json`.

A custom instrument is any command that prints readings (`key=value`, CSV or bare numbers per line):

```json
{ "instruments": [ { "id": "station", "about": "backyard weather station",
  "command": "python C:/tools/station.py --seconds {seconds}", "seconds": 10 } ] }
```

## Follow-up questions

### ⚡ Auto-run

Maxx asks before every edit and command by default. To stop the prompts, click **⚡ Auto** next to the message box, or **⚡ Allow & auto-run** on any approval card (in the terminal: `r` at a prompt, `/auto on`, or `--auto-run`). Edits and commands then run on their own, and ↶ Undo still puts files back. The choice is saved in `~/.maxx/permissions.json` for every project, and it works mid-turn: a step already waiting for your OK goes through when you switch it on. Click ⚡ again (or `/auto off`) to go back to asking.

A short safety net still asks, even with auto-run on, for what Undo can't take back: deleting a whole drive, home folder or everything in the project (`rm -rf /`, `rm -rf *`, `rd /s C:\`), formatting a disk, `git push`, publishing a package, `sudo`, piping a download into a shell, shutting down, and registry edits. "Always allow" on one of those saves a rule, and auto-run respects it after that.

When a request leaves a choice only you can make, the model calls `ask_user` instead of guessing or ending its turn with a question. The turn pauses and the app shows a card with the question, a few choices to click (Maxx's own guess is marked), a box for your own answer, and **Skip** to let Maxx go with its guess. In the terminal you type a number, your own answer, or Enter for the guess. Questions are never permission prompts, so they come up in every mode, even "⚡ Auto-run everything". A small model may ask at most 3 per turn; after that it is told to decide. When input is piped (no one at the keyboard), the tool is not offered at all. Outside Agent mode a question waits as long as it takes; in Agent mode it waits `--ask-wait` minutes (default 5, 0 waits for ever).

## Helping small models recover

A 4B model on a laptop CPU loses its way more often than it lacks knowledge. Four helpers, all on
by default, keep it on track while costing only about 150 prompt tokens:

- **Error coach.** When a tool call fails, Maxx adds the first real error line and, when it knows the
  problem, one plain hint: `Maxx hint: python is not on PATH here. Try py instead of python.`
  It knows about missing programs, busy ports, missing packages and files, Gradle without an SDK or
  JDK, and compiler errors (it says which line of which file to fix).
- **Plan first.** For bigger tasks the model writes 3 to 5 steps with the `plan` tool and ticks them
  off. The app pins the checklist above the chat (`/plan` in the terminal). If the model says it
  is done with steps left, Maxx sends it back once.
- **Fix-it loop.** When the model finishes after changing files, Maxx checks the work: changed
  .js/.ts/.html/.json files must still parse (no tools needed), then the project's build runs if
  there is an obvious one (`typecheck` or `build` script, `gradlew assembleDebug`, `cargo build`,
  `go build`) or MAXX.md has a `check: <command>` line. A failure goes back to the model with the
  lines around the first error, up to 3 times. `--check <cmd>`, `--check off`, `--fix-tries 0`.
- **Memory notes.** The `remember` tool adds a lesson to a "Lessons" section of MAXX.md, and when a
  failed command works with a different program (`python a.py`, then `py a.py`), Maxx writes that
  down by itself. MAXX.md is read at the start of every session (keeps the last 20 lessons).
## Learning from your corrections

Small models repeat their mistakes. So whenever you correct Maxx, it writes one short rule into a
"Rules from your corrections" section of the project's MAXX.md, and every later session starts out
knowing it. Four things count as a correction:

- **Saying so.** "No, use pnpm", "don't touch the tests", "I said Kotlin", "always write comments in
  Spanish". A plain new request ("now add sound") is not a correction and costs nothing.
- **Deny with a reason.** The permission card has a "Why not?" box (in the terminal, answer
  `n keep the build folder`). The model reads the reason right away, and it becomes a rule.
- **Fixing Maxx's code by hand.** If a file Maxx wrote has changed when you send your next message,
  Maxx shows the model your diff and learns what you wanted.
- **↶ Undo** (or `/undo`, or `/rewind`). Every file goes back to how it was before the last turn,
  and what you say next is read as the correction.

After the turn, the model turns the correction into one instruction of 20 words or fewer. It answers NONE when you only
changed your mind about this one task. A rule you teach again is not added twice: it gets stronger
(`x2`, `x3`), and a newer rule that contradicts an old one ("Never indent with spaces" after "Indent
with spaces") replaces it. The list keeps 15 rules. When it is full, the weakest, oldest rule goes. The
rules are taken out of the MAXX.md notes and put last in the system prompt, where a small model pays
the most attention.

In the app, a green line shows each rule as it is learned, with **Undo** on the toast. The **📏
Rules** chip opens the list, where you can edit, remove or add rules, or turn learning off. In the
terminal, use `/rules`, `/rules add <rule>`, `/rules rm <n>` and `/rules off`. You can also use `--learn off` or `MAXX_LEARN=off`.
Agent mode's own task prompts and rewinds never count as corrections.

## Brain swap: a bigger helper when the local model is stuck

A small model does most steps fine and then gets stuck on one: the same call five times, or a
build that keeps failing. With a helper set, Maxx notices (the repeat detector fires, or 3 tool
calls fail in a row), hands just that step to a bigger model, and hands back to the local model as
soon as one of the helper's steps works. The helper gets the whole conversation plus a short note
on why it was called, and the local model is told the helper got it past the blocker.

```sh
maxx --helper qwen3.8-27b                     # another LM Studio model (loaded on first use)
ANTHROPIC_API_KEY=sk-ant-... maxx --helper claude-opus-5-5           # Claude
maxx --helper gpt-5 --helper-url https://api.openai.com/v1          # any OpenAI-compatible API ($OPENAI_API_KEY or $MAXX_HELPER_KEY)
```

In the app, the 🧠 chip in the header opens the same settings (saved in `~/.maxx/helper.json`,
which `maxx` also reads). Each hand-off shows as a purple banner in the transcript, and the hand-back
says how many steps and tokens the helper used. Limits: 4 helper steps per escalation and
3 escalations per message, so a hopeless task can't run up a bill. `/helper off` stays local for
the rest of a session.

It is off until you set a helper, so nothing leaves the machine by default. With a hosted helper,
the conversation so far (files read, command output) is sent to that API only when Maxx escalates.

## Short answers: the brevity switch

Small models pad answers with background, recaps and "let me know if you need more", which
burns tokens and context. Maxx is **Brief** by default: one line in the system prompt asks for
short answers, no preamble and no narration before tool calls. Switch with the ✂ chip in the app
header (Brief, Normal, Detailed), `/brevity brief|normal|detailed` in the terminal, or
`--brevity` / `$MAXX_BREVITY`. The choice is saved in `~/.maxx/brevity.json` and applies to chat
and project mode. Only the prompt changes: there is no token cap, so a file write or tool call is
never cut off halfway.

## Less thinking: the 💭 switch

Reasoning models (DeepSeek, Qwen with thinking on) can spend a thousand tokens deliberating over
"make the button blue", which at 20 tok/s is most of a minute. Maxx keeps that down three ways:

- **It asks the server.** Each request carries the usual switches: `chat_template_kwargs`
  (`enable_thinking` for Qwen templates, `thinking` for DeepSeek's) and `reasoning_effort`.
  Servers ignore fields they don't know; one that rejects them gets the plain request again, and
  Maxx stops sending them to it.
- **It counts.** Whatever the server does, Maxx counts the thinking as it streams (also
  `<think>` tags left in the text). Past the step's budget, or when the model goes round in
  circles (the same sentence a third time, "Wait..." after "Wait..."), Maxx cuts the request and
  asks again with thinking off, handing back the end of what the model thought so nothing is lost.
  A `(thinking cut after N tokens: ...)` note says when this happens.
- **Auto sizes it per step** (the default). A short, plain ask ("rename score to points") gets
  almost none; "why does level 2 crash" gets plenty on its first step; a step after a tool call
  that worked gets less, and each failure in a row raises it again.

Switch with the 💭 chip in the app header, `/thinking auto|off|low|high|max` in the terminal, or
`--thinking` / `$MAXX_THINKING`; saved in `~/.maxx/thinking.json`. `max` sends nothing and never
cuts, which is the old behavior. Budgets: off ≈ 96 tokens (in case the server ignores the
switch), low 400, auto's medium 1500, high 4000.

## Colors: any palette

Maxx can design with any color palette: charts and Mermaid diagrams in chat, and the pages, apps
and games it builds. Pick one with the 🎨 chip in the app header, `/palette` in the terminal, or
`--palette` / `$MAXX_PALETTE`. A palette can be:

- a preset: maxx, ocean, sunset, forest, pastel, synthwave, neon, earth, mono, ice, autumn, candy,
  retro, cyber, dracula, nord, solarized, handheld (4-shade green LCD), pico (16-color pixel art)
  or colorblind (Okabe–Ito, readable with every common kind of color blindness); `/palette list`
  shows them as swatches
- your own hex colors: `/palette #264653 #2a9d8f #e9c46a`, optionally named (`brand: #111 #f60`)
- one color and a harmony that grows it into five: `#ff6600 triad` (analogous, complementary,
  triad, split, tetrad, mono)
- a coolors.co link
- `random`, which rolls a fresh palette that still hangs together (and gives it a silly name)
- the main colors of a picture: 🖼 From an image in the app, worked out in the browser
- `auto`: no palette, the model picks

The palette is one line in the system prompt with the hex codes, plus a background and a text color
that pass WCAG contrast. The app also uses it to color charts the model left uncolored and to theme
Mermaid diagrams, and recolors the transcript when you switch. It is saved in `~/.maxx/palette.json`.

For one request you can just say it: "make a snake game in synthwave colors", "use the palette
#0b132b #3a506b #5bc0be", "give it a random palette". Maxx adds that palette's hex codes next to
the message, so the model doesn't have to remember them, and the saved setting stays as it was.

## Game sound: effects and chiptune music, no audio files

When Maxx builds a web game it can give it sound with the `make_sounds` tool. The model describes
each sound in a few words ("short bright coin", "deep crunchy explosion", "victory fanfare") and
picks a mood for the music (happy, heroic, chill, spooky, tense, sad, boss, space, cute). Maxx
writes one `sound.js` next to the game and links it from `index.html`; the game then calls
`Sound.play("eat")` and `Sound.music("theme")`, and M mutes. Nothing is downloaded: every sound is
synthesized in the browser from a few numbers, and every song is composed from its mood and a seed
(chord progression, a melody built from repeating motifs, bass, arpeggios and drums). The Snake
template ships with a starter set.

- **Sound lab** (the 🔊 tab in `maxx ui`): play every effect and song in the project, drag
  sliders (pitch, glide, fade, crunch, echo...), type a change ("deeper, shorter, wobbly"), roll
  🎲 for another take, watch a song's piano roll, switch its parts on and off, download a .wav,
  and Save. The game in Preview reloads with the new sounds.
- **Terminal:** `maxx sound deep crunchy explosion` and `maxx sound music boss 4` write .wav files.
- The bank at the top of `sound.js` is plain JSON, one sound per line, so tweaks are easy to diff.

## Engineer's tools: tests, git, eyes on the page

Every project gets these as well as the file and shell tools. `/tools` (or the 🧰 chip) lists exactly
what the model can use right now, so you never have to take its word for it.

- `run_tests` finds the runner (bun, npm, pnpm, yarn, pytest, cargo, go, Gradle, Maven, make), runs
  it, and returns `PASSED` or only the failures, with their file and line. A 3,000-line Gradle log
  comes back as about 20 lines.
- `git` looks without changing anything: status, diff, log, show, blame, branches. `git_commit`
  saves the work with a message, on a new branch if you want one. If the folder isn't a repository
  yet, it creates one and adds a `.gitignore`.
- `snap_page` opens a page in headless Edge at phone and desktop width and returns the screenshots.
  It also reports console errors, and says when the content is wider than the screen.

### 🎨 Studio

Turn on the Studio chip (`--with studio`) for the design tools. They all draw with the browser's
canvas, so they need no image library, and each one sends the model a picture of its result so it
can check its own work.

- `draw_svg` writes a logo, icon or illustration as SVG, shows it rendered, points out problems
  (no `viewBox`, a script, a linked web image) and saves PNG copies at the sizes you ask for.
- `image_edit` applies a list of steps to an image: resize, crop, trim, pad, remove the
  background, pixelate, limit to a palette, tint, hue, adjust, flip, rotate, outline, shadow,
  round corners, and more.
- `sprite_sheet` packs animation frames (`art/walk-*.png`) into one sheet plus a JSON atlas, and
  tells the model the exact `drawImage` call for frame n.
- `make_icons` takes one square logo and writes every Android launcher size (adaptive icon
  included, wired into the manifest), the PWA and Apple touch icons, `favicon.ico`, and a Windows
  `.ico`.
- `design_tokens` sets up a design system in `design/tokens.json` (colours, fonts, type scale,
  spacing, corners, shadows) from a palette, then exports it to whatever the project uses: CSS
  variables, Tailwind, Android `colors.xml` and `dimens.xml`, and a Jetpack Compose `Tokens.kt`.
  Edit the JSON and call it again with `export` to update them all.
- `pick_fonts` picks a heading and body pair for a mood ("retro arcade", "elegant wedding") from
  20 tested pairings. With network access on, it downloads them into `fonts/` so the app works
  offline.
- `mood_board` takes up to six web pages or images, pulls out their main colours, fonts and corner
  style, and writes `design/moodboard.html` with a short style brief to design from.

### 🎬 Media

`--with media` adds pictures, voices and video, all made on your own PC:

- `image_generate` asks a local image model for game sprites, backgrounds, textures and website art.
  It finds ComfyUI (port 8188), Stable Diffusion WebUI Forge or Automatic1111 started with `--api`
  (port 7860), or any OpenAI-style images server you name in `~/.maxx/images.json`
  (`{"url": "http://127.0.0.1:1234"}`). Fast models such as SDXL-Turbo and FLUX.1-schnell get
  their few steps automatically. Styles (`pixel-art`, `game-sprite`, `flat-icon`, `texture`...)
  fill in the right wording, and `transparent: true` removes the background for sprites.
- `speak` turns text into a WAV file for character lines or a narrated app tour. It uses Piper's
  natural voices when installed (put a voice `.onnx` in `~/.maxx/voices`), otherwise the voices
  Windows already has.
- `video` runs ffmpeg recipes: trim, a looping GIF for a README or store page, frames to video,
  compress, extract audio, `.ogg` for game music, a thumbnail, and joining clips.

`maxx doctor media` checks what is ready: the browser, an image server and its models, voices,
ffmpeg, and the language servers the 🛠 Engineer tools use.

### 🧭 Browser

`--with browser` gives Maxx its own browser to test web apps and games the way a person would.

- `browser_open` loads a project page or a `localhost` URL. It returns a screenshot with numbered
  boxes on everything clickable, the same list as text (so a model without vision still knows what
  is there), and the console output.
- `browser_act` clicks, types and scrolls by those numbers. It can also hold a key for a set time,
  which is what game testing needs.
- `browser_eval` reads app state, such as `game.score`.
- `profile_page` measures load and paint times, layout shifts, long JavaScript tasks, frame rate and
  the heaviest files, then names the top three problems with a fix for each. At phone size it slows
  the CPU 4x so a fast PC doesn't hide anything.

Set `MAXX_BROWSER_HEADED=1` to see the browser window while Maxx works in it.

### 🛠 Engineer

`--with engineer` adds the tools a senior developer reaches for:

- `code_nav`: definition, references, hover, an outline of a file, and its type errors. It asks the
  installed language server: TypeScript 7's built-in one (`tsc --lsp`) or typescript-language-server,
  pyright or pylsp, rust-analyzer, gopls, kotlin-language-server. With none installed, it falls back
  to a careful text search and says what to install.
- `rename_symbol`: renames a symbol everywhere through the language server, leaving look-alike
  names untouched.
- `probe`: print debugging without the mess. It shows the values at a line while the tests run,
  then puts the file back.
- `bisect`: `git bisect` with the tests, naming the commit that broke them.
- `mutate`: plants small bugs one at a time (`<` becomes `<=`, `&&` becomes `||`) and reports which
  ones the tests miss.
- `release`: bumps the version, writes `CHANGELOG.md` from the git log, then builds. On Android it
  builds the release APK or AAB; on the web it packs a zip with `index.html` at the root, ready
  for itch.io.

### ✨ Director

`--with director` adds tools that make design decisions with you rather than for you:

- `rival_designs`: before a screen is built, two designers with different styles (Swiss minimalist,
  Neon arcade, Editorial, Brutalist...) each make it as a full page. Maxx screenshots both, checks
  them for design crimes, scores them with vision, and asks you to pick. `design/rivals/index.html`
  shows them side by side. Your picks go in `~/.maxx/taste.md`, and later designs lean your way.
- `sketch_to_app`: attach a photo of a napkin or whiteboard sketch, and Maxx turns it into a web
  page (or a Jetpack Compose screen for a `.kt` path) using your design tokens and fonts, then shows
  the sketch and the result side by side. It needs a model that can see, or `--vision-model`.
- `asset_kit`: one line such as "retro space shooter" gives a matched kit: palette (design tokens),
  font pair, sprites (painted by the local image model when one is running, otherwise drawn as
  SVG), sound effects and title music, with a preview page you can click to hear.
- `persona_test`: made-up users (grandma, speedrunner, angry reviewer, kid, screen-reader user,
  commuter, or your own) use the app in Maxx's browser or on the phone. Each writes a paragraph of
  feedback, a score and a bug list, saved in `.maxx/personas/`.
- `ugly_check` and `timelapse`: the two below, on demand.

**Ugliness alarm.** After Maxx changes a web page, it loads it at phone and desktop size before
saying done and looks for design crimes: text too faint to read, buttons too small to tap, cut-off
text, sideways scrolling, tiny type, clashing colours, broken images, overlapping buttons and
script errors. It sends the list back to the model once to fix. It is measured from the page, so it
needs no vision model. Turn it off with `--no-alarm`.

**Time-lapse.** Every change you can see saves a small screenshot in `.maxx/timelapse/` (kept out of
git). Agent mode turns each finished goal into a looping GIF of about 20 seconds, and `timelapse`
makes one whenever you ask. Maxx encodes the GIF itself, so no ffmpeg is needed. Turn it off with
`--no-timelapse`.

### Recipes

Recipes are step-by-step playbooks, such as `fix-failing-test`, `responsive-page`, `pwa-install`,
`game-juice`, `android-release` and `app-icons`. Only their names and a line each go in the
system prompt. The model calls `recipe` to load the full steps when a task matches, which helps
a small model far more than improvising.

To add your own, write Markdown files with `name:` and `when:` front matter:

- in `.maxx/recipes/` for the project (commit them, so the team gets them too)
- in `~/.maxx/recipes/` for every project

A recipe with the same name as a built-in one replaces it.

**📜 Recipe recorder**: after a task goes well, press 📜 Recipe in the app (or type
`/recipe save <what it is for>`). Maxx writes down the steps that worked, leaves out the dead ends,
and adds a step that avoids the mistake that caused them. `/recipe` lists the recipes, and
`/recipe <name>` shows one.

## Looking things up: web search and free MCP servers

A small local model's knowledge stops at its training date, so it will happily describe last
year's API. With network access on (🌐 in the app, `/network on` or `--network on`), Maxx gets
lookup tools in both chat and project mode, and its prompt says today's date and tells it to look
up anything version-, date- or price-sensitive it isn't sure of, then end with a `Sources:` line.

- **`web_search`** needs no API key: a SearXNG server if you run one (`$MAXX_SEARXNG` or
  `{"searxng": "http://localhost:8888"}` in `~/.maxx/web.json`), else DuckDuckGo's HTML pages,
  else Wikipedia. Five results, about 300 tokens.
- **`web_fetch`** reads a page as plain text. With `find` ("install command", "release date") it
  returns only the lines that mention those words plus their neighbours, so a 4B model at 16K
  context reads a paragraph, not a whole page. Without it, pages come in ~3,200-character slices
  (`start=` for more).
- **MCP servers** from `~/.maxx/mcp.json`, in the same `{"mcpServers": {...}}` shape Claude Desktop
  and Cursor use, over stdio (a command) or Streamable HTTP (a URL). With no file, Maxx uses
  [Context7](https://context7.com) (current library docs, free, nothing to install).

```sh
maxx mcp                         # what is configured, and the free presets
maxx mcp add deepwiki            # questions about any public GitHub repo
maxx mcp add microsoft-learn     # Windows, PowerShell, .NET and Azure docs
maxx mcp add fetch -- uvx mcp-server-fetch      # any stdio server
maxx doctor web                  # check search, page reading and every MCP server from here
```

MCP calls ask first in ask mode unless the server has `"trust": true` (the presets do), outputs are
cut at 4,000 characters, schema descriptions are trimmed, and at most 12 MCP tools are offered
(pick them with `"tools": [...]` per server). A server that is down is skipped with a note and
tried again two minutes later. With network access off, none of this is offered and the model is
told to say when its answer may be out of date.

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
| `--mode` | `ask` (or the saved choice) | `ask`, `auto-edit` (file writes allowed), `yolo` (auto-run: nothing asks except risky commands) |
| `--auto-run` | off | same as `--mode yolo` |
| `--context` | `32768` | Context window in tokens; compaction starts at 70% |
| `--with` | `$MAXX_WITH` | Extra toolsets: `android`, `desktop` |
| `--vision` | `auto` | `auto` asks LM Studio whether the model sees images; `native`, `off`; `always` (with `--vision-model`) describes every screenshot |
| `--vision-model` | `$MAXX_VISION_MODEL` | A second model that describes screenshots for a text-only main model |
| `--check <cmd>` | detected | Build command for the fix-it loop; `off` for syntax checks only |
| `--fix-tries <n>` | `3` | Times a failed check goes back to the model; `0` turns the loop off |
| `--no-plan` | | Don't offer the `plan` tool |
| `--helper` | `$MAXX_HELPER` or the app's setting | A bigger model for stuck steps; `claude-*` uses the Claude API, `off` disables it |
| `--helper-url`, `--helper-kind`, `--helper-after` | | OpenAI-compatible URL for the helper; `lmstudio`/`openai`/`anthropic`; failures before escalating (3) |
| `-p` | | Run one prompt and exit |
| `-c`, `--resume <ref>` | | Continue the latest, or a chosen, session in this project |

In a session: `/help`, `/mode <m>`, `/with <sets|none>`, `/plan`, `/helper [on|off]`, `/sessions`, `/resume <ref>`, `/new`, `/title`, `/delete`, `/undelete`, `/attach`, `/checkpoints`, `/rewind <n>`, `/clear`, `/exit`.
Ctrl-C stops the current turn.

## How it works

```
src/
  cli.ts           entry point, readline UI, slash commands
  loop.ts          the agent loop: send, validate and run tool calls, append, repeat
  llm.ts           streaming OpenAI-compatible client + tool-call rescue
  context.ts       system prompt, MAXX.md project notes, truncation, compaction
  learn.ts         rules learned from your corrections (MAXX.md section, dedupe, prompts)
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
