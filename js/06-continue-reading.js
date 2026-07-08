'use strict';

/* ════════════════════════════════════════════════════════════
   6. DEVAM ET BUTONU
════════════════════════════════════════════════════════════ */
document.getElementById('confirm-edition-btn').addEventListener('click', () => {
    const manualPages  = parseInt(document.getElementById('manual-page-override').value);
    const manualAuthor = toTitleCase((document.getElementById('manual-author-input').value || '').trim());
    const hasManualPages = !isNaN(manualPages) && manualPages > 0;
    const bookTitle    = toTitleCase((document.getElementById('new-book-title').value || '').trim());

    if (selectedEditionIdx === -1 && !hasManualPages) {
        alert('Bir baskı seçin ya da sayfa sayısını kendiniz girin.');
        document.getElementById('manual-page-override').focus();
        return;
    }

    let bookInfo;

    if (hasManualPages) {
        const base = selectedEditionIdx >= 0 ? foundEditions[selectedEditionIdx] : null;
        bookInfo = {
            title:       base ? toTitleCase(base.title)  : bookTitle,
            author:      manualAuthor || toTitleCase(base ? base.author : '') || 'Bilinmiyor',
            pages:       manualPages,
            genre:       base ? base.genre       : 'Belirtilmemiş',
            description: base ? base.description : '',
            coverUrl:    base ? base.coverUrl    : '',
        };
    } else {
        const ed = foundEditions[selectedEditionIdx];
        if (!ed.pages) {
            alert('Seçilen baskının sayfa sayısı bilinmiyor. Lütfen sayfa sayısını kendiniz girin.');
            document.getElementById('manual-page-override').focus();
            return;
        }
        bookInfo = {
            ...ed,
            title:  toTitleCase(ed.title),
            author: manualAuthor || toTitleCase(ed.author) || 'Bilinmiyor',
        };
    }

    document.getElementById('edition-section').style.display = 'none';
    document.getElementById('manual-page-override').value    = '';
    document.getElementById('manual-author-input').value     = '';
    document.getElementById('new-book-title').value          = '';
    selectedEditionIdx = -1;
    foundEditions      = [];
    showStatus('search-status', '', '');
    hideAuthorSuggestions();

    showStartModal(bookInfo);
});

document.getElementById('cancel-edition-btn').addEventListener('click', () => {
    document.getElementById('edition-section').style.display = 'none';
    document.getElementById('manual-page-override').value    = '';
    document.getElementById('manual-author-input').value     = '';
    selectedEditionIdx = -1;
    foundEditions      = [];
    showStatus('search-status', '', '');
    hideAuthorSuggestions();
});

document.getElementById('search-btn').addEventListener('click', searchBook);

document.getElementById('new-book-title').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (document.getElementById('edition-section').style.display !== 'none') {
            document.getElementById('confirm-edition-btn')?.click();
        } else {
            searchBook();
        }
    }
});

