/* -------------------------------------------------------
    GENIUS!
-------------------------------------------------------- */

require('isomorphic-fetch');
const cheerio = require('cheerio');

const { AUTH } = require('../config.json');

const pageNumber = Math.floor(Math.random() * 4) + 1

const apis = {
    songs_by_artist: `https://api.genius.com/artists/{artist}/songs?sort=popularity&page=${pageNumber}&per_page=50`,
    song_by_id: 'https://api.genius.com/songs/{id}'
};

const headers = new Headers({
    Accept: 'application/json',
    Authorization: `Bearer ${ AUTH.Genius.access_token }`
});

const GENIUS_ARTISTS = {
    REXX_LIFE_RAJ: 328725
};

const Genius = () => {
    return {
        async getSongsByArtistId(id) {
            if (!id) { return []; }

            const url = apis.songs_by_artist.replace('{artist}', id)
            console.log(`page number: ${pageNumber}`)

            return fetchJSON(url, { headers })
                .then(({ response: { songs = [] } }) => songs);
        },
        async getSongById(id) {
            if (!id) { return; }

            const url = apis.song_by_id.replace('{id}', id);

            return fetchJSON(url, { headers })
                .then(({ response: { song } }) => song);
        },
        async getLyricsBySong(song) {
            if (!song) { return; }

            const { url } = song;

            return fetchDOM(url)
                .then($ => {
                    const content = $(".Lyrics__Container-sc-1ynbvzw-6").find("br").replaceWith("\n").end().text();
                    const lines = content.split('\n').filter(x => Boolean(x.trim()));

                    return lines;
                })
                
        },
        filterLyricsByArtist(lyrics = [], { name = '' } = {}, numberOfArtists) {
            return lyrics.reduce((acc, line, index, array) => {

                if (numberOfArtists > 0) {
                    if (!line.includes(name)) { return acc; }

                    const start_index = ++index;
                    const end_index = index + array
                        .slice(index)
                        .findIndex(line => line.includes('[') && line.includes(']'));
                    return [ ...acc, ...array.slice(start_index, end_index) ];
                }
                else {
                    const start_index = ++index;
                    const end_index = index + array
                        .slice(index)
                        .findIndex(line => line.includes('[') && line.includes(']'));
                    return [ ...acc, ...array.slice(start_index, end_index) ];  
                }
            }, []);
        },
        getRandomBarFromLyrics(lyrics = []) {
            const pair_bar_indexes = [
                ...Array(lyrics.length).keys()
            ].filter(x => x < lyrics.length - 2 && x % 2 === 0);

            const random_pair_bar_index = pair_bar_indexes[ Math.floor(Math.random() * pair_bar_indexes.length) ];

            return [
                lyrics[ random_pair_bar_index ],
                lyrics[ random_pair_bar_index + 1 ]
            ];
        }
    }
};

module.exports = {
    Genius,
    GENIUS_ARTISTS
};

// PRIVATE

async function fetchJSON(url, options = {}) {
    if (!url) { throw new Error('URL cannot be invalid.') }

    return fetch(url, options)
        .then(response => {
            if (response.status !== 200) { throw new Error(`ERROR: ${ response.status } - ${ response.statusText }`); }

            return response.json()
        });
}

async function fetchDOM(url, options = {}) {
    if (!url) { throw new Error('URL cannot be invalid.') }

    return fetch(url, options)
        .then(response => {
            if (response.status !== 200) { throw new Error(`ERROR: ${ response.status } - ${ response.statusText }`); }

            return response.text()
        })
        .then(html => cheerio.load(html));
}
