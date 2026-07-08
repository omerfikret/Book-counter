'use strict';

/* ════════════════════════════════════════════════════════════
   1. VERİ KATMANI
════════════════════════════════════════════════════════════ */
let STATE = (function() {
    try {
        const raw = localStorage.getItem('bookTracker_v3');
        return raw ? JSON.parse(raw) : { books: [], finishedBooks: [] };
    } catch(e) {
        return { books: [], finishedBooks: [] };
    }
})();

function saveState() {
    localStorage.setItem('bookTracker_v3', JSON.stringify(STATE));
}

