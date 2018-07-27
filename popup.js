"use strict";

window.addEventListener("load", async () => {
    let fiatCurrencyElements = await AJAX.get("FiatCurrency.json");
    let refreshRates = await AJAX.get("refreshRates.json");
    let cryptocurrencies = await AJAX.get("https://api.coinmarketcap.com/v2/ticker/");
    createDropdown("Currency", "currency", JSON.parse(cryptocurrencies));
	createDropdown("Fiat Currency", "fiatcurrency", JSON.parse(fiatCurrencyElements));
	createDropdown("Refresh Rate", "refreshrates", JSON.parse(refreshRates));
});

async function createDropdown(labelText, id, elements = {}) {
    let crypto = await Storage.get(['conversion', 'selected', 'refreshRate']);
    crypto = Object.keys(crypto).length > 0 ? crypto : CryptoCurrency;

    let row = document.createElement("div");
    row.className = "row";

    let label = document.createElement("span");
    label.className = "row-item";
	label.innerHTML = labelText + ": ";

    let dropdown = document.createElement("select");
    dropdown.className = "row-item";
    dropdown.id = id;
    dropdown.onchange = onDropdownSelect;

    if (id === 'currency') {
        Object.keys(elements.data).forEach(id => {
            let option = document.createElement("option");
            option.text = elements.data[id].name;
            option.value = id;

            if (id === crypto.selected.id) option.selected = true;
            dropdown.appendChild(option);
        });
    } else {
        Object.keys(elements).forEach((key) => {
            let option = document.createElement("option");
            option.text = elements[key];
            option.value = key;
        
            if (key === crypto.conversion || key === crypto.refreshRate) option.selected = true;
            dropdown.appendChild(option);
        });
    }
    
	let main = document.getElementById("main");
	row.appendChild(label);
	row.appendChild(dropdown);
	main.appendChild(row);
}

async function onDropdownSelect(event) {
    let selectedDropdown = this.id;
    switch(selectedDropdown) {
        case "currency":
            var selectedCurrency = {
                id: this.value
            };
            chrome.runtime.sendMessage({ type: "currency", data: selectedCurrency }, (response) => console.log(response));
            break;
        case "fiatcurrency":
            var selectedFiatCurrency = this.value;
            chrome.runtime.sendMessage({ type: "fiat", data: selectedFiatCurrency  }, (response) => console.log(response));
            break;
        case "refreshrates": 
            var selectedRefreshRate = this.value;
            chrome.runtime.sendMessage({ type: "refresh", data: selectedRefreshRate }, (response) => console.log(response));
            break;
    }

}