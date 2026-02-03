# 📚 ZotebookODF

**Export NotebookLM responses with formal academic citations and automatic bibliography**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://github.com/your-username/ZotebookODF)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/Version-1.0.0-green)]()

---

## 🎯 What problem does it solve?

**NotebookLM** by Google is great for analyzing scientific papers. But it has a problem: citations are generic numbers (1, 2, 3...) that **don't work for academic documents**.

### Before (NotebookLM):
```
Exercise improves health in RA patients 1, 2, confirming 
that moderate intensity is safe 3, 4, 5.
```

### After (with ZotebookODF):
```
Exercise improves health in RA patients [1], [2], confirming 
that moderate intensity is safe [3].

──────────────────────────────────────────

References

[1] Jahanbin I, Hoseini Moghadam M, Nazarinia M, Ghodsbin F, Bagheri Z, 
    Ashraf A. The Effect of Conditioning Exercise on the Health Status 
    and Pain in Patients with Rheumatoid Arthritis. Int J Community 
    Based Nurs Midwifery. 2014;2(3):169-76.

[2] Lange E, Kucharski D, Svedlund S, et al. Effects of Aerobic and 
    Resistance Exercise in Older Adults With Rheumatoid Arthritis. 
    Arthritis Care Res. 2019;71(1):61-70. doi:10.1002/acr.23589

[3] Li Z, Wang XQ. Clinical effect and biological mechanism of exercise 
    for rheumatoid arthritis: A mini review. Front Immunol. 2023;13:1089621.
```

---

## ✨ What does ZotebookODF do?

- ✅ **Captures citations** by clicking on NotebookLM numbers
- ✅ **Cross-references with your Zotero library** to get complete metadata
- ✅ **Generates automatic bibliography** (Vancouver, APA, Harvard)
- ✅ **Collapses duplicate citations**: `[2], [2], [2]` → `[2]`
- ✅ **Exports for Zotero ODF Scan** → active citations in Word

---

# 📋 PREREQUISITES

Before installing ZotebookODF, you need:

### 1. Google Chrome
- Download: https://www.google.com/chrome/

### 2. Zotero (desktop version)
- Download: https://www.zotero.org/download/
- Install it and create your reference library

### 3. Better BibTeX for Zotero (RECOMMENDED)
This plugin automatically generates the "citation keys" that ZotebookODF needs.

**Installation:**
1. Download the `.xpi` file from: https://retorque.re/zotero-better-bibtex/installation/
2. In Zotero: **Tools** → **Add-ons**
3. Click the gear icon ⚙️ → **"Install Add-on From File..."**
4. Select the downloaded `.xpi` file
5. Restart Zotero

### 4. ODF Scan Plugin for Zotero (if you want active citations)
**Only needed if you want to convert citations to active Zotero citations in Word.**

**Installation:**
1. Go to: https://zotero-odf-scan.github.io/zotero-odf-scan/
2. Download the `.xpi` file
3. In Zotero: **Tools** → **Add-ons**
4. Click the gear icon ⚙️ → **"Install Add-on From File..."**
5. Select the downloaded `.xpi` file
6. Restart Zotero
7. Verify: **"ODF Scan"** should appear in the **Tools** menu

### 5. Zotero Plugin for Word (if you want active citations)
**For active citations to work in Word.**

**Installation:**
1. In Zotero: **Edit** → **Preferences** → **Cite**
2. **"Word Processors"** tab
3. Click **"Install Microsoft Word Add-in"**
4. Restart Word
5. Verify: a **"Zotero"** tab should appear in Word

---

# 🚀 ZOTEBOOKODF INSTALLATION

## Step 1: Download the extension

1. Go to the project page on GitHub
2. Click the green **"< > Code"** button
3. Select **"Download ZIP"**
4. A file `ZotebookODF-main.zip` will be downloaded

## Step 2: Unzip the file

### On Windows:
1. Go to your **Downloads** folder
2. Right-click on `ZotebookODF-main.zip`
3. Select **"Extract All..."**
4. Click **"Extract"**
5. A folder called `ZotebookODF-main` will be created

### On Mac:
1. Go to your **Downloads** folder
2. Double-click on `ZotebookODF-main.zip`
3. A folder `ZotebookODF-main` will be created automatically

## Step 3: Install the extension in Chrome

1. Open **Google Chrome**
2. In the address bar, type: `chrome://extensions`
3. Press **Enter**
4. In the top right corner, enable **"Developer mode"** (the toggle switch)
5. New buttons will appear. Click **"Load unpacked"**
6. Navigate to the `ZotebookODF-main` folder you unzipped
7. Select the folder and click **"Select Folder"**

✅ **Done!** You'll see the 📚 icon in your Chrome extensions bar.

**Tip:** If you don't see the icon, click the puzzle icon 🧩 in Chrome and pin ZotebookODF.

---

# 📖 COMPLETE USER GUIDE

## PART 1: Setup (first time only)

### 1.1 Export your Zotero library

1. Open **Zotero** on your computer
2. In the left panel, right-click on the **folder/collection** containing the papers you'll use in NotebookLM
3. Select **"Export Collection..."**
4. In the "Format" dropdown, select **"CSL JSON"**
5. Click **"OK"**
6. Choose where to save the file (e.g., `my-papers.json`)
7. Click **"Save"**

**⚠️ IMPORTANT:** 
- Export ONLY the collection containing the papers you uploaded to NotebookLM
- If you add more papers to NotebookLM, re-export the JSON

### 1.2 Load the JSON into ZotebookODF

1. Open **NotebookLM** in Chrome: https://notebooklm.google.com
2. Click the 📚 **ZotebookODF** icon in the extensions bar
3. In the **"1. Zotero Library"** section, click **"📁 Load JSON"**
4. Select the `.json` file you exported from Zotero
5. You'll see the message **"✓ X references"** confirming it loaded

---

## PART 2: Capturing citations in NotebookLM

### 2.1 Generate a response with citations

1. In NotebookLM, open your notebook with the papers
2. Type a question in the chat
3. NotebookLM will generate a response with citation numbers: `1`, `2`, `3`...

### 2.2 Capture each citation

**This step is ESSENTIAL:**

1. In NotebookLM's response, **click on each citation number** (1, 2, 3...)
2. A popup will appear showing the paper title
3. ZotebookODF automatically captures that information
4. Repeat for ALL citation numbers you want to include

**Verify:** In the ZotebookODF popup, the **"2. Captured References"** section will show how many you've captured.

**⚠️ IMPORTANT:**
- You must click on EVERY number you want to cite
- If you don't click a number, ZotebookODF won't know which paper it corresponds to
- You can click **🔄** to refresh if something doesn't appear

---

## PART 3: Export

### Option A: Copy formatted text (easiest)

**Use this option if you just want the text with citations and bibliography to paste.**

1. In ZotebookODF, select the **citation style**:
   - **Vancouver**: [1], [2], [3] — ideal for medicine
   - **APA**: (Author et al., 2019) — ideal for psychology
   - **Harvard**: (Author et al. 2019) — general use

2. Click **"📋 Copy All"**

3. The text with citations + bibliography is in your clipboard

4. Paste wherever you want (**Ctrl+V** or **Cmd+V**):
   - Microsoft Word
   - Google Docs
   - Any text editor

✅ **Result:** Text with formatted citations and ready bibliography.

---

### Option B: Export for Zotero ODF Scan (active citations)

**Use this option if you want ACTIVE citations you can manage from Zotero.**

#### Step B.1: Export from ZotebookODF

1. In ZotebookODF, click **"📥 TXT for Zotero ODF Scan"**
2. A file `notebooklm-para-zotero.txt` will be downloaded

#### Step B.2: Prepare the document in Word

1. Open the `notebooklm-para-zotero.txt` file with **Notepad**
2. Select all text: **Ctrl+A**
3. Copy: **Ctrl+C**
4. Open **Microsoft Word**
5. Paste the text: **Ctrl+V**
6. Save the document as **Word (.docx)**:
   - **File** → **Save As**
   - Choose location
   - Make sure format is **"Word Document (*.docx)"**
   - Click **Save**

#### Step B.3: Run ODF Scan in Zotero

1. Open **Zotero**
2. Go to **Tools** → **ODF Scan...**
3. In the dialog that appears:
   - **File type:** select **"Pandoc -> Zotero citations"**
   - **Input file:** click "Browse" and select the `.docx` you saved
   - **Output file:** choose where to save the result (can be same name with "-cited" at the end)
4. Click **"Next"**
5. ODF Scan will scan the document and detect the `[@citekey]` markers
6. Click **"Next"** and then **"Done"**

#### Step B.4: Set the citation style in Word

1. Open the resulting document in **Word**
2. You'll see that citations are now Zotero fields (they highlight in gray when clicked)
3. In the **Zotero** tab in Word:
   - Click **"Document Preferences"**
   - Select the **citation style** you want (Vancouver, APA, etc.)
   - Click **OK**
4. Citations will transform to the chosen format

#### Step B.5: Add the bibliography

1. Place your cursor where you want the bibliography (usually at the end)
2. In the **Zotero** tab in Word, click **"Add/Edit Bibliography"**
3. Zotero will automatically generate the bibliography

✅ **Result:** Document with active citations linked to Zotero. You can change the style with one click and the bibliography updates automatically.

---

## 🎨 Available citation styles

| Style | In-text format | Ideal for |
|-------|----------------|-----------|
| **Vancouver** | [1], [2], [3] | Medicine, biomedicine, nursing |
| **APA** | (Lange et al., 2019) | Psychology, education, social sciences |
| **Harvard** | (Lange et al. 2019) | General use, business |

---

## ❓ Troubleshooting

### "Citations aren't being captured"
- **Cause:** You didn't click on the citation numbers in NotebookLM
- **Solution:** Click directly on each number (1, 2, 3...) in NotebookLM's response

### "Bibliography doesn't show all data"
- **Cause:** The Zotero JSON doesn't have complete metadata
- **Solution:** Make sure items in Zotero have title, authors, year, and journal

### "ODF Scan doesn't recognize citations"
- **Cause:** The marker format is incorrect
- **Solution:** Make sure to select **"Pandoc -> Zotero citations"** in ODF Scan

### "I don't see the Zotero tab in Word"
- **Cause:** The Word plugin isn't installed
- **Solution:** In Zotero: Edit → Preferences → Cite → "Install Microsoft Word Add-in"

### "Citation keys don't match"
- **Cause:** Better BibTeX isn't installed or keys are different
- **Solution:** Install Better BibTeX and re-export the JSON

---

## 📁 Project structure

```
ZotebookODF/
├── manifest.json       # Extension configuration
├── popup.html          # Popup interface
├── src/
│   ├── content.js      # Script injected into NotebookLM
│   ├── popup.js        # Popup logic
│   └── background.js   # Service worker
├── styles/
│   ├── popup.css       # Popup styles
│   └── content.css     # Injected styles
└── icons/              # Extension icons
```

---

## 📜 License

**AGPL-3.0** - The same license as Zotero.

You can use, modify, and distribute this software. If you modify and distribute it, you must share your code under the same license.

---

## 👤 Author

**Juan Mora Delgado**  
- Internal Medicine Specialist | Hospital Universitario de Jerez
- Associate Professor | Universidad de Cádiz
- Health AI Anti-expert

---

## 🙏 Acknowledgments

- [NotebookLM](https://notebooklm.google.com) by Google
- [Zotero](https://www.zotero.org/) - Open source reference manager
- [Better BibTeX](https://retorque.re/zotero-better-bibtex/) - Essential plugin for citation keys
- [ODF Scan](https://zotero-odf-scan.github.io/zotero-odf-scan/) - Conversion to active citations
- Claude (Anthropic) - Development assistance

---

<p align="center">
  <b>⭐ If you find it useful, give the repo a star!</b>
</p>

<p align="center">
  <i>Made with ❤️ for the research community</i>
</p>
