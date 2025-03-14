document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get("history", function (data) {
        let history = data.history || [];
        const historyList = document.getElementById("history-list"); // Corrected ID
        history.forEach((entry) => {
            const entryElement = document.createElement("li"); // Use <li> for list items
            entryElement.innerHTML = `
                <p>URL: ${entry.url}</p>
                <p>Result: ${JSON.stringify(entry.result)}</p>
                <hr>
            `;
            historyList.appendChild(entryElement);
        });
    });
});


// <p>Scanner: ${entry.scanner}</p>