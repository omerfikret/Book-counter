'use strict';

let authorDebounceTimer = null;
let authorSuggestionsVisible = false;

function initAuthorAutocomplete() {
    const input   = document.getElementById('manual-author-input');
    const box     = document.getElementById('author-suggestions');
    if (!input || !box) return;

    input.addEventListener('input', () => {
        const val = input.value.trim();
        clearTimeout(authorDebounceTimer);
        hideAuthorSuggestions();

        if (val.length < 2) return;

        authorDebounceTimer = setTimeout(async () => {
            box.innerHTML = `
                <div class="author-loader-wrap">
                    <span class="loader"></span>
                    <span>Yazarlar aranıyor…</span>
                </div>`;
            showAuthorSuggestions();

            try {
                const suggestions = await fetchAuthorSuggestions(val);
                renderAuthorSuggestions(suggestions, input.value);
            } catch(e) {
                hideAuthorSuggestions();
            }
        }, 350);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAuthorSuggestions();
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (authorSuggestionsVisible) {
                const firstItem = box.querySelector('.author-suggestion-item');
                if (firstItem) {
                    input.value = firstItem.dataset.name;
                    hideAuthorSuggestions();
                }
            } else {
                document.getElementById('confirm-edition-btn')?.click();
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !box.contains(e.target)) {
            hideAuthorSuggestions();
        }
    });
}

function renderAuthorSuggestions(suggestions, rawQuery) {
    const input = document.getElementById('manual-author-input');
    const box   = document.getElementById('author-suggestions');

    if (suggestions.length === 0) {
        hideAuthorSuggestions();
        return;
    }

    box.innerHTML = suggestions.map(s => `
        <div class="author-suggestion-item" data-name="${escapeHtml(s.name)}">
            <span class="author-suggestion-icon">✍️</span>
            <div>
                <div class="author-suggestion-name">${highlightMatch(s.name, rawQuery)}</div>
                <div class="author-suggestion-books">${s.bookCount} kitap · ${escapeHtml(s.sampleBook)}</div>
            </div>
        </div>
    `).join('');

    box.querySelectorAll('.author-suggestion-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const name = item.dataset.name;
            if (input) input.value = name;
            hideAuthorSuggestions();
        });
    });

    showAuthorSuggestions();
}

function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0, idx))
        + `<strong>${escapeHtml(text.slice(idx, idx + query.length))}</strong>`
        + escapeHtml(text.slice(idx + query.length));
}

function showAuthorSuggestions() {
    const box = document.getElementById('author-suggestions');
    if (box) { box.classList.add('visible'); authorSuggestionsVisible = true; }
}

function hideAuthorSuggestions() {
    const box = document.getElementById('author-suggestions');
    if (box) { box.classList.remove('visible'); authorSuggestionsVisible = false; }
}