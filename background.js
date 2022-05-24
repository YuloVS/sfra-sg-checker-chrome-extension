chrome.webRequest.onCompleted.addListener(
    scanRequests,
    { urls: ["https://*/*"] }
);

async function scanRequests(details) {
    let isStored = await isStoredSiteUsingSFCC(details.initiator);
    if (typeof isStored === 'string') {
        // console.log('Site already scanned')
        return;
    }
    if (isStored === false || isStored === undefined) {
        isStored = details.url.includes('demandware.store');
        await storeSite(details.initiator, isStored);
    }
    if (isStored === true) { // Uses SFCC but technology is not determined yet
        if (details.url.includes('COBilling') || details.url.includes('COShipping')) {
            console.log('Is using Site-Genesis');
            await storeSite(details.initiator, 'Site-Genesis');
        }
        if (details.url.includes('CheckoutShippingServices')) {
            console.log('Is using SFRA');
            await storeSite(details.initiator, 'SFRA');
        }
    }
    await updateIcon(details);
}

/**
 * true = yes
 * false = no
 * undefined = not stored
 * string = stored, using SFRA or Site-Genesis
 * @param {string} key
 * @return {boolean|undefined|string}
 */
async function isStoredSiteUsingSFCC(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
            resolve(result[key])
        });
    })
}


/**
 * @param {string} site
 * @param {boolean|string} isUsingSFCC
 */
async function storeSite(site, isUsingSFCC) {
    return new Promise((resolve) => {
        chrome.storage.local.set({[site]: isUsingSFCC}, () => resolve(true));
    })
}

// active tab code
chrome.tabs.onActivated.addListener(onUpdatedListener);
async function onUpdatedListener(tabId) {
    await updateIcon(tabId);
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

async function updateIcon(tabId) {
    if (!tabId.tabId) {
        return;
    }
    chrome.tabs.get(tabId.tabId, async function(tab){
        let vistedSites = await getStoredData(false);
        let currentSite = vistedSites.filter(result => tab.url.includes(result[0]));
        let iconPath = "/icons/Salesforce-grises-128x128.png";
        if (!currentSite[0]) {
            return;
        }
        if (currentSite[0][1] === undefined) {
            iconPath = "/icons/Salesforce-grises-128x128.png"
        }
        if (currentSite[0][1] === false) {
            iconPath = "/icons/Salesforce-grises-128x128.png"
        }
        if (currentSite[0][1] === true) {
            iconPath = "/icons/Salesforce-128x128.png"
        }
        if (currentSite[0][1] === "SFRA") {
            iconPath = "/icons/SFRA-128x128.png"
        }
        if (currentSite[0][1] === "Site-Genesis") {
            iconPath = "/icons/SG-128x128.png"
        }
        chrome.action.setIcon({ path: iconPath })
    });
}
