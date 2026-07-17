'use strict';

// 🔑 Google Books API Anahtarını buraya yapıştır
const API_KEY = 'AIzaSyA8O5MnN7IidCCETozhnIHIcnWgsy1p_Qk'; 

async function fetchEditions(titleQuery) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(titleQuery)}&maxResults=8&fields=items(volumeInfo/title,volumeInfo/authors,volumeInfo/pageCount,volumeInfo/publisher,volumeInfo/publishedDate,volumeInfo/language,volumeInfo/categories,volumeInfo/description,volumeInfo/imageLinks)&key=${API_KEY}`;
    
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

    const q = encodeURIComponent(authorQuery.trim());
    const url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${q}&maxResults=10&fields=items(volumeInfo/authors,volumeInfo/title)&key=${API_KEY}`;

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