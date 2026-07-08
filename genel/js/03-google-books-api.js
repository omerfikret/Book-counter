'use strict';

/* ════════════════════════════════════════════════════════════
   3. KİTAP API (Open Library - ücretsiz)
════════════════════════════════════════════════════════════ */

async function fetchEditions(titleQuery) {
    try {
        // Open Library search API
        const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(titleQuery)}&limit=8`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        
        if (!data.docs || data.docs.length === 0) return [];

        const seen = new Set();
        const editions = [];

        for (const item of data.docs) {
            const title = item.title || titleQuery;
            const author = item.author_name ? item.author_name[0] : '';
            const pages = item.number_of_pages_median || 0;
            const publisher = item.publisher ? item.publisher[0] : '';
            const year = item.first_publish_year ? String(item.first_publish_year) : '';
            const key = `${title.toLowerCase()}|${publisher.toLowerCase()}|${year}`;
            
            if (seen.has(key)) continue;
            seen.add(key);
            
            // Kapak resmi için
            const coverId = item.cover_i;
            const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';
            
            editions.push({
                title: title,
                author: author,
                pages: pages || 0,
                publisher: publisher,
                year: year,
                language: item.language ? item.language[0] : '',
                coverUrl: coverUrl,
                genre: item.subject ? item.subject[0] || 'Edebiyat' : 'Edebiyat',
                description: '', // Open Library'de description kolay gelmiyor
            });
        }
        return editions;
    } catch (error) {
        console.error('Open Library hatası:', error);
        return [];
    }
}

async function fetchAuthorSuggestions(authorQuery) {
    if (!authorQuery || authorQuery.trim().length < 2) return [];

    try {
        const q = encodeURIComponent(authorQuery.trim());
        const url = `https://openlibrary.org/search.json?author=${q}&limit=10`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.docs || data.docs.length === 0) return [];

        const authorMap = new Map();
        for (const item of data.docs) {
            if (!item.author_name) continue;
            for (const author of item.author_name) {
                if (!author.toLowerCase().includes(authorQuery.toLowerCase())) continue;
                if (!authorMap.has(author)) {
                    authorMap.set(author, { count: 0, sampleBook: item.title || '' });
                }
                authorMap.get(author).count++;
            }
        }

        return Array.from(authorMap.entries())
            .map(([name, info]) => ({ name, bookCount: info.count, sampleBook: info.sampleBook }))
            .sort((a, b) => b.bookCount - a.bookCount)
            .slice(0, 6);
    } catch (error) {
        console.error('Open Library author hatası:', error);
        return [];
    }
}

// Fonksiyonları GLOBAL'e ekle
window.fetchEditions = fetchEditions;
window.fetchAuthorSuggestions = fetchAuthorSuggestions;