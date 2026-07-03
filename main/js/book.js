'use strict';

let activeBookId = null;

function createBook(info) {
    const newBook = {
        id:          genId(),
        title:       toTitleCase(info.title),
        author:      toTitleCase(info.author || 'Bilinmiyor'),
        totalPages:  info.pages  || 0,
        genre:       info.genre  || 'Belirtilmemiş',
        description: info.description || '',
        coverUrl:    info.coverUrl    || '',
        pagesRead:   info.startPage   || 0,
        startPage:   info.startPage   || 0,
        readLog:     {},
        weeklyAvgs:  {},
        monthlyAvgs: {},
        addedDate:   todayStr(),
    };
    STATE.books.push(newBook);
    saveState();
    renderMobileBookList();
    openBookPanel(newBook.id);
    updateProfileStats();
}

window.deleteBook = function(bookId) {
    if (!confirm('Kitabı silmek istiyor musunuz?')) return;
    STATE.books = STATE.books.filter(b => b.id !== bookId);
    saveState();
    if (activeBookId === bookId) activeBookId = null;
    renderMobileBookList();
    updateProfileStats();
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-add').classList.add('active');
    document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-panel="panel-add"]').classList.add('active');
    document.getElementById('book-detail-tab').style.display = 'none';
};

function recalcAverages(book) {
    const weekBuckets = {};
    for (const [date, pages] of Object.entries(book.readLog)) {
        const wk = getWeekNumber(date);
        if (!weekBuckets[wk]) weekBuckets[wk] = [];
        weekBuckets[wk].push(pages);
    }
    book.weeklyAvgs = {};
    for (const [wk, arr] of Object.entries(weekBuckets)) {
        book.weeklyAvgs[wk] = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    }

    const monthBuckets = {};
    for (const [wk, avg] of Object.entries(book.weeklyAvgs)) {
        const [y, w] = wk.split('-W');
        const jan4   = new Date(parseInt(y), 0, 4);
        const mon    = new Date(jan4);
        mon.setDate(jan4.getDate() - ((jan4.getDay() || 7) - 1));
        mon.setDate(mon.getDate() + (parseInt(w) - 1) * 7);
        const mk = getMonthKey(mon.toISOString().slice(0, 10));
        if (!monthBuckets[mk]) monthBuckets[mk] = [];
        monthBuckets[mk].push(avg);
    }
    book.monthlyAvgs = {};
    for (const [mk, arr] of Object.entries(monthBuckets)) {
        book.monthlyAvgs[mk] = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    }
}

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
                        <span class="badge badge-blue">%${pct}</span>
                        ${book.startPage > 0 ? `<span class="badge" style="background:var(--accent2-light);color:var(--accent2)">📑 ${book.startPage}. sayfadan</span>` : ''}
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

window.logPages = function(bookId) {
    const book = STATE.books.find(b => b.id === bookId);
    if (!book) return;
    const pages = parseInt(document.getElementById('pages-input').value);
    if (isNaN(pages) || pages <= 0) {
        showStatus('log-status', '⚠ Geçerli bir sayfa sayısı girin', 'err');
        return;
    }
    const today = todayStr();
    book.readLog[today] = (book.readLog[today] || 0) + pages;
    const oldPagesRead = book.pagesRead;
    book.pagesRead = book.totalPages > 0
        ? Math.min(book.totalPages, book.pagesRead + pages)
        : book.pagesRead + pages;
    
    let bookFinished = false;
    if (book.totalPages > 0 && oldPagesRead < book.totalPages && book.pagesRead >= book.totalPages) {
        bookFinished = true;
    }
    
    recalcAverages(book);
    saveState();
    showStatus('log-status', `✓ +${pages} sayfa kaydedildi — bugün toplam: ${book.readLog[today]}`, 'ok');
    document.getElementById('pages-input').value = '';
    
    if (bookFinished) {
        STATE.finishedBooks.push({ 
            name: book.title, 
            pages: book.totalPages 
        });
        const bookIndex = STATE.books.findIndex(b => b.id === bookId);
        if (bookIndex !== -1) {
            STATE.books.splice(bookIndex, 1);
        }
        saveState();
        if (activeBookId === bookId) {
            activeBookId = null;
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById('panel-add').classList.add('active');
            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-panel="panel-add"]').classList.add('active');
            document.getElementById('book-detail-tab').style.display = 'none';
        }
        renderMobileBookList();
        updateProfileStats();
        renderProfileCharts();
        setTimeout(() => {
            alert(`🎉 Tebrikler! "${book.title}" kitabını bitirdiniz! Bitirilen kitaplar listenize eklendi.`);
        }, 100);
    } else {
        openBookPanel(bookId);
        renderProfileCharts();
    }
};

function showStartModal(bookInfo) {
    const existing = document.getElementById('start-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'start-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card">
            <h3 style="font-size:1.3rem;font-weight:700;margin-bottom:4px">${escapeHtml(bookInfo.title)}</h3>
            <p style="margin:4px 0 16px;color:var(--muted);font-size:13px">
                ${escapeHtml(bookInfo.author)}${bookInfo.pages ? ' · ' + bookInfo.pages + ' sayfa' : ''}
            </p>
            <div style="display:flex;gap:10px;margin-bottom:16px">
                <button id="modal-new" class="btn btn-primary" style="flex:1">Yeni başlıyorum</button>
                <button id="modal-continue" class="btn btn-outline" style="flex:1">Devam ediyorum</button>
            </div>
            <div id="modal-page-row" style="display:none;margin-bottom:18px">
                <label style="font-size:13px;font-weight:500;color:var(--muted);display:block;margin-bottom:6px">Hangi sayfadasınız?</label>
                <input type="number" id="modal-page-input" min="1" max="${bookInfo.pages || 9999}" placeholder="örn: 45">
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end">
                <button id="modal-cancel"  class="btn btn-outline btn-sm">İptal</button>
                <button id="modal-confirm" class="btn btn-primary btn-sm">Kitabı Ekle</button>
            </div>
        </div>`;
    document.body.appendChild(modal);

    let mode = 'new';
    document.getElementById('modal-new').style.background = 'var(--accent)';

    document.getElementById('modal-new').onclick = () => {
        mode = 'new';
        document.getElementById('modal-page-row').style.display = 'none';
        document.getElementById('modal-new').style.background = 'var(--accent)';
        document.getElementById('modal-continue').style.background = 'transparent';
    };
    document.getElementById('modal-continue').onclick = () => {
        mode = 'continue';
        document.getElementById('modal-page-row').style.display = 'block';
        document.getElementById('modal-continue').style.background = 'var(--accent-light)';
        document.getElementById('modal-new').style.background = 'transparent';
        document.getElementById('modal-page-input').focus();
    };
    document.getElementById('modal-cancel').onclick  = () => modal.remove();
    document.getElementById('modal-confirm').onclick = () => {
        let startPage = 0;
        if (mode === 'continue') {
            const inp = parseInt(document.getElementById('modal-page-input').value);
            if (!inp || inp < 1) {
                document.getElementById('modal-page-input').style.borderColor = 'var(--danger)';
                document.getElementById('modal-page-input').focus();
                return;
            }
            startPage = inp;
        }
        modal.remove();
        createBook({ ...bookInfo, startPage });
    };

    document.getElementById('modal-page-input')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('modal-confirm').click();
        }
    });

    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

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

window.removeFinishedBook = function(idx) {
    STATE.finishedBooks.splice(idx, 1);
    saveState();
    updateProfileStats();
};