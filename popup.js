// document.getElementById('send-to-chatgpt').addEventListener('click', () => {
//     const prompt = document.getElementById('prompt').value;
//     chrome.runtime.sendMessage({ action: 'startChatGPTInteraction', prompt: prompt }, (response) => {
//         console.log(response);
//         document.getElementById('response').innerText = response ? response : 'No response received.';
//     });

//     chrome.runtime.sendMessage({ action: 'sendPrompt', prompt: prompt });
// });


// setInterval(() => {
// // Sends a message to the content script
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.tabs.sendMessage(tabs[0].id, { action: "changeBackgroundColor", color: "lightblue" }, (response) => {
//       if (response) {
//         console.log("Response from content script:", response.status);
//       } else {
//         console.error("No response received from content script.");
//       }
//     });
//   });
  
// }, 1000);
