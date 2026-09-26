<div align="center">
  <img src="static/icon.png" alt="Ijwi ry'Ikirundi AI" width="120" style="border-radius: 50%;">
</div>

# Kirundi Contribution App

**Ikirundi cacu, Ijwi ryacu!**  
*Notre langue, notre voix.*

App web pour enrichir le dataset Kirundi : traductions et nouvelles phrases.

![Live](https://img.shields.io/badge/🚀_Live-Application-green?style=for-the-badge)![HF](https://img.shields.io/badge/Dataset-Hugging_Face-yellow?style=for-the-badge)

---



### À propos

Partie de [Ijwi ry'Ikirundi AI](https://github.com/Ijwi-ry-Ikirundi-AI).  
Les contributions partent vers Google Sheets, puis sont fusionnées dans le dataset.

### Modes


| Niveau        | Action                                        |
| ------------- | --------------------------------------------- |
| **Facile**    | Kirundi → Français (suggestions IA possibles) |
| **Moyen**     | Français → Kirundi                            |
| **Difficile** | Ajouter une paire originale KR + FR           |


Dark mode · FR/EN · mobile · rangs gamifiés.

### Lancer en local

```bash
python -m http.server 8000
# http://localhost:8000
```



### Structure

```
├── index.html
├── static/                 # JS, CSS, icônes
├── french_prompts.txt      # Prompts mode Moyen
├── generate_prompts.py     # Offline : remplir french_prompts.txt
└── requirements.txt
```

## 🛠 Technical Details

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Tailwind CSS + Custom CSS (buttons, dark mode)
- **Data Source**: Live data from Hugging Face
- **Storage**: Browser localStorage for progress tracking
- **Deployment**: GitHub Pages compatible
- **Backend Script**: [Google Apps Script](https://script.google.com/u/0/home/projects/1l-Hm-YNWRILzZvQnkdGnxtJSrIkmQiHlAWx_WI4hVJDTOJNtdOMrs2uc/edit)
- **Central Database**: [Google Sheets](https://docs.google.com/spreadsheets/d/1-XNx98U5NA3-_cH2608GT-izUyxIN0pYgsZRPpWbHpc/edit?gid=98546047#gid=98546047)
- **Live Demo**: [Kirundi Contribution App](https://www.samandari.dev/kirundi-contribution-app/)

### Troubleshooting

**Q: What is the Gamification Rank Card?**  
A: The rank card displays your contribution progress with a visual ranking system. It shows your current rank (🌱 Beginner → 👑 Master → 🦁 Legend), total contributions, the next rank you can achieve, and how many more contributions are needed. The progress bar provides a visual indication of your advancement.

**Q: Why does the percentage in the progress bar look cut off on my phone?**  
A: The percentage should now be clearly visible with a dark text color and drop shadow effect in light mode. Try refreshing your browser (Ctrl+Shift+R) or clearing your cache if it still appears unclear.

**Q: Why do I see both an error and a congratulations/completion message at the same time?**  
A: This should never happen. The app now ensures only one is visible at a time. If you see both, try a hard refresh (Ctrl+Shift+R) or clear your browser cache.

**Q: How can I report a problem with a Kirundi phrase?**  
A: In Easy Level, click the "Report a problem" button below the Kirundi phrase to submit a correction or flag an issue.

**Q: How do I enable dark mode?**  
A: Click the circular button in the top-right corner (next to the language toggle). The moon icon switches to dark mode, and the sun icon switches back to light mode. Your preference is saved automatically.

**Q: What are AI suggestions in Easy Mode?**  
A: When available, the app shows machine-generated French translations for Kirundi phrases. You can approve them with one click or edit them manually if needed.

### Support

[WhatsApp](https://wa.me/25777568903) · [Email](mailto:cezaremardini10@gmail.com)

**🇧🇮 Preserving Heritage • Building Future • Empowering Community 🇧🇮**

© 2026 Ijwi Ry'Ikirundi AI Team
