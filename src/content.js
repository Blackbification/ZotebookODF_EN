// NotebookLM ↔ Zotero Sync - Content Script v6.0
// Busca el título en el atributo "title" del elemento ".source-title"

(function() {
  'use strict';

  console.log('[ZS] v6.0 - Captura desde .source-title[title]');

  // Estado
  let citationToTitle = {};     // {1: "Exercises...", 2: "Effects...", ...}
  let titleToRefNum = {};       // {"Exercises...": 1, "Effects...": 2}
  let nextRefNum = 1;
  
  let pendingCitation = null;
  let pendingTime = 0;

  init();

  async function init() {
    const saved = await chrome.storage.local.get(['zsCitationToTitle', 'zsTitleToRefNum', 'zsNextRefNum']);
    citationToTitle = saved.zsCitationToTitle || {};
    titleToRefNum = saved.zsTitleToRefNum || {};
    nextRefNum = saved.zsNextRefNum || 1;
    
    console.log('[ZS] Cargado:', Object.keys(titleToRefNum).length, 'refs');

    document.addEventListener('click', onDocClick, true);
    observeDOM();
    injectUI();
    
    chrome.runtime.onMessage.addListener(onMessage);
  }

  async function save() {
    await chrome.storage.local.set({
      zsCitationToTitle: citationToTitle,
      zsTitleToRefNum: titleToRefNum,
      zsNextRefNum: nextRefNum
    });
  }

  function onMessage(msg, sender, respond) {
    if (msg.type === 'GET_DATA') {
      respond({ citationToTitle, titleToRefNum, nextRefNum });
    } else if (msg.type === 'GET_FORMATTED') {
      const result = formatText();
      // Detectar citas no capturadas
      const uncaptured = findUncapturedCitations(result);
      if (uncaptured.length > 0) {
        console.log('[ZS] Citas no capturadas:', uncaptured);
      }
      respond({ text: result, uncaptured });
    } else if (msg.type === 'CLEAR') {
      citationToTitle = {};
      titleToRefNum = {};
      nextRefNum = 1;
      save();
      updateBadge();
      respond({ ok: true });
    }
    return true;
  }

  // Detectar números que parecen citas pero no están capturados
  function findUncapturedCitations(text) {
    const uncaptured = [];
    // Buscar números que parecen citas (después de texto, antes de coma/punto)
    const matches = text.matchAll(/([a-záéíóúñ])(\d{1,2})(?=\s*[,\.])/gi);
    for (const m of matches) {
      const num = parseInt(m[2]);
      if (!citationToTitle[num] && num <= 30) {
        uncaptured.push(num);
      }
    }
    // También buscar números sueltos tipo " 8 ," que no están en corchetes
    const matches2 = text.matchAll(/\s(\d{1,2})\s*[,\.]/g);
    for (const m of matches2) {
      const num = parseInt(m[1]);
      if (!citationToTitle[num] && num <= 30 && !uncaptured.includes(num)) {
        uncaptured.push(num);
      }
    }
    return [...new Set(uncaptured)].sort((a, b) => a - b);
  }

  // ========== DETECTAR CLIC EN CITA ==========

  function onDocClick(e) {
    const text = e.target.textContent?.trim();
    
    if (/^\d{1,2}$/.test(text)) {
      const num = parseInt(text);
      if (num >= 1 && num <= 99) {
        console.log('[ZS] Clic en cita:', num);
        pendingCitation = num;
        pendingTime = Date.now();
      }
    }
  }

  // ========== OBSERVAR DOM PARA DETECTAR POPUP ==========

  function observeDOM() {
    const observer = new MutationObserver(() => {
      if (!pendingCitation || Date.now() - pendingTime > 3000) return;
      
      // Buscar el elemento .source-title con atributo title
      setTimeout(tryCapture, 200);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function tryCapture() {
    if (!pendingCitation) return;

    // MÉTODO 1: Buscar .source-title con atributo title
    const sourceTitle = document.querySelector('.source-title[title]');
    if (sourceTitle) {
      const title = sourceTitle.getAttribute('title');
      if (title && title.length > 20) {
        console.log('[ZS] Encontrado via .source-title[title]:', title.substring(0, 50));
        registerCitation(pendingCitation, title);
        pendingCitation = null;
        return;
      }
    }

    // MÉTODO 2: Buscar elemento con clase que contenga "source-title" y tenga atributo title
    const altSourceTitle = document.querySelector('[class*="source-title"][title]');
    if (altSourceTitle) {
      const title = altSourceTitle.getAttribute('title');
      if (title && title.length > 20) {
        console.log('[ZS] Encontrado via [class*=source-title][title]:', title.substring(0, 50));
        registerCitation(pendingCitation, title);
        pendingCitation = null;
        return;
      }
    }

    // MÉTODO 3: Buscar en source-title-container
    const container = document.querySelector('.source-title-container, [class*="source-title-container"]');
    if (container) {
      const titleEl = container.querySelector('[title]');
      if (titleEl) {
        const title = titleEl.getAttribute('title');
        if (title && title.length > 20) {
          console.log('[ZS] Encontrado via container:', title.substring(0, 50));
          registerCitation(pendingCitation, title);
          pendingCitation = null;
          return;
        }
      }
    }

    // MÉTODO 4: Buscar cualquier elemento visible con title largo que parezca académico
    const allWithTitle = document.querySelectorAll('[title]');
    for (const el of allWithTitle) {
      const title = el.getAttribute('title');
      if (title && title.length > 40 && title.length < 400) {
        // Verificar que parece un título académico
        if (/study|trial|exercise|effect|clinical|treatment|randomised|randomized|controlled|review|analysis/i.test(title)) {
          // Verificar que el elemento es visible
          if (el.offsetParent !== null || el.closest('[class*="source"]')) {
            console.log('[ZS] Encontrado via búsqueda general:', title.substring(0, 50));
            registerCitation(pendingCitation, title);
            pendingCitation = null;
            return;
          }
        }
      }
    }

    console.log('[ZS] No se encontró título para cita', pendingCitation);
  }

  function registerCitation(citNum, title) {
    title = title.replace(/\s+/g, ' ').trim();
    
    if (citationToTitle[citNum] === title) {
      notify(`[${citNum}] ya capturada`);
      return;
    }

    citationToTitle[citNum] = title;

    if (!titleToRefNum[title]) {
      titleToRefNum[title] = nextRefNum;
      nextRefNum++;
    }

    const refNum = titleToRefNum[title];
    
    console.log('[ZS] Registrado:', citNum, '→ Ref', refNum);
    
    save();
    updateBadge();
    notify(`✓ Cita [${citNum}] → Ref [${refNum}]\n${title.substring(0, 50)}...`);
  }

  // ========== FORMATEAR TEXTO ==========

  function formatText() {
    // Capturar SOLO los mensajes del chat, no toda la página
    const messageContainers = document.querySelectorAll('.message-text-content, [class*="message-text-content"]');
    
    if (messageContainers.length === 0) {
      console.log('[ZS] No se encontraron mensajes, intentando body');
      return formatBodyText();
    }

    let allText = '';
    messageContainers.forEach(container => {
      allText += container.innerText + '\n\n';
    });

    console.log('[ZS] Capturados', messageContainers.length, 'mensajes');
    return processText(allText);
  }

  function formatBodyText() {
    let text = document.body.innerText || '';
    text = cleanUI(text);
    return processText(text);
  }

  function processText(text) {
    // Mapa: cita original → número de referencia final
    const citaToRef = {};
    for (const [cit, title] of Object.entries(citationToTitle)) {
      citaToRef[parseInt(cit)] = titleToRefNum[title];
    }

    console.log('[ZS] Mapeo cita→ref:', citaToRef);
    console.log('[ZS] Texto original (primeros 200 chars):', text.substring(0, 200));

    // Estrategia simple: buscar patrones comunes de citas en NotebookLM
    // Los números aparecen como superíndices pegados al texto o separados por comas
    
    // Paso 1: Normalizar - añadir espacio antes de números que parecen citas
    // Patrón: letra seguida de número(s) seguido de coma/punto/espacio
    let result = text;
    
    // Reemplazar de mayor a menor para evitar conflictos
    const citas = Object.keys(citaToRef).map(Number).sort((a, b) => b - a);
    
    for (const cit of citas) {
      const ref = citaToRef[cit];
      if (!ref) continue;
      
      // Múltiples patrones para capturar diferentes formatos:
      
      // 1. Número pegado después de letra: "enfermedad3," → "enfermedad [3],"
      result = result.replace(
        new RegExp(`([a-záéíóúñA-ZÁÉÍÓÚÑ])${cit}([,\\.;:\\s])`, 'g'),
        `$1 [${ref}]$2`
      );
      
      // 2. Número después de coma: ",3," o ", 3," → ", [3],"
      result = result.replace(
        new RegExp(`,\\s*${cit}([,\\.;:\\s])`, 'g'),
        `, [${ref}]$1`
      );
      
      // 3. Número al inicio después de espacio: " 3," → " [3],"
      result = result.replace(
        new RegExp(`(\\s)${cit}([,\\.;:\\s])`, 'g'),
        `$1[${ref}]$2`
      );
      
      // 4. Número al final de línea: "texto3" al final
      result = result.replace(
        new RegExp(`([a-záéíóúñA-ZÁÉÍÓÚÑ])${cit}$`, 'gm'),
        `$1 [${ref}]`
      );
    }

    // Limpiar formato
    result = result
      .replace(/\]\s*,\s*\[/g, '], [')     // ], [ formato consistente
      .replace(/\[\s*(\d+)\s*\]/g, '[$1]') // Quitar espacios dentro de []
      .replace(/\s{2,}/g, ' ')              // Múltiples espacios → uno
      .replace(/\n{3,}/g, '\n\n')           // Múltiples saltos
      .trim();

    console.log('[ZS] Texto procesado (primeros 200 chars):', result.substring(0, 200));
    
    return result;
  }

  function cleanUI(text) {
    const patterns = [
      /^settings\n/gm, /^PRO\n/gm, /^add\n.*$/gm,
      /Crear cuaderno/g, /trending_up|share\nCompartir/g,
      /Fuentes\nChat\nStudio/g, /tune\nmore_vert/g,
      /keep_pin[\s\S]*?nota/g, /keep\n[\s\S]*?nota/g,
      /copy_all|thumb_up|thumb_down/g,
      /keyboard_arrow_down.*fuentes/gi,
      /arrow_forward/g, /docs\n\(\d+\)/g,
      /NotebookLM puede ofrecer.*$/gm,
      /Respuesta lista\./g,
      /Studio\n[\s\S]*?Añadir nota/g,
      /dock_to_left[\s\S]*?Añadir nota/g,
      /📚/g, /Hoy • \d+:\d+/g,
    ];
    for (const p of patterns) text = text.replace(p, '');
    return text;
  }

  // ========== UI ==========

  function injectUI() {
    if (document.getElementById('zs-fab')) return;

    const fab = document.createElement('div');
    fab.id = 'zs-fab';
    fab.innerHTML = `
      <div class="zs-badge" id="zs-badge">0</div>
      <div class="zs-btn">📚</div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #zs-fab { position:fixed; bottom:24px; right:24px; z-index:99999; }
      #zs-fab .zs-btn {
        width:56px; height:56px; border-radius:50%;
        background:linear-gradient(135deg,#667eea,#764ba2);
        display:flex; align-items:center; justify-content:center;
        font-size:26px; cursor:pointer;
        box-shadow:0 4px 15px rgba(102,126,234,0.5);
        transition:transform .2s;
      }
      #zs-fab .zs-btn:hover { transform:scale(1.1); }
      #zs-fab .zs-badge {
        position:absolute; top:-4px; right:-4px;
        background:#e53935; color:white;
        font-size:12px; font-weight:bold;
        min-width:22px; height:22px; border-radius:11px;
        display:flex; align-items:center; justify-content:center;
        padding:0 5px;
      }
      .zs-toast {
        position:fixed; bottom:90px; right:24px;
        background:rgba(30,30,30,0.95); color:white;
        padding:12px 18px; border-radius:10px;
        font-size:13px; max-width:320px;
        white-space:pre-line; line-height:1.4;
        z-index:100000; box-shadow:0 4px 20px rgba(0,0,0,0.3);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(fab);

    fab.querySelector('.zs-btn').onclick = () => {
      const n = Object.keys(titleToRefNum).length;
      if (n === 0) {
        notify('Haz clic en los números de cita\npara capturarlos');
      } else {
        let msg = `📊 ${n} referencias\n\n`;
        const refs = Object.entries(titleToRefNum).sort((a, b) => a[1] - b[1]);
        for (const [title, num] of refs) {
          msg += `[${num}] ${title.substring(0, 40)}...\n`;
        }
        notify(msg, 6000);
      }
    };

    updateBadge();
  }

  function updateBadge() {
    const el = document.getElementById('zs-badge');
    if (el) el.textContent = Object.keys(titleToRefNum).length;
  }

  function notify(msg, ms = 3500) {
    document.querySelector('.zs-toast')?.remove();
    const t = document.createElement('div');
    t.className = 'zs-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  }

})();
