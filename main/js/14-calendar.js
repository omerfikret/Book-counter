'use strict';

/* ════════════════════════════════════════════════════════════
   14. TAKVİM
════════════════════════════════════════════════════════════ */
const calState = {};
const TR_MONTHS_LONG = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

function renderCalendar(bookId, year, month) {
    calState[bookId] = { year, month };
    const book      = STATE.books.find(b => b.id === bookId);
    const container = document.getElementById(`calendar-${bookId}`);
    const labelEl   = document.getElementById(`cal-label-${bookId}`);
    if (!book || !container) return;

    if (labelEl) labelEl.textContent = `${TR_MONTHS_LONG[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const today    = todayStr();
    const startPad = (firstDay.getDay() || 7) - 1;

    let html = '<div class="calendar-grid">';
    ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });
    for (let i = 0; i < startPad; i++) html += '<div class="cal-cell empty"></div>';
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const ds    = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const pages = book.readLog[ds] || 0;
        let   cls   = 'cal-cell';
        if (pages > 0)  cls += ' has-read';
        if (ds === today) cls += ' today';
        const tip = pages > 0 ? `title="${pages} sayfa okundu"` : '';
        html += `<div class="${cls}" ${tip}>${d}</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

window.calNav = function(bookId, dir) {
    const cs = calState[bookId] || { year: new Date().getFullYear(), month: new Date().getMonth() };
    let { year, month } = cs;
    month += dir;
    if (month < 0)  { month = 11; year--; }
    if (month > 11) { month = 0;  year++; }
    renderCalendar(bookId, year, month);
};

