console.log('Content script loaded');

const FROM = {
    EXTENSION: "EXTENSION",
    WEBPAGE: "WEBPAGE"
};

const origins = [
    'http://localhost:4200',
    'http://pika2024.vercel.app'
];

window.addEventListener('message', (event) => {
    const data = event.data;
    const origin = event.origin;
    console.log("content.js message event.data, origin", data);

    if (data.from === FROM.EXTENSION) {
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
    chrome.runtime.sendMessage({ from: 'EXT_CONT', action: "startChatGPTInteraction", prompt: data.prompt }, (result) => {
        window.postMessage({ from: "EXTENSION", action: "ANSWER", result: result }, '*');
    });
}