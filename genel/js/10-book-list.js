'use strict';

/* ════════════════════════════════════════════════════════════
   10. KİTAP LİSTESİ
════════════════════════════════════════════════════════════ */
let activeBookId = null;

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

