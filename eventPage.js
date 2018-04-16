"use strict";

setMessageListener();
chrome.alarms.onAlarm.addListener(loadTicker);
chrome.alarms.create("tickerAlarm", {
	when: Date.now(),
	periodInMinutes: parseInt(CryptoCurrency.refreshRate)
});