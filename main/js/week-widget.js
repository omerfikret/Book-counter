'use strict';

/* ════════════════════════════════════════════════════════════
   BU HAFTA WIDGET'I (ana sayfa, aktif kitapların altında)
════════════════════════════════════════════════════════════ */
function renderWeekWidget() {
    const stripEl = document.getElementById('week-strip');
    if (!stripEl) return;

    const dayNames = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
    const today = new Date();
    const dow = today.getDay() || 7;              // Pazartesi=1 ... Pazar=7
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow - 1));

    const todayKey = todayStr();
    let totalPages = 0;
    let html = '';

    dayNames.forEach(n => { html += `<div class="cal-day-name">${n}</div>`; });

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dKey = d.toISOString().split('T')[0];

        let dayPages = 0;
        STATE.books.forEach(book => {
            if (book.readLog && book.readLog[dKey]) dayPages += book.readLog[dKey];
        });
        totalPages += dayPages;

        const classes = ['cal-cell'];
        if (dayPages > 0) classes.push('has-read');
        if (dKey === todayKey) classes.push('today');

        html += `<div class="${classes.join(' ')}">${d.getDate()}</div>`;
    }

    stripEl.innerHTML = html;

    const avgEl    = document.getElementById('week-avg');
    const totalEl  = document.getElementById('week-total');
    if (avgEl)    avgEl.textContent    = Math.round(totalPages / 7);
    if (totalEl)  totalEl.textContent  = totalPages;
    if (activeEl) activeEl.textContent = STATE.books.length;
}