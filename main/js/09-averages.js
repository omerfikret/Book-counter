'use strict';

/* ════════════════════════════════════════════════════════════
   9. ORTALAMA HESAPLAMA
════════════════════════════════════════════════════════════ */
function recalcAverages(book) {
    // İçinde bulunulan hafta henüz tamamlanmadığı için sabit /7 yerine
    // o haftadan bugüne kadar geçen gün sayısına bölünmeli.
    const todayWeekKey = getWeekNumber(new Date().toISOString().slice(0, 10));
    const todayDow      = new Date().getDay() || 7; // Pzt=1 ... Paz=7

    const weekBuckets = {};
    for (const [date, pages] of Object.entries(book.readLog)) {
        const wk = getWeekNumber(date);
        if (!weekBuckets[wk]) weekBuckets[wk] = [];
        weekBuckets[wk].push(pages);
    }
    book.weeklyAvgs = {};
    for (const [wk, arr] of Object.entries(weekBuckets)) {
        const total   = arr.reduce((a, b) => a + b, 0);
        const divisor = (wk === todayWeekKey) ? todayDow : 7;
        book.weeklyAvgs[wk] = Math.round(total / divisor);
    }

    // Aylık ortalama, haftalık ortalamaların ortalaması olarak değil (çift katmanlı
    // yuvarlama/ağırlık hatasına yol açıyordu), doğrudan o aydaki toplam sayfa /
    // o aydaki gün sayısı olarak hesaplanır. Ay henüz bitmediyse bugüne kadarki
    // gün sayısına bölünür.
    const todayMonthKey = getMonthKey(new Date().toISOString().slice(0, 10));
    const todayDate     = new Date().getDate();

    const monthTotals = {};
    for (const [date, pages] of Object.entries(book.readLog)) {
        const mk = getMonthKey(date);
        monthTotals[mk] = (monthTotals[mk] || 0) + pages;
    }
    book.monthlyAvgs = {};
    for (const [mk, total] of Object.entries(monthTotals)) {
        const [y, m]      = mk.split('-').map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        const divisor      = (mk === todayMonthKey) ? todayDate : daysInMonth;
        book.monthlyAvgs[mk] = Math.round(total / divisor);
    }
}