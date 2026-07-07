// netlify/functions/books.js
//
// Bu dosya SUNUCU tarafında (Netlify'ın kendi sunucusunda) çalışır.
// Tarayıcıya asla gönderilmez, bu yüzden API_KEY burada güvenlidir.
//
// Anahtarı KOD İÇİNE YAZMA. Netlify dashboard'dan environment variable
// olarak ekle (aşağıdaki kurulum adımlarına bak).

exports.handler = async (event) => {
    // Sadece GET isteklerine izin ver
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'GOOGLE_BOOKS_API_KEY tanımlı değil (Netlify env variable eksik).' }),
        };
    }

    const { mode, q } = event.queryStringParameters || {};

    if (!q || !mode) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "'mode' (editions|authors) ve 'q' parametreleri zorunlu." }),
        };
    }

    let googleUrl;
    if (mode === 'editions') {
        googleUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(q)}&maxResults=8&fields=items(volumeInfo/title,volumeInfo/authors,volumeInfo/pageCount,volumeInfo/publisher,volumeInfo/publishedDate,volumeInfo/language,volumeInfo/categories,volumeInfo/description,volumeInfo/imageLinks)&key=${API_KEY}`;
    } else if (mode === 'authors') {
        googleUrl = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(q)}&maxResults=10&fields=items(volumeInfo/authors,volumeInfo/title)&key=${API_KEY}`;
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "'mode' değeri 'editions' ya da 'authors' olmalı." }),
        };
    }

    try {
        const res = await fetch(googleUrl);
        const data = await res.json();

        if (!res.ok) {
            return {
                statusCode: res.status,
                body: JSON.stringify({ error: `Google Books API hatası: ${res.status}` }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Sunucu hatası: ' + error.message }),
        };
    }
};