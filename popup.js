// Rendering code

async function renderData() {
    let data              = await getStoredData();
    let listElement       = document.getElementById('list');
    listElement.className = 'list';
    data.forEach((result, index) => {
        let listItemElement       = document.createElement('div');
        listItemElement.className = 'list-item';
        let rankElement           = document.createElement('div');
        rankElement.className     = 'rank';
        let rankSpanElement       = document.createElement('span');
        rankSpanElement.innerText = (index + 1).toString();
        let siteUrlElement        = document.createElement('h4');
        if (result[0].length > 40) {
            result[0] = result[0].substring(0, 30) + '...';
        }
        siteUrlElement.innerText = result[0].substring(8);
        let resultElement        = document.createElement('p');
        resultElement.innerText  = result[1] === true ? 'SFCC: Proceed with checkout' : result[1].toString();
        let dataElement          = document.createElement('div');
        dataElement.className    = 'name';
        dataElement.appendChild(siteUrlElement);
        dataElement.appendChild(resultElement);
        rankElement.appendChild(rankSpanElement);
        listItemElement.appendChild(rankElement);
        listItemElement.appendChild(dataElement);
        listElement.appendChild(listItemElement);
    });
}

function csvButton() {
    let button = document.getElementById('downloadCsv');
    button.addEventListener('click', async () => {
        await downloadCsv();
    });
}

async function currentSite() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let currentSiteElement = document.getElementById('current-site');
    let vistedSites = await getStoredData(false);
    let currentSite = vistedSites.filter(result => tab.url.includes(result[0]));
    let text = 'Analyzing...'
    if (currentSite[0][1] === undefined) {
        text = 'Not Detected';
    }
    if (currentSite[0][1] === false) {
        text = 'Not using SFCC';
    }
    if (currentSite[0][1] === true) {
        text = 'Using SFCC'
    }
    if (typeof currentSite[0][1] === 'string') {
        text = currentSite[0][1]
    }
    currentSiteElement.innerText = text;
}


// Get data code

async function getStoredData(onlySFCC=true) {
    return new Promise((resolve) => {
        chrome.storage.local.get(null, (results) => {
            if (onlySFCC) {
                resolve(
                    Object.entries(results)
                        .filter(result => result[1] !== false)
                        .filter(result => result[0] !== 'undefined')
                );
            }
            resolve(Object.entries(results));
        });
    });
}


// CSV Code

async function downloadCsv() {
    let data       = await getStoredData();
    let csvContent = data.map(row => row.join(',')).join('\n');
    let csvBlob    = new Blob([csvContent], {type: 'text/csv'});
    let csvUrl     = URL.createObjectURL(csvBlob);
    chrome.downloads.download({url: csvUrl});
}

// On open executed functions
renderData();
csvButton();
currentSite()
