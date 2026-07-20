'use strict';

/* ════════════════════════════════════════════════════════════
   13. GRAFİKLER
════════════════════════════════════════════════════════════ */
function renderBookChart(bookId) {
    const book   = STATE.books.find(b => b.id === bookId);
    const canvas = document.getElementById(`weekly-chart-${bookId}`);
    if (!book || !canvas) return;

    const today  = new Date();
    const dow    = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dow + 1);

    const labels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const data   = [];
    const colors = [];

    for (let i = 0; i < 7; i++) {
        const d  = new Date(monday);
        d.setDate(monday.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        const p  = book.readLog[ds] || 0;
        data.push(p);
        colors.push(d.toDateString() === today.toDateString() ? '#B76E2E' : '#D4A574');
    }

    const key = `chart_${bookId}`;
    if (window[key]) window[key].destroy();
    window[key] = new Chart(canvas, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Sayfa', data, backgroundColor: colors, borderRadius: 8 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { font: { size: 11 } } }, x: { ticks: { font: { size: 11 } }, grid: { display: false } } }
        }
    });

    const avgDiv = document.getElementById(`week-avg-${bookId}`);
    if (avgDiv) {
        const weekTotal = data.reduce((a, b) => a + b, 0);
        const readDays  = data.filter(v => v > 0).length;
        const avg       = readDays > 0 ? Math.round(weekTotal / readDays) : 0;
        avgDiv.textContent = `Bu hafta: ${weekTotal} sayfa`;
    }
}

let weeklyChart = null, monthlyChart = null;

function renderProfileCharts() {
    const weeklyData = {};
    STATE.books.forEach(b => {
        Object.entries(b.readLog).forEach(([date, pages]) => {
            const wk = getWeekNumber(date);
            if (!weeklyData[wk]) weeklyData[wk] = [];
            weeklyData[wk].push(pages);
        });
    });
    const weeks  = Object.keys(weeklyData).sort();
    const wData  = weeks.map(w => Math.round(weeklyData[w].reduce((a, b) => a + b, 0) / weeklyData[w].length));

    if (weeklyChart) weeklyChart.destroy();
    const wCanvas = document.getElementById('chart-weekly');
    if (wCanvas) {
        weeklyChart = new Chart(wCanvas, {
            type: 'line',
            data: {
                labels: weeks.length ? weeks.map(w => w.slice(-2) + '. hf') : ['Veri yok'],
                datasets: [{
                    label: 'Ort. Sayfa/Gün',
                    data: wData.length ? wData : [0],
                    borderColor: '#B76E2E',
                    backgroundColor: 'rgba(183,110,46,0.1)',
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#8B6B4A',
                    pointRadius: 4,
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    }

    const monthlyData = {};
    STATE.books.forEach(b => {
        Object.entries(b.monthlyAvgs || {}).forEach(([mk, avg]) => {
            if (!monthlyData[mk]) monthlyData[mk] = [];
            monthlyData[mk].push(avg);
        });
    });
    const months = Object.keys(monthlyData).sort();
    const TR_M   = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    const mData  = months.map(mk => Math.round(monthlyData[mk].reduce((a, b) => a + b, 0) / monthlyData[mk].length));

    if (monthlyChart) monthlyChart.destroy();
    const mCanvas = document.getElementById('chart-monthly');
    if (mCanvas) {
        monthlyChart = new Chart(mCanvas, {
            type: 'bar',
            data: {
                labels: months.length ? months.map(mk => { const [y, m] = mk.split('-'); return `${TR_M[parseInt(m)-1]} ${y.slice(2)}`; }) : ['Veri yok'],
                datasets: [{ label: 'Ort. Sayfa/Gün', data: mData.length ? mData : [0], backgroundColor: '#8B6B4A', borderRadius: 6 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    }
}

