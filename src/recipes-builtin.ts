// The recipes that come with Maxx. Short on purpose: each is loaded whole into
// the context when used. Users and projects can override one by its name.

export const BUILTIN_RECIPES: string[] = [
  `---
name: fix-failing-test
when: a test fails, or the user says something is broken and there are tests
---
1. Call run_tests to see exactly which tests fail and why. Do not guess from memory.
2. Read the failing test, then the code it calls (grep for the function name).
3. Decide whether the code or the test is wrong. The test is usually right unless the user changed what they want.
4. Make the smallest edit_file change that fixes the cause, not the symptom. Never delete or skip a test to make it pass.
5. Call run_tests again with filter set to the failing test, then once more with no filter to check nothing else broke.
6. Say in one line what was wrong and what you changed.`,

  `---
name: refactor-safely
when: rename, split, move or clean up code without changing what it does
---
1. Call run_tests first and note what passes. If there are no tests, write one small test for the behaviour you are about to touch.
2. Call git with action status. If there are uncommitted changes, call git_commit to save them before refactoring.
3. Change one thing at a time: one rename, one moved function, one split file.
4. After each step, grep for the old name to catch every caller, then call run_tests.
5. When all tests pass, call git with action diff and read it once to check nothing changed by accident.
6. Call git_commit with a message that says what moved where.`,

  `---
name: responsive-page
when: build or fix a web page so it looks right on a phone and on a desktop
---
1. Use a mobile-first layout: one column by default, then a @media (min-width: 768px) rule for wider screens.
2. Put <meta name="viewport" content="width=device-width, initial-scale=1"> in the head.
3. Use max-width: 100% on images, flex or grid with gap for rows, rem or clamp() for font sizes, and nothing fixed wider than 360px.
4. Make buttons and links at least 44px tall so they can be tapped.
5. Call snap_page with size both and look at both screenshots. Fix any text that is cut off, any sideways scrolling, and anything overlapping.
6. Repeat step 5 until both sizes look right. Fix every error snap_page reports from the console.`,

  `---
name: pwa-install
when: make a web app installable on a phone home screen and usable offline
---
1. Make sure there is a square logo (SVG or a PNG of at least 512px). If there is none, write a simple logo.svg.
2. Call make_icons with source set to that logo and kinds ["pwa", "favicon"]. (make_icons is a Studio tool; if you do not have it, ask the user to turn on 🎨 Studio.)
3. Create manifest.webmanifest with name, short_name, start_url ".", display "standalone", background_color, theme_color, and the icons make_icons listed.
4. Add <link rel="manifest" href="manifest.webmanifest">, <meta name="theme-color">, and the icon links to index.html.
5. Write sw.js that caches index.html, the CSS, the JS and the icons on install, and answers fetches from the cache first. Register it in the page's script.
6. Call snap_page to check the page still loads with no console errors.`,

  `---
name: game-juice
when: make a small web game feel fun and finished, not just working
---
1. Add a title screen with the game's name and "Press Space or tap to start", plus a game-over screen with the score and how to restart.
2. Keep a high score in localStorage and show it on both screens.
3. Call make_sounds for jump, hit, pickup and game-over effects and one music loop, then play them with Sound.play and Sound.music.
4. Add feedback on every hit: a short screen shake (4 to 8px for 150ms), a flash, and a few particles.
5. Add a pause on P or Escape, and touch controls if the game is played on a phone.
6. Speed up or add enemies slowly as the score goes up, so the game gets harder over time.
7. Call snap_page to check that the first screen draws and the console has no errors.`,

  `---
name: android-release
when: build an Android app's release APK or AAB to install or share
---
1. Call run_tests to check the unit tests pass (Gradle test) before building.
2. Check that app/build.gradle(.kts) has a versionCode and versionName. Raise both if this is a new release.
3. If there is no signing config, create a keystore with keytool, and add signingConfigs.release reading its path and passwords from keystore.properties. Add keystore.properties and *.jks to .gitignore.
4. Run gradlew assembleRelease for an APK, or bundleRelease for an AAB, using bash with a timeout of 600.
5. Report the output path (app/build/outputs/apk/release/ or .../bundle/release/) and its size.
6. If a phone is connected and the Android tools are on, install it with android_run and check that it opens.`,

  `---
name: app-icons
when: give an app or website its icons (launcher icon, favicon, PWA icons)
---
1. Write or find one square logo, preferably logo.svg: a simple shape and at most 3 colors, readable at 16px.
2. Call make_icons (a Studio tool: if you do not have it, ask the user to turn on 🎨 Studio) with that source. Pick the kinds the project needs: android for an Android app, pwa and favicon for a website, windows for a desktop app.
3. Wire the files in as make_icons describes (a manifest, link tags, or the AndroidManifest icon attributes).
4. For a website, call snap_page to check that the page still loads.`,
];
