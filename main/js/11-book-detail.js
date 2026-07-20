'use strict';

/* ════════════════════════════════════════════════════════════
   11. KİTAP DETAY PANELİ
════════════════════════════════════════════════════════════ */
window.openBookPanel = function(bookId) {
    const book = STATE.books.find(b => b.id === bookId);
    if (!book) return;
    activeBookId = bookId;

    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-book-detail').classList.add('active');
    document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
    const bookTab = document.getElementById('book-detail-tab');
    if (bookTab) { bookTab.style.display = 'flex'; bookTab.classList.add('active'); }

    renderBookDetail(book);
    renderMobileBookList();
};

function renderBookDetail(book) {
    const pct = book.totalPages > 0 ? Math.min(100, Math.round(book.pagesRead / book.totalPages * 100)) : 0;
    const coverHtml = book.coverUrl
        ? `<img src="${escapeHtml(book.coverUrl)}" alt="kapak" style="width:100%;height:100%;object-fit:cover;border-radius:14px" onerror="this.parentElement.innerHTML='📖'">`
        : '📖';

    document.getElementById('panel-book-detail').innerHTML = `
        <div style="margin-bottom:20px">
            <div style="display:flex;gap:14px;align-items:flex-start">
                <div style="width:70px;height:100px;background:var(--accent-light);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:40px;overflow:hidden;flex-shrink:0">${coverHtml}</div>
                <div style="flex:1;min-width:0">
                    <h2 style="font-size:1.4rem;font-weight:700;line-height:1.2">${escapeHtml(book.title)}</h2>
                    <div style="color:var(--muted);font-size:13px;margin-top:4px">${escapeHtml(book.author)}</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
                        <span class="badge badge-green">${escapeHtml(book.genre)}</span>
                        ${book.totalPages ? `<span class="badge badge-orange">${book.totalPages} sayfa</span>` : ''}
                    </div>
                </div>
                <button onclick="deleteBook('${book.id}')"
                    style="background:transparent;border:1px solid var(--border);border-radius:30px;padding:6px 12px;color:var(--danger);font-size:13px;cursor:pointer;flex-shrink:0">
                    🗑
                </button>
            </div>
        </div>
        ${book.description ? `<div class="card" style="font-size:13px;color:var(--muted);line-height:1.5">📝 ${escapeHtml(book.description)}</div>` : ''}
        <div class="card">
            <div class="card-title">📊 İlerleme</div>
            <div style="display:flex;justify-content:space-between;font-size:13px">
                <span>${book.pagesRead} / ${book.totalPages || '?'} sayfa okundu</span>
                <strong style="color:var(--accent)">%${pct}</strong>
            </div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            ${book.totalPages > 0 ? `<div style="font-size:12px;color:var(--muted);margin-top:8px">Kalan: <strong>${Math.max(0, book.totalPages - book.pagesRead)}</strong> sayfa</div>` : ''}
        </div>
        <div class="card">
            <div class="card-title">📝 Bugün Okunan</div>
            <div class="flex-row">
                <input id="pages-input" type="number" placeholder="Sayfa sayısı" style="flex:1" autocomplete="off" min="1">
                <button class="btn btn-primary" id="log-pages-btn" onclick="logPages('${book.id}')">Kaydet</button>
            </div>
            <div id="log-status" class="status-msg"></div>
        </div>
        <div class="card">
            <div class="card-title">📈 Bu Haftalık Okuma</div>
            <div class="chart-container"><canvas id="weekly-chart-${book.id}"></canvas></div>
            <div id="week-avg-${book.id}" style="font-size:12px;color:var(--muted);margin-top:8px;text-align:right"></div>
        </div>
        <div class="card">
            <div class="card-title" style="display:flex;justify-content:space-between;align-items:center">
                <span>📅 Takvim</span>
                <div style="display:flex;gap:6px">
                    <button class="btn btn-outline btn-sm" onclick="calNav('${book.id}',-1)">◀</button>
                    <span id="cal-label-${book.id}" style="font-size:12px;min-width:100px;text-align:center;line-height:32px"></span>
                    <button class="btn btn-outline btn-sm" onclick="calNav('${book.id}',1)">▶</button>
                </div>
            </div>
            <div id="calendar-${book.id}"></div>
        </div>`;

    document.getElementById('pages-input')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            logPages(book.id);
        }
    });

    renderBookChart(book.id);
    renderCalendar(book.id, new Date().getFullYear(), new Date().getMonth());
}

