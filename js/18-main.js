'use strict';

/* ════════════════════════════════════════════════════════════
   18. BAŞLATMA
════════════════════════════════════════════════════════════ */
(function init() {
    document.getElementById('header-date').textContent =
        new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    initTabs();
    initAuthorAutocomplete();
    renderMobileBookList();
    updateProfileStats();
    renderProfileCharts();
})();
