'use strict';

/* ════════════════════════════════════════════════════════════
   17. PANEL GEÇİŞİ
════════════════════════════════════════════════════════════ */
function initTabs() {
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const panelId = btn.dataset.panel;
            if (!panelId) return;
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(panelId).classList.add('active');
            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (panelId === 'panel-profile') { updateProfileStats(); renderProfileCharts(); }
            if (panelId !== 'panel-book-detail') {
                document.getElementById('book-detail-tab').style.display = 'none';
            }
        });
    });
}

