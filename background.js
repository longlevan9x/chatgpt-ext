// console.log = function(){};
// console.error = function(){};

const FROM = {
    EXT_CONT: "EXT_CONT",
};

const origins = [
    'http://localhost:4200',
    'https://pika2024.vercel.app'
];

let tabHistory = [];

chrome.tabs.onActivated.addListener((activeInfo) => {
    if (tabHistory.length > 0 && tabHistory[tabHistory.length - 1] !== activeInfo.tabId) {
        tabHistory.push(activeInfo.tabId);
    } else if (tabHistory.length === 0) {
        tabHistory.push(activeInfo.tabId);
    }

    if (tabHistory.length > 4) {
        tabHistory.shift();
    }
});

function backToPreviousTab() {
    if (tabHistory[tabHistory.length - 2]) {
        chrome.tabs.update(tabHistory[tabHistory.length - 2], { active: true }, () => { });
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message", message);
    if (!origins.includes(sender.origin)) {
        return true;
    }

    if (message.from !== FROM.EXT_CONT) {
        return true;
    }

    if (message.action === 'startChatGPTInteraction') {
        chrome.tabs.query({ url: 'https://chatgpt.com/*' }, (tabs) => {
            let tab = tabs[0];
            if (tab) {
                chrome.tabs.update(tab.id, { active: true }, () => {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tab.id },
                            func: interactWithChatGPT,
                            args: [message.prompt],
                        },
                        (results) => {
                            handleScriptResults(results, sendResponse);
                            backToPreviousTab();
                        }
                    );
                });
            } else {
                chrome.tabs.create({ url: 'https://chatgpt.com/' }, (tab) => {
                    const tabId = tab.id;

                    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
                        if (updatedTabId === tabId && changeInfo.status === 'complete') {
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: interactWithChatGPT,
                                    args: [message.prompt],
                                },
                                (results) => {
                                    handleScriptResults(results, sendResponse);
                                    backToPreviousTab();
                                }
                            );
                            chrome.tabs.onUpdated.removeListener(listener);
                        }
                    });
                });
            }
        });
        return true;
    }
});

function handleScriptResults(results, sendResponse) {
    console.log("handleScriptResults results", results);
    if (chrome.runtime.lastError) {
        console.error('Script injection error:', chrome.runtime.lastError);
        sendResponse('Script injection error: ');
    } else if (results && results[0] && results[0].result) {
        sendResponse(results[0].result);
    } else {
        sendResponse('No response received from ChatGPT.');
    }
}

function interactWithChatGPT(prompt) {
    console.log('interactWithChatGPT function is running'); // Debug log
    return new Promise((resolve, reject) => {
        const inputSelector = 'div[id="prompt-textarea"]'; // Adjust selector based on ChatGPT's page structure
        const sendButtonSelector = 'button[aria-label="Send prompt"][data-testid="send-button"]'; // Adjust as necessary
        const responseSelector = 'div.composer-parent article:last-child div[data-message-author-role="assistant"]'; // Adjust this to match ChatGPT's page

        const waitForElement = (selector, timeout = 10000) => {
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                        clearInterval(interval);
                        resolve(element);
                    }
                }, 1000);

                setTimeout(() => {
                    clearInterval(interval);
                    reject(new Error(`Element not found: ${selector}`));
                }, timeout);
            });
        };

        const waitForCompleteResponse = (responseElement) => {
            return new Promise((resolve, reject) => {
                let previousText = responseElement.innerText;
                let checkCount = 1;

                const checkComplete = setInterval(() => {
                    const currentText = responseElement.innerText;
                    // console.log(checkCount, currentText);
                    // chrome.runtime.sendMessage({ message: currentText, from: "CHATGPT", action: "ANSWER" });
                    if (currentText !== previousText) {
                        previousText = currentText; // Update previousText when change detected
                    } else {
                        clearInterval(checkComplete);
                        resolve(responseElement.innerHTML);
                    }

                    if (checkCount === 30) {
                        clearInterval(checkComplete);
                        reject('Response timed out.');
                    }

                    checkCount++;
                }, 1000);
            });
        };

        waitForElement(inputSelector)
            .then((inputField) => {
                console.log('Input field found'); // Debug log
                inputField.focus();
                inputField.innerHTML = prompt;

                // Trigger input event
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                inputField.dispatchEvent(new Event('keyup', { bubbles: true }));

                return waitForElement(sendButtonSelector);
            })
            .then((sendButton) => {
                console.log('Send button found'); // Debug log
                sendButton.click();

                // Wait for the response element and then for the complete response
                return waitForElement(responseSelector)
                    .then((responseElement) => {
                        // Debug log
                        console.log('Response element found'); 
                        return waitForCompleteResponse(responseElement);
                    });
            })
            .then((completeResponse) => {
                // Debug log
                console.log('Complete response received'); 
                resolve(completeResponse);
            })
            .catch((error) => {
                console.error('Error:', error.message);
                reject(error.message);
            });
    });
}
