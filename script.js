const sheetURL = 'https://docs.google.com/spreadsheets/d/1NrWoAllaFGjTmZrjAeSereyXU5kgQHnm9T561hU3Qb4/';
const sheetViewURL = sheetURL + 'edit?gid=1658268120#gid=1658268120&range=';
const sheetDataURL = sheetURL + 'gviz/tq?tqx=out:csv&sheet=World%20Records&range=';

const videoURL = 'https://script.google.com/macros/s/AKfycbyjk3zQrTWz4wIZamIquxDI-VUWq96GPW8LLeyCKKBEDzfCLELLtY8JlUe6kM3nnzptKg/exec?cell=';

let gettingWR = false;
let gettingVideo = false;

const packs = ["Desert", "Arctic", "Dunes", "Hills", "Beach", "Savanna", "Desert 2", "Arctic 2", "Dunes 2", "Hills 2", "Beach 2", "Savanna 2", "Desert 3", "Arctic 3", "Holiday", "Holiday 2", "Special Tracks", "Halloween", "Thanksgiving", "Holiday 3", "Easter", "Holiday 4", "Bike Bowl", "4th of July", "Christmas", "Thanksgiving 2"];


const lookupWR = () => {
    if (gettingWR) {
        alert('Already looking up a record. Please wait...');
        return;
    } else if (gettingVideo) {
        alert('Attempting to fetch the video. Please wait...');
        return;
    }

    gettingWR = true;
    gettingVideo = true;

    const pack = document.getElementById('pack').value;
    const level = Number(document.getElementById('level').value);
    const bike = document.getElementById('bike').value;

    document.getElementById('result').innerHTML = '&mdash;';

    // Validate pack choice
    if (!packs.includes(pack)) {
        alert('Pack is invalid.');
        gettingWR = false;
        return;
    }

    // Validate level choice
    if (!Number.isInteger(level) || level < 1 || level > 8) {
        alert('Level is invalid.');
        gettingWR = false;
        return;
    }

    // Validate bike choice
    if (!/[BCDEFGHI]/.test(bike)) {
        alert('Bike is invalid.');
        gettingWR = false;
        return;
    }

    const cell = bike + (packs.indexOf(pack) * 8 + level + 1);
    fetchWR(cell);
    fetchWRLink(cell);
}

const fetchWR = (cell) => {
    fetch(sheetDataURL + cell)
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
            console.error('Error fetching record', err);
        })
        .finally(() => {
            gettingWR = false;
        });
}

const fetchWRLink = (cell) => {
    const videoMessage = document.getElementById('wrVideoMessage');

    videoMessage.innerText = 'Fetching video...';
    document.getElementById('wrVideo')?.remove();

    fetch(videoURL + cell)
        .then(res => {
            if (!res.ok) {
                console.error(`Fetch response returned not ok: ${res.status} ${res.statusText}`, res);
                return;
            }

            return res.json();
        })
        .then(data => {
            if (data.success) {
                videoMessage.innerText = '';
                document.getElementById('videoContainer').insertAdjacentHTML('beforeend', `<iframe id="wrVideo" class="w-100" src="${data.url.replace(/view.*$/i, 'preview')}"></iframe>`);
            } else {
                console.error('Error fetching video link', data.error);
                videoMessage.innerText = 'There was an error fetching the video. Please try again later.';
            }
        })
        .catch(err => {
            console.error('Error fetching video link', err);
            videoMessage.innerText = 'There was an error fetching the video. Please try again later.';
        })
        .finally(() => {
            gettingVideo = false;
        });
}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const chosenPack = [...document.getElementById('pack').children].filter(opt => opt.value === urlParams.get('pack'))?.at(0);
    if (chosenPack) {
        chosenPack.selected = true;
    }

    const chosenLevel = Number(urlParams.get('level'));
    if (Number.isInteger(chosenLevel) && chosenLevel >= 1 && chosenLevel <= 8) {
        document.getElementById('level').value = chosenLevel;
    }

    const chosenBike = [...document.getElementById('bike').children].filter(opt => opt.innerText === urlParams.get('bike'))?.at(0);
    if (chosenBike) {
        chosenBike.selected = true;
    }

    if (urlParams.get('pack')?.length && urlParams.get('level')?.length && urlParams.get('bike')?.length) {
        document.querySelector('button.btn-lookup').click();
    }
}
