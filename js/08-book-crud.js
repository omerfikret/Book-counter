'use strict';

/* ════════════════════════════════════════════════════════════
   8. KİTAP OLUŞTUR & SİL
════════════════════════════════════════════════════════════ */
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

