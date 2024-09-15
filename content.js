console.log('Content script loaded');

const FROM = {
    EXTENSION: "EXTENSION",
    WEBPAGE: "WEBPAGE",
    CHATGPT: "CHATGPT"
};

const origins = [
    'http://localhost:4200',
    'https://pika2024.vercel.app'
];

window.addEventListener('message', (event) => {
    const data = event.data;
    const origin = event.origin;
    console.log("content.js message event.data, origin", data);

    if (!data.from || data.from === FROM.EXTENSION || data.from === FROM.CHATGPT) {
        return;
    }

    if (!origins.includes(origin)) {
        return;
    }

    if (data.from === FROM.WEBPAGE) {
        handleMessageFromWebPage(data);
    }
});

function handleMessageFromWebPage(data) {
    chrome.runtime?.sendMessage({ from: 'EXT_CONT', action: "startChatGPTInteraction", prompt: data.prompt }, (result) => {
        if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
            window.postMessage({ from: "EXTENSION", action: "ANSWER", result: "Error run time" }, '*');
        } else {
            window.postMessage({ from: "EXTENSION", action: "ANSWER", result: result }, '*');
        }
    });
}