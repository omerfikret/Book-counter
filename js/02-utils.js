'use strict';

/* ════════════════════════════════════════════════════════════
   2. YARDIMCILAR
════════════════════════════════════════════════════════════ */
function genId() {
    return 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function toTitleCase(str) {
    if (!str) return '';
    return String(str).replace(/\S+/g, word => {
        const first = word[0];
        const upper = first === 'i' ? 'İ' : first.toLocaleUpperCase('tr-TR');
        return upper + word.slice(1);
    });
}

function getWeekNumber(dateStr) {
    const d = new Date(dateStr);
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const start = new Date(jan4);
    start.setDate(jan4.getDate() - ((jan4.getDay() || 7) - 1));
    const week = Math.floor((d - start) / (7 * 86400000)) + 1;
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getMonthKey(ds) { return ds.slice(0, 7); }

function showStatus(id, msg, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = 'status-msg' + (type ? ' ' + type : '');
}

function setLoading(btnTxtId, loaderId, btnId, isLoading) {
    const btnTxt = document.getElementById(btnTxtId);
    const loader = document.getElementById(loaderId);
    const btn    = document.getElementById(btnId);
    if (btnTxt)  btnTxt.style.display  = isLoading ? 'none' : 'inline';
    if (loader)  loader.style.display  = isLoading ? 'inline-block' : 'none';
    if (btn)     btn.disabled          = isLoading;
}

