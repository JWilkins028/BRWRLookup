const sheetURL = 'https://docs.google.com/spreadsheets/d/1NrWoAllaFGjTmZrjAeSereyXU5kgQHnm9T561hU3Qb4/';
const sheetViewURL = sheetURL + 'edit?gid=1658268120#gid=1658268120&range=';
const sheetCSVURL = sheetURL + 'gviz/tq?tqx=out:csv&sheet=World%20Records&range=';

let gettingWR = false;

const packs = ["Desert", "Arctic", "Dunes", "Hills", "Beach", "Savanna", "Desert 2", "Arctic 2", "Dunes 2", "Hills 2", "Beach 2", "Savanna 2", "Desert 3", "Arctic 3", "Holiday", "Holiday 2", "Special Tracks", "Halloween", "Thanksgiving", "Holiday 3", "Easter", "Holiday 4", "Bike Bowl", "4th of July", "Christmas", "Thanksgiving 2"];


const lookupWR = () => {
    if (gettingWR) {
        alert('Already looking up a record. Please wait...');
        return;
    }

    gettingWR = true;

    const pack = document.getElementById('pack').value;
    const level = Number(document.getElementById('level').value);
    const bike = document.getElementById('bike').value;

    document.getElementById('result').innerHTML = '&mdash;';

    // Validate pack choice
    if (!packs.includes(pack)) {
        alert('Pack is invalid.');
        return;
    }

    // Validate level choice
    if (!Number.isInteger(level) || level < 1 || level > 8) {
        alert('Level is invalid.');
        return;
    }

    // Validate bike choice
    if (!/[BCDEFGHI]/.test(bike)) {
        alert('Bike is invalid.');
        return;
    }

    fetchWR(pack, level, bike);
}

const fetchWR = (pack, level, bike) => {
    const cell = bike + (packs.indexOf(pack) * 8 + level + 1);

    fetch(sheetCSVURL + cell)
        .then(res => {
            if (!res.ok) {
                console.error(`Fetch response returned not ok: ${res.status} ${res.statusText}`, res);
                return;
            }

            return res.text();
        })
        .then(data => {
            data = (data || '').replaceAll('"', '').trim();
            document.querySelector('#result').innerHTML = `<a href="${sheetViewURL}${cell}" target="_blank">${data}</a>`;
        })
        .catch(err => {
            console.error('Error executing fetch', err);
        })
        .finally(() => {
            gettingWR = false;
        });
}