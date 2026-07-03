'use strict';

function renderMobileBookList() {
    const container = document.getElementById('sidebar-books-list-mobile');
    if (!container) return;
    if (STATE.books.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted)">Henüz kitap yok</div>';
        return;
    }
    container.innerHTML = STATE.books.map(book => {
        const pct = book.totalPages > 0 ? Math.round(book.pagesRead / book.totalPages * 100) : 0;
        const coverHtml = book.coverUrl
            ? `<img src="${escapeHtml(book.coverUrl)}" alt="kapak" onerror="this.parentElement.innerHTML='📖'">`
            : '📖';
        return `
            <div class="mobile-book-item ${activeBookId === book.id ? 'active' : ''}" data-id="${book.id}">
                <div class="book-thumb-mob">${coverHtml}</div>
                <div class="book-info-mob">
                    <div class="book-title-mob">${escapeHtml(book.title)}</div>
                    <div class="book-progress-mob">%${pct} · ${book.pagesRead} sayfa</div>
                </div>
            </div>`;
    }).join('');

    container.querySelectorAll('.mobile-book-item').forEach(el => {
        el.addEventListener('click', () => { openBookPanel(el.dataset.id); });
    });
}

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