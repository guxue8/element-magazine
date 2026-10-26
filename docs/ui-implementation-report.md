# UI implementation review

- Owned files: `index.html`, `style.css`, `src/app.js`.
- Relative static ES module imports; no fonts, assets, libraries or network requests required. Original SVG guard, enemies and ruins; CSS elemental card effects.
- Landing starts runs only from an explicit click. Saved runs can be continued; locked saves deterministically finish the committed round. Every accepted action saves immediately; combat saves locked input and final campaign state before showing snapshot frames. Playback displays the pre-combat magazine and blocks run mutation.
- Full supply / load / prepare / execute / result loop; enemy target and intents, next-wave lanes and abilities, magazine swap/delete/rest, mark and slot target pickers, selected engraving details, owned bond counts, inventory, searchable 113-card / 61-bond codex, talent purchase/reset, rules, reports, pause and 1×/2×/4× playback, optional generated sound.
- UI labels mirror campaign validation: complete backpack elemental counts, explicit supply load, ordinary enemy action timing, four total summons and two per kind. Errors surface through a live status toast.
- Validation: `node --check src/app.js` passed. Node DOM-stub smoke passed landing → explicit new run → 100-point draft → choose → load → codex → help, importing actual catalog/campaign/storage. Rendering assertions checked supply/load and prepare/execute CTAs, populated magazine, 113-card count and corrected enemy rules.
- Browser screenshot and full responsive/gameplay QA are owned by the root agent. The DOM smoke does not establish pixel layout, actual keyboard focus, audio or browser storage behavior.
