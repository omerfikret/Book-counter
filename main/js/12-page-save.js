'use strict';

/* ════════════════════════════════════════════════════════════
   12. SAYFA KAYDETME (Bitirme kontrolü eklendi)
════════════════════════════════════════════════════════════ */
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
    
    // Kitap bitti mi kontrol et (totalPages varsa ve yeni okunan sayfa toplam sayfaya eşit veya geçtiyse)
    let bookFinished = false;
    if (book.totalPages > 0 && oldPagesRead < book.totalPages && book.pagesRead >= book.totalPages) {
        bookFinished = true;
    }
    
    recalcAverages(book);
    saveState();
    showStatus('log-status', `✓ +${pages} sayfa kaydedildi — bugün toplam: ${book.readLog[today]}`, 'ok');
    document.getElementById('pages-input').value = '';
    
    // Kitap bittiyse bitirilen kitaplara ekle ve aktif kitaplardan çıkar
    if (bookFinished) {
        // Bitirilen kitaplara ekle
        STATE.finishedBooks.push({ 
            name: book.title, 
            pages: book.totalPages 
        });
        // Aktif kitaplardan çıkar
        const bookIndex = STATE.books.findIndex(b => b.id === bookId);
        if (bookIndex !== -1) {
            STATE.books.splice(bookIndex, 1);
        }
        saveState();
        // Eğer açık olan kitap biten kitapsa paneli kapat
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
        // Kullanıcıya bildir
        setTimeout(() => {
            alert(`🎉 Tebrikler! "${book.title}" kitabını bitirdiniz! Bitirilen kitaplar listenize eklendi.`);
        }, 100);
    } else {
        openBookPanel(bookId);
        renderProfileCharts();
    }
};

