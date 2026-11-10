# Shoot Companion

A lightweight Rabbit R1 creation for a shot checklist and interview prompts. No packages, API keys, AI requests, recording permissions, remote fonts, analytics or backend.

## Try it

- Open `index.html` in this folder, or the bundled `Shoot-Companion.html` one directory above.
- On desktop, use touch/click buttons or Arrow Up / Down. Enter or Space marks an item when focus is on the card or page, not another button.
- On R1, wheel up goes back; wheel down goes next. Side click marks the current shot captured or prompt asked. Click again to undo. Rapid duplicate hardware clicks within 250 ms are ignored.
- Marking does not automatically advance. This avoids skipping a shot when adjusting grip or receiving duplicate side-click events.
- Tap Shots / Prompts to switch decks. Both remember their own position.
- Menu chooses Story / interview, Collector interview, or Portrait session. Each keeps independent progress.
- Menu > Start fresh asks before clearing the current list. Other lists are not cleared. This is one active session per template, not an archive of past shoots.

## What is saved

The selected template/deck, current positions, completed shot IDs and asked prompt IDs. Changes are queued immediately and written serially so a slow older save cannot overwrite a later one. Wait for Browser saved or R1 saved before closing.

On the R1, the app uses the documented `window.creationStorage.plain` API with Base64 data. On desktop it uses localStorage. These stores are separate; desktop preview progress does not sync to your R1. The app has no client names, file uploads, audio capture or free-text notes.

A corrupt or unreadable saved session is NOT silently replaced. The app starts a temporary in-memory session and shows a warning. Menu > Save again explicitly replaces stored state with the current in-memory session. Save errors also show a warning and block the app's Exit button until a successful retry. This cannot prevent closing the browser, the OS terminating the app or power loss; unsaved changes may be lost. Storage calls time out after four seconds; actual device storage behavior still needs testing.

## Starter content

- Story / interview: permission, technical checks, establishing shot, main conversation, action/detail coverage, portrait, room tone and pickups.
- Collector interview: safe handling, object coverage, provenance questions, records/privacy and credits. Prompts distinguish documentation from recollection, without making authenticity claims.
- Portrait session: brief, technical check, environmental and core portraits, movement, crop coverage and final review.

Edit the `templates` array in `core.js` to change the lists. Rows are `[id, category, title, description]` for shots and `[id, category, question]` for prompts. Keep IDs stable when changing wording; retain existing IDs if you want existing progress to load. If removing an ID or making structural changes, start fresh before updating, or explicitly save a new in-memory session after the version change. Keep titles/descriptions compact and rerun layout tests at 240 x 282. The editor is the source file, not an on-device text editor.

## Hosting and installation (hosted 2026-11-09; physical R1 install pending)

Live URL: https://billthorpe522.github.io/r1-shoot-companion/
Source repo: https://github.com/Billthorpe522/r1-shoot-companion (GitHub Pages, public)

1. Hosted the four app files (`index.html`, `style.css`, `core.js`, `app.js`) on GitHub Pages, plus `icon.png`.
2. Verified the served app at its exact final URL: browser smoke suite 30/30 against the live URL at the 240 x 282 R1 viewport; layout fit checked for every shot and prompt card in both light and dark modes (53 cards each, 0 overflow).
3. Install QR generated with Rabbit's official QR generator (`rabbit-hmi-oss/creations-sdk`, `qr/final`). Saved at `install/shoot-companion-install-qr.png`; the QR payload was decoded back and matches the creation JSON exactly (title, url, description, iconUrl, themeColor).
4. On R1, open Creations > Add via QR code and scan the installation QR (open the PNG on a second screen or phone, scan with the R1 camera).
5. Still to test on physical hardware: wheel and side-click input, progress after leaving and reopening, all three templates, and native Exit.

Hosted app source is public to anyone with its URL. Do not add private client lists or credentials to the template file. A creation is not a camera remote, audio recorder, or editing application.

## Tests

- `node shoot-companion/tests/core.test.cjs` from the workspace root runs the model/template tests.
- `tests/browser-smoke.js` is a browser-console expression for a fresh test session. Do not run it on your actual shoot progress: it changes session state. It uses emulated wheel/side events and verifies latest saved state.
- `tests/browser-layout.js` checks every shot and prompt card at exactly 240 x 282. Run it in both light and dark emulated media modes. It also changes current position.
- JSON files hold actual results from this build, including native-storage EMULATION and failure recovery. They do not establish physical-device compatibility.
- `tests/reload-results.json` records a real desktop browser reload restoring a saved session.

## Build

Run `python shoot-companion/build.py` from the workspace root to regenerate the standalone HTML and ZIP. The ZIP contains the standalone app plus editable source, documentation and tests. Opening the ZIP alone does not install a creation on an R1.

## Official platform references

- https://www.rabbit.tech/support/article/how-to-use-r1-creations
- https://github.com/rabbit-hmi-oss/creations-sdk/blob/main/plugin-demo/reference/creation-triggers.md
- https://github.com/rabbit-hmi-oss/creations-sdk/tree/main/qr

Status: hosted and verified live (30/30 smoke at 240 x 282, 0 layout overflow in light and dark). Install QR generated and payload-verified. Not yet installed or tested on a physical R1.
