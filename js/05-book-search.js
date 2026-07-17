'use strict';

/* ════════════════════════════════════════════════════════════
   5. KİTAP ARAMA & BASKILI SEÇİM
════════════════════════════════════════════════════════════ */
let foundEditions     = [];
let selectedEditionIdx = -1;

async function searchBook() {
    const title = (document.getElementById('new-book-title').value || '').trim();
    if (!title) { showStatus('search-status', '⚠ Kitap adı girin', 'err'); return; }

    setLoading('search-btn-txt', 'search-loader', 'search-btn', true);
    document.getElementById('edition-section').style.display = 'none';
    showStatus('search-status', 'Aranıyor…', '');

    try {
        foundEditions = await fetchEditions(title);
        if (foundEditions.length === 0) {
            showStatus('search-status', 'Baskı bulunamadı — manuel girebilirsiniz.', 'err');
        } else {
            showStatus('search-status', `${foundEditions.length} baskı bulundu, seçin.`, 'ok');
        }
        showEditionSection(foundEditions);
    } catch(e) {
        showStatus('search-status', '⚠ Hata: ' + e.message, 'err');
        showEditionSection([]);
    } finally {
        setLoading('search-btn-txt', 'search-loader', 'search-btn', false);
    }
}

function showEditionSection(editions) {
    selectedEditionIdx = -1;
    document.getElementById('manual-page-override').value  = '';
    document.getElementById('manual-author-input').value   = '';
    hideAuthorSuggestions();

    const listDiv = document.getElementById('edition-list');

    if (editions.length === 0) {
        listDiv.innerHTML = '<p style="font-size:13px;color:var(--muted);padding:8px 0">Baskı bulunamadı — aşağıdan manuel giriş yapabilirsiniz.</p>';
    } else {
        listDiv.innerHTML = editions.map((ed, i) => {
            const coverHtml = ed.coverUrl
                ? `<img src="${escapeHtml(ed.coverUrl)}" alt="kapak" onerror="this.parentElement.innerHTML='📖'">`
                : '📖';
            const meta = [ed.author, ed.publisher, ed.year, langLabel(ed.language)]
                .filter(Boolean).join(' · ');
            return `
                <button class="edition-card" data-idx="${i}">
                    <div class="edition-cover">${coverHtml}</div>
                    <div style="flex:1;min-width:0">
                        <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(ed.title)}</div>
                        <div style="font-size:11px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(meta)}</div>
                        <div style="font-size:13px;font-weight:700;color:var(--accent);margin-top:4px">${ed.pages > 0 ? ed.pages + ' sayfa' : '? sayfa'}</div>
                    </div>
                    <div class="edition-radio"></div>
                </button>`;
        }).join('');

        listDiv.querySelectorAll('.edition-card').forEach(card => {
            card.addEventListener('click', () => {
                selectedEditionIdx = parseInt(card.dataset.idx);
                listDiv.querySelectorAll('.edition-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                document.getElementById('manual-page-override').value = '';
                document.getElementById('manual-author-input').value  = '';
                hideAuthorSuggestions();
            });
        });
    }

    document.getElementById('edition-section').style.display = 'block';

    document.getElementById('manual-page-override').onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('confirm-edition-btn')?.click();
        }
    };
}

function langLabel(code) {
    const map = { tr:'Türkçe', en:'İngilizce', de:'Almanca', fr:'Fransızca', es:'İspanyolca', it:'İtalyanca', ru:'Rusça', ja:'Japonca', ar:'Arapça' };
    return map[code] || (code ? code.toUpperCase() : '');
}

