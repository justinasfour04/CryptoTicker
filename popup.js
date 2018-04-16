"use strict";

window.addEventListener("load", async () => {
    let fiatCurrencyElements = await AJAX.get("FiatCurrency.json");
    let refreshRates = await AJAX.get("refreshRates.json");
    let cryptocurrencies = await AJAX.get("https://api.coinmarketcap.com/v1/ticker/");
    createDropdown("Currency", "currency", JSON.parse(cryptocurrencies));
	createDropdown("Fiat Currency", "fiatcurrency", JSON.parse(fiatCurrencyElements));
	createDropdown("Refresh Rate", "refreshrates", JSON.parse(refreshRates));
});

async function createDropdown(labelText, id, elements = {}) {
    let crypto = await Storage.get(['conversion', 'selected', 'refreshRate']);

    let row = document.createElement("div");
    row.className = "row";

    let label = document.createElement("span");
    label.className = "row-item";
	label.innerHTML = labelText + ": ";

    let dropdown = document.createElement("select");
    dropdown.className = "row-item";
    dropdown.id = id;
    dropdown.onchange = onDropdownSelect;

    if (Array.isArray(elements)) {
        for (let i = 0; i < elements.length; i++) {
            let option = document.createElement("option");
            option.text = elements[i].name;
            option.value = "{\"id\":\"" + elements[i].id + "\",\"symbol\":\"" + elements[i].symbol + "\"}";
            if (elements[i].symbol === crypto.selected.symbol) option.selected = true;
            dropdown.appendChild(option);
        }
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

function onDropdownSelect(event) {
    let selectedDropdown = this.id;
    switch(selectedDropdown) {
        case "currency":
            let currency = JSON.parse(this.value); 
            var selectedCurrency = {
                id: currency.id,
                symbol: currency.symbol
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