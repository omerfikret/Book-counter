'use strict';

/* ════════════════════════════════════════════════════════════
   7. KİTAP BAŞLATMA MODALI
════════════════════════════════════════════════════════════ */
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

