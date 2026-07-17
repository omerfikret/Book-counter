'use strict';

/* ════════════════════════════════════════════════════════════
   16. BİTİRİLEN KİTAP
════════════════════════════════════════════════════════════ */
async function addFinishedBook() {
    const val = toTitleCase((document.getElementById('finished-input').value || '').trim());
    if (!val) return;

    setLoading('fin-btn-txt', 'fin-loader', 'add-finished-btn', true);
    showStatus('fin-status', 'Baskılar aranıyor…', '');

    try {
        const editions = await fetchEditions(val);
        setLoading('fin-btn-txt', 'fin-loader', 'add-finished-btn', false);
        showFinishedModal(val, editions);
    } catch(e) {
        setLoading('fin-btn-txt', 'fin-loader', 'add-finished-btn', false);
        showStatus('fin-status', '⚠ Hata: ' + e.message, 'err');
    }
}

function showFinishedModal(bookName, editions) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    let selIdx = -1;

    const rows = editions.map((ed, i) => `
        <button class="edition-card" data-idx="${i}">
            <div class="edition-cover">${ed.coverUrl ? `<img src="${escapeHtml(ed.coverUrl)}" onerror="this.parentElement.innerHTML='📖'">` : '📖'}</div>
            <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(toTitleCase(ed.title))}</div>
                <div style="font-size:11px;color:var(--muted)">${escapeHtml(toTitleCase(ed.author))}${ed.year ? ' · ' + ed.year : ''}</div>
                <div style="font-size:13px;font-weight:700;color:var(--accent)">${ed.pages > 0 ? ed.pages + ' sayfa' : '? sayfa'}</div>
            </div>
            <div class="edition-radio"></div>
        </button>`).join('');

    modal.innerHTML = `
        <div class="modal-card">
            <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:4px">📚 Baskı Seç</h3>
            <p style="font-size:13px;color:var(--muted);margin-bottom:14px">${escapeHtml(bookName)}</p>
            <div style="max-height:300px;overflow-y:auto">${rows || '<p style="color:var(--muted);font-size:13px">Baskı bulunamadı</p>'}</div>
            <div class="divider">veya</div>
            <div>
                <label style="font-size:13px;font-weight:500;color:var(--muted);display:block;margin-bottom:6px">✏️ Sayfa sayısını kendin gir</label>
                <input id="manualPagesFin" type="number" placeholder="Sayfa sayısı" min="1">
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
                <button id="modalFinCancel" class="btn btn-outline btn-sm">İptal</button>
                <button id="modalFinOk"     class="btn btn-primary btn-sm">Kitabı Ekle</button>
            </div>
        </div>`;
    document.body.appendChild(modal);

    modal.querySelectorAll('.edition-card').forEach(c => {
        c.addEventListener('click', () => {
            selIdx = parseInt(c.dataset.idx);
            modal.querySelectorAll('.edition-card').forEach(x => x.classList.remove('selected'));
            c.classList.add('selected');
            document.getElementById('manualPagesFin').value = '';
        });
    });

    document.getElementById('modalFinCancel').onclick = () => modal.remove();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    const finOk = () => {
        const manual = parseInt(document.getElementById('manualPagesFin').value);
        let pages = 0;
        if (!isNaN(manual) && manual > 0)  pages = manual;
        else if (selIdx >= 0)              pages = editions[selIdx]?.pages || 0;

        if (pages <= 0) {
            alert('Lütfen bir baskı seçin ya da sayfa sayısını girin.');
            return;
        }
        STATE.finishedBooks.push({ name: toTitleCase(bookName), pages });
        saveState();
        updateProfileStats();
        modal.remove();
        document.getElementById('finished-input').value = '';
        showStatus('fin-status', `✓ "${escapeHtml(bookName)}" eklendi — ${pages} sayfa.`, 'ok');
    };

    document.getElementById('modalFinOk').onclick = finOk;

    document.getElementById('manualPagesFin')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finOk();
        }
    });
}

document.getElementById('add-finished-btn').addEventListener('click', addFinishedBook);

document.getElementById('finished-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addFinishedBook();
    }
});

