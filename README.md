<div align="center">
  <img src="static/icon.png" alt="Ijwi ry'Ikirundi AI" width="120" style="border-radius: 50%;">
</div>

# Kirundi Contribution App

**Ikirundi cacu, Ijwi ryacu!**  
*Our language, our voice.*

Web app to grow the Kirundi dataset: translations and new sentence pairs.

![Live](https://img.shields.io/badge/Live-Application-green?style=for-the-badge)![HF](https://img.shields.io/badge/Dataset-Hugging_Face-yellow?style=for-the-badge)

---

### About

Part of [Ijwi ry'Ikirundi AI](https://github.com/Ijwi-ry-Ikirundi-AI).  
Submissions go to Google Sheets through a Google Apps Script, then maintainers merge them
into the dataset (via **Dataset-Management**). A submission is saved in the browser first and
only counted once the server confirms it; if the server is unreachable it is retried
automatically, so nothing is lost.

Your contributions enrich the Ijwi ry'Ikirundi AI dataset, whose full version is private.
The public dataset on Hugging Face lists the Kirundi sentences that still need a translation.

### Modes

| Level | Action |
| ----- | ------ |
| **Easy** | Kirundi → French (optional AI suggestions) |
| **Medium** | French → Kirundi |
| **Hard** | Add an original KR + FR pair |

Theme and language toggles · mobile-friendly · gamified ranks.

### Run locally

```bash
python3 -m http.server 8000
# http://localhost:8000
```

The site has no build step at runtime. Only the Tailwind CSS is compiled, and the result
(`static/tailwind.css`) is committed. After adding Tailwind classes to `index.html` or
`static/js/`, rebuild it:

```bash
npm install          # once
npm run build:css
```

### Structure

```
├── index.html
├── static/
│   ├── js/                 # Classic scripts, loaded in order by index.html
│   │   ├── config.js       # Endpoints, limits, storage keys
│   │   ├── messages.js     # Every UI text, FR + EN (data-i18n keys)
│   │   ├── i18n.js         # Translation engine (data-i18n, data-i18n-placeholder, data-i18n-aria-label)
│   │   ├── api.js          # Submissions: local outbox, confirmed delivery, automatic retry
│   │   ├── easy.js / medium.js / hard.js   # The three modes
│   │   └── …               # logger, storage, csv, dataset, ui, gamification, main
│   ├── tailwind.css        # Built by `npm run build:css` (do not edit)
│   └── *.css, motion.js    # Theme, dark mode, motion
├── french_prompts.txt      # Medium-mode prompts
├── generate_prompts.py     # Offline: refill french_prompts.txt
└── tailwind.config.js, package.json   # CSS build only
```

### Submission endpoint (Google Apps Script)

Contributions go to a Google Apps Script web app (its code lives in the Apps Script editor
linked below). It also receives "Suggest a better translation" from the
[Kirundi Translator](https://huggingface.co/spaces/Ijwi-ry-Ikirundi-AI/Kirundi-Translator).
It validates every row (required fields, 500 characters max, 50 rows per request),
neutralises spreadsheet formulas, ignores a batch sent twice, limits submissions per device and
per hour, and always answers in JSON.

Contract used by `static/js/api.js` (POST, body = JSON sent as `text/plain`, so the browser
skips the CORS preflight that Apps Script cannot answer):

```json
{ "mode": "easy | medium | hard | translator", "batch_id": "…", "client_id": "…", "data": [ { … } ] }
```

Reply: `{"status": "success", "rowsAdded": 3, "batchId": "…", "duplicate": false}` or
`{"status": "error", "code": "…", "message": "…", "retryable": true}`. The app keeps and retries
a batch when the code is `busy`, `rate_limited`, `server_error` or `invalid_mode`, or when the
server cannot be reached.

To deploy a change: in the script editor, **Deploy → Manage deployments → edit (pencil) the
existing deployment → Version: New version → Deploy**. Saving the code is not enough, and
"New deployment" would create a different URL. The `/exec` URL does not change. Opening that URL in a browser shows `{"status":"ok","version":2}`.

Sheets (a missing one is created on first use):

| Sheet | Filled by |
|---|---|
| `Easy_Level_Submissions` | Easy mode. `Origin` says how the French was written: `ai_approved` (AI suggestion approved as is), `ai_edited` (suggestion changed) or `human` (no suggestion). Empty on rows sent before this column existed. |
| `Medium_Level_Submissions` | Medium mode. Before the Hard sheet existed, Hard pairs were stored here too. |
| `Hard_Level_Submissions` | Hard mode (original pairs written by contributors). |
| `Translator_Corrections` | "Suggest a better translation" in the Kirundi Translator. |
| `Submission_Log` | One line per batch: id, device, mode, sheet, first row, row count. |

**Deploy the script before the app.** The app keeps a batch whose mode the live script does not
know yet and retries it, but the script that ran before version 2 wrote the rows and then failed
to answer, so the new app would send them again.

## Technical Details

- **Frontend**: HTML5, CSS3, vanilla JavaScript
- **Styling**: Tailwind CSS (compiled, `static/tailwind.css`) + custom CSS (Editorial Burundi theme)
- **Data source**: Live `metadata.csv` from Hugging Face
- **Storage**: Browser `localStorage` for progress, preferences and submissions waiting to be sent
- **Deployment**: Static hosting (e.g. GitHub Pages / custom domain)
- **Backend script**: [Google Apps Script](https://script.google.com/u/0/home/projects/1l-Hm-YNWRILzZvQnkdGnxtJSrIkmQiHlAWx_WI4hVJDTOJNtdOMrs2uc/edit)
- **Central store**: [Google Sheets](https://docs.google.com/spreadsheets/d/1-XNx98U5NA3-_cH2608GT-izUyxIN0pYgsZRPpWbHpc/edit?gid=98546047#gid=98546047)
- **Live demo**: [Kirundi Contribution App](https://www.samandari.dev/kirundi-contribution-app/)

### Troubleshooting

**Q: What is the gamification rank card?**  
A: It shows your contribution progress and rank (🌱 Beginner → 👑 Master → 🦁 Legend), total contributions, next rank, and remaining count. The progress bar visualizes advancement.

**Q: Why does the progress percentage look cut off on mobile?**  
A: It should be readable in light mode. Hard-refresh (Ctrl+Shift+R / Cmd+Shift+R) or clear cache if it still looks wrong.

**Q: Why do I see an error and a success message at the same time?**  
A: That should not happen. Hard-refresh or clear cache. Only one mode screen is shown at a time.

**Q: How do I report a problem with a Kirundi sentence?**  
A: In Easy mode, use **Report a problem** under the Kirundi phrase to correct or flag it.

**Q: How do I switch theme or language?**  
A: Use the controls in the header (moon/sun for theme, EN/FR for language). Preference is saved in the browser.

**Q: What are AI suggestions in Easy mode?**  
A: When available, the app shows a machine-generated French draft. Approve it or edit before submit.

### Support

[WhatsApp](https://wa.me/25777568903) · [Community](https://chat.whatsapp.com/HLLVvyi5aTM1hyrHIcWn1O?mode=hqrc) · [Email](mailto:cezaremardini10@gmail.com)

**Preserving Heritage · Building the Future · Empowering Community**

© 2026 Ijwi Ry'Ikirundi AI Team
