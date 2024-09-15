document.getElementById('send-to-chatgpt').addEventListener('click', () => {
    const prompt = document.getElementById('prompt').value;
    chrome.runtime.sendMessage({ action: 'startChatGPTInteraction', prompt: prompt }, (response) => {
        console.log(response);
        document.getElementById('response').innerText = response ? response : 'No response received.';
    });

    chrome.runtime.sendMessage({ action: 'sendPrompt', prompt: prompt });
});
