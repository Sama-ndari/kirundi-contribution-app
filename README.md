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
Submissions go to Google Sheets, then maintainers merge them into the dataset
(via **Dataset-Management**).

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

### Structure

```
├── index.html
├── static/                 # JS, CSS, icons, og-image
├── french_prompts.txt      # Medium-mode prompts
├── generate_prompts.py     # Offline: refill french_prompts.txt
└── requirements.txt
```

## Technical Details

- **Frontend**: HTML5, CSS3, vanilla JavaScript
- **Styling**: Tailwind CSS + custom CSS (Editorial Burundi theme)
- **Data source**: Live `metadata.csv` from Hugging Face
- **Storage**: Browser `localStorage` for progress
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
