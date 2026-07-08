'use strict';

/* ════════════════════════════════════════════════════════════
   9. ORTALAMA HESAPLAMA
════════════════════════════════════════════════════════════ */
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

