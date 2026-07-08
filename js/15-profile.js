'use strict';

/* ════════════════════════════════════════════════════════════
   15. PROFİL
════════════════════════════════════════════════════════════ */
function updateProfileStats() {
    document.getElementById('stat-total-books').textContent  = STATE.books.length;
    document.getElementById('stat-finished').textContent     = STATE.finishedBooks.length;
    const activePages   = STATE.books.reduce((s, b) => s + (b.pagesRead || 0), 0);
    const finishedPages = STATE.finishedBooks.reduce((s, b) => s + (b.pages || 0), 0);
    document.getElementById('stat-total-pages').textContent  = activePages + finishedPages;

    const listDiv = document.getElementById('finished-list');
    if (!listDiv) return;
    if (STATE.finishedBooks.length === 0) {
        listDiv.innerHTML = '<div class="status-msg">Henüz eklenmemiş</div>';
        return;
    }
    listDiv.innerHTML = STATE.finishedBooks.map((item, i) => `
        <div class="finished-book">
            <span>📗 ${escapeHtml(item.name)} <span style="font-size:12px;color:var(--muted)">${item.pages > 0 ? item.pages + ' sayfa' : ''}</span></span>
            <button onclick="removeFinishedBook(${i})" style="background:transparent;border:none;color:var(--danger);font-size:20px;cursor:pointer;line-height:1">✕</button>
        </div>`).join('');
}

window.removeFinishedBook = function(idx) {
    STATE.finishedBooks.splice(idx, 1);
    saveState();
    updateProfileStats();
};

