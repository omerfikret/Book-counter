'use strict';

// ✅ Artık anahtar yok. Tarayıcı sadece kendi sitendeki
// /.netlify/functions/books endpoint'ine istek atıyor.
// Gerçek Google Books isteği + anahtar, Netlify Function içinde (sunucu tarafında) çalışıyor.

const FUNCTION_URL = '/.netlify/functions/books';

async function fetchEditions(titleQuery) {
    const url = `${FUNCTION_URL}?mode=editions&q=${encodeURIComponent(titleQuery)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`HTTP ${res.status}: ${res.statusText} — ${errBody.slice(0, 100)}`);
        }
        const data = await res.json();
        if (!data.items) return [];

        const seen = new Set();
        const editions = [];

        for (const item of data.items) {
            const v = item.volumeInfo;
            const pages = v.pageCount || 0;
            const publisher = v.publisher || '';
            const year = v.publishedDate ? v.publishedDate.slice(0, 4) : '';
            const key = `${(v.title || '').toLowerCase()}|${publisher.toLowerCase()}|${year}`;
            if (seen.has(key)) continue;
            seen.add(key);
            editions.push({
                title: v.title || titleQuery,
                author: (v.authors && v.authors[0]) || '',
                pages,
                publisher,
                year,
                language: v.language || '',
                coverUrl: v.imageLinks?.thumbnail?.replace('http://', 'https://') || '',
                genre: (v.categories && v.categories[0]) || 'Edebiyat',
                description: v.description ? v.description.slice(0, 180) + '…' : '',
            });
        }
        return editions;
    } catch (error) {
        console.error('fetchEditions hatası:', error);
        throw error;
    }
}

async function fetchAuthorSuggestions(authorQuery) {
    if (!authorQuery || authorQuery.trim().length < 2) return [];

    const url = `${FUNCTION_URL}?mode=authors&q=${encodeURIComponent(authorQuery.trim())}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        if (!data.items) return [];

        const authorMap = new Map();
        for (const item of data.items) {
            const v = item.volumeInfo;
            if (!v.authors) continue;
            for (const author of v.authors) {
                if (!author.toLowerCase().includes(authorQuery.toLowerCase())) continue;
                if (!authorMap.has(author)) {
                    authorMap.set(author, { count: 0, sampleBook: v.title || '' });
                }
                authorMap.get(author).count++;
            }
        }

        return Array.from(authorMap.entries())
            .map(([name, info]) => ({ name, bookCount: info.count, sampleBook: info.sampleBook }))
            .sort((a, b) => b.bookCount - a.bookCount)
            .slice(0, 6);
    } catch (error) {
        console.error('fetchAuthorSuggestions hatası:', error);
        return [];
    }
}