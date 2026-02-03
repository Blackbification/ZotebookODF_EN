// ZotebookODF - Popup v6.0
// Export with RTF Scan markers for Zotero

class ZoteroSync {
  constructor() {
    this.zoteroLib = [];
    this.data = null;
    this.init();
  }

  async init() {
    // Load Zotero library (now with item keys)
    const stored = await chrome.storage.local.get(['zoteroLibrary']);
    this.zoteroLib = stored.zoteroLibrary || [];
    this.updateZoteroUI();

    // Load citation data
    this.loadCitationData();

    // Events
    document.getElementById('zoteroFile').onchange = e => this.loadZotero(e);
    document.getElementById('clearLib').onclick = () => this.clearZotero();
    document.getElementById('refreshData').onclick = () => this.loadCitationData();
    document.getElementById('clearCitations').onclick = () => this.clearCitations();
    document.getElementById('copyText').onclick = () => this.copyAll();
    document.getElementById('exportZotero').onclick = () => this.exportZoteroTxt();
  }

  // ===== ZOTERO =====

  async loadZotero(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const json = JSON.parse(await file.text());
      const items = Array.isArray(json) ? json : (json.items || []);

      this.zoteroLib = items.map(it => ({
        title: it.title || '',
        authors: this.fmtAuthors(it.author || it.creators),
        year: this.fmtYear(it),
        journal: it['container-title'] || it.publicationTitle || '',
        doi: it.DOI || '',
        // Citation key - Zotero's unique identifier
        citationKey: it['citation-key'] || it.citationKey || it.id || '',
        id: it.id || ''
      }));

      await chrome.storage.local.set({ zoteroLibrary: this.zoteroLib });
      this.updateZoteroUI();
      this.toast(`✓ ${this.zoteroLib.length} references loaded`);
      this.updateRefsUI();
    } catch (err) {
      console.error('Error:', err);
      alert('Error reading file. Make sure it is CSL JSON.');
    }
  }

  fmtAuthors(arr) {
    if (!arr || !Array.isArray(arr)) return '';
    return arr.map(a => a.family || a.lastName || a.literal || '').filter(Boolean).join(', ');
  }

  fmtYear(it) {
    if (it.issued?.['date-parts']?.[0]?.[0]) return it.issued['date-parts'][0][0];
    if (it.date) return it.date.split('-')[0];
    return '';
  }

  clearZotero() {
    this.zoteroLib = [];
    chrome.storage.local.remove(['zoteroLibrary']);
    this.updateZoteroUI();
  }

  updateZoteroUI() {
    const has = this.zoteroLib.length > 0;
    document.getElementById('noLibrary').classList.toggle('hidden', has);
    document.getElementById('hasLibrary').classList.toggle('hidden', !has);
    document.getElementById('libCount').textContent = this.zoteroLib.length;
  }

  // ===== CITATION DATA =====

  loadCitationData() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs[0]?.url?.includes('notebooklm.google.com')) {
        this.toast('Open NotebookLM');
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_DATA' }, res => {
        if (res) {
          this.data = res;
          this.updateRefsUI();
        }
      });
    });
  }

  clearCitations() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.url?.includes('notebooklm.google.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR' }, () => {
          this.data = null;
          this.updateRefsUI();
          this.toast('Cleared');
        });
      }
    });
  }

  updateRefsUI() {
    const list = document.getElementById('referencesList');
    const badge = document.getElementById('refCount');

    if (!this.data || Object.keys(this.data.titleToRefNum).length === 0) {
      list.innerHTML = '<p class="hint">Click on citation numbers in NotebookLM</p>';
      badge.textContent = '0';
      return;
    }

    const { titleToRefNum } = this.data;
    const refs = Object.entries(titleToRefNum).sort((a, b) => a[1] - b[1]);
    badge.textContent = refs.length;

    list.innerHTML = refs.map(([title, num]) => {
      const z = this.matchZotero(title);
      const meta = z ? `${z.authors.split(',')[0]} (${z.year})` : '?';
      const cls = z ? 'matched' : 'unmatched';

      return `
        <div class="ref-item ${cls}">
          <span class="ref-num">[${num}]</span>
          <div class="ref-info">
            <div class="ref-title">${this.trunc(title, 55)}</div>
            <div class="ref-meta">${meta}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  matchZotero(title) {
    if (!this.zoteroLib.length) return null;

    const t1 = title.toLowerCase();
    let best = null, bestScore = 0;

    for (const z of this.zoteroLib) {
      const t2 = z.title.toLowerCase();
      const w1 = new Set(t1.split(/\s+/).filter(w => w.length > 3));
      const w2 = new Set(t2.split(/\s+/).filter(w => w.length > 3));

      let match = 0;
      for (const w of w1) if (w2.has(w)) match++;

      const score = w1.size ? match / w1.size : 0;
      if (score > bestScore && score > 0.4) {
        bestScore = score;
        best = z;
      }
    }

    return best;
  }

  trunc(s, n) {
    return s.length > n ? s.substring(0, n) + '...' : s;
  }

  // ===== EXPORT =====

  async getContent() {
    return new Promise(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]?.url?.includes('notebooklm.google.com')) {
          resolve(null);
          return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_FORMATTED' }, res => {
          if (!res?.text) {
            resolve(null);
            return;
          }

          // Warn if there are uncaptured citations
          if (res.uncaptured && res.uncaptured.length > 0) {
            this.toast(`⚠️ Uncaptured citations: ${res.uncaptured.join(', ')}\nClick on them in NotebookLM`);
          }

          const bib = this.makeBibliography();
          
          // Collapse consecutive duplicate references: [2], [2], [2] → [2]
          const collapsedText = this.collapseConsecutiveRefs(res.text);
          
          resolve({
            text: collapsedText,
            textRtf: this.convertToRTFMarkers(collapsedText),
            bib: bib,
            full: collapsedText + '\n\n' + '─'.repeat(30) + '\n\nReferences\n\n' + bib,
            uncaptured: res.uncaptured || []
          });
        });
      });
    });
  }

  // Collapse consecutive duplicate references: [2], [2], [2] → [2]
  collapseConsecutiveRefs(text) {
    // Pattern: find sequences like [2], [2] or [2], [2], [2]
    // and reduce them to a single [2]
    let result = text;
    let changed = true;
    
    // Repeat until no more changes
    while (changed) {
      const before = result;
      // Find [n], [n] (same repeated number) and replace with [n]
      result = result.replace(/\[(\d+)\](\s*,\s*)\[\1\]/g, '[$1]');
      changed = (before !== result);
    }
    
    return result;
  }

  // Converts [1], [2] to pandoc markers: [@citekey]
  // ODF Scan can convert these to active Zotero citations
  convertToRTFMarkers(text) {
    if (!this.data) return text;
    
    const { titleToRefNum } = this.data;
    const refToMarker = {};
    
    // Create map of refNum -> marker
    for (const [title, refNum] of Object.entries(titleToRefNum)) {
      const z = this.matchZotero(title);
      if (z && z.citationKey) {
        // Pandoc format: [@citekey] - ODF Scan recognizes this
        refToMarker[refNum] = `[@${z.citationKey}]`;
      } else if (z) {
        // Fallback: simple RTF Scan format
        const firstAuthor = z.authors.split(',')[0].trim();
        const year = z.year || 'n.d.';
        refToMarker[refNum] = `{${firstAuthor}, ${year}}`;
      } else {
        // No match in Zotero
        const shortTitle = title.split(/[:\-]/)[0].substring(0, 25).trim();
        refToMarker[refNum] = `{${shortTitle}, n.d.}`;
      }
    }
    
    // Replace [n] with markers
    let result = text;
    const nums = Object.keys(refToMarker).map(Number).sort((a, b) => b - a);
    
    for (const num of nums) {
      const marker = refToMarker[num];
      result = result.replace(new RegExp(`\\[${num}\\]`, 'g'), marker);
    }
    
    return result;
  }

  makeBibliography() {
    if (!this.data) return '';

    const { titleToRefNum } = this.data;
    const style = document.getElementById('citationStyle').value;
    const refs = Object.entries(titleToRefNum).sort((a, b) => a[1] - b[1]);

    return refs.map(([title, num]) => {
      const z = this.matchZotero(title);

      if (z) {
        const { authors, year, title: t, journal } = z;
        switch (style) {
          case 'vancouver':
            return `[${num}] ${authors}. ${t}. ${journal ? journal + '. ' : ''}${year}.`;
          case 'apa':
            return `[${num}] ${authors} (${year}). ${t}.${journal ? ' ' + journal + '.' : ''}`;
          case 'harvard':
            return `[${num}] ${authors} (${year}) '${t}'${journal ? ', ' + journal : ''}.`;
          default:
            return `[${num}] ${authors} (${year}). ${t}.`;
        }
      } else {
        return `[${num}] ${title}`;
      }
    }).join('\n\n');
  }

  // Export TXT with [@citekey] markers for Zotero ODF Scan
  async exportZoteroTxt() {
    const c = await this.getContent();
    if (!c) return alert('No content');

    // Warn if there are uncaptured citations
    if (c.uncaptured && c.uncaptured.length > 0) {
      const continuar = confirm(`⚠️ There are uncaptured citations: ${c.uncaptured.join(', ')}\n\nThese will appear as loose numbers.\n\nContinue?`);
      if (!continuar) return;
    }

    const blob = new Blob([c.textRtf], { type: 'text/plain;charset=utf-8' });
    chrome.downloads.download({
      url: URL.createObjectURL(blob),
      filename: 'notebooklm-for-zotero.txt',
      saveAs: true
    });
    
    this.toast('✓ TXT downloaded\nPaste in Word → Save .docx → ODF Scan');
  }

  async copyAll() {
    const c = await this.getContent();
    if (!c) return alert('No content');

    await navigator.clipboard.writeText(c.full);
    this.toast('✓ Copied');
  }

  toast(msg) {
    document.querySelector('.notification')?.remove();
    const n = document.createElement('div');
    n.className = 'notification';
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2500);
  }
}

document.addEventListener('DOMContentLoaded', () => new ZoteroSync());
