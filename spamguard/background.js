// // background.js

// // Interval for checking in milliseconds (e.g., every 5 minutes)
// const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// // Function to check the URL and show a notification if malicious
// function checkAndNotify() {
//   chrome.storage.local.get("mode", function (data) {
//     if (data.mode === "automatic") {
//       chrome.tabs.query(
//         { active: true, currentWindow: true },
//         function (tabs) {
//           const url = tabs[0].url;

//           getAnalysesResult(url)
//             .then((result) => {
//               if (result.malicious > 0) {
//                 console.log("nitified");
//                 // Show a notification if malicious content is detected
//                 chrome.notifications.create({
//                   type: "basic",
//                   iconUrl: "icon.png", // Replace with your extension's icon
//                   title: "Malicious Content Detected!",
//                   message: "Be cautious, this URL contains malicious content.",
//                 });
//               }
//             })
//             .catch((error) => console.error("Error checking URL:", error));
//         }
//       );
//     }
//   });
// }

// // Start the periodic checking
// setInterval(checkAndNotify, CHECK_INTERVAL);

// // Initial check and notify when the extension starts
// checkAndNotify();

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.maliciousCount && message.maliciousCount > 0) {
    console.log("notified");
    // Show a notification when maliciousCount is greater than 0
    // chrome.notifications.create({
    //   type: 'basic',
    //   iconUrl: 'icon.png', // Replace with your extension's icon
    //   title: 'Security Alert',
    //   message: 'This URL may be malicious. Exercise caution.',
    // });
    var notifOptions = {
      type: 'basic',
      iconUrl: 'images/SPAM48.png',
      title: 'security Alert',
      message: 'This URL may be malicious. Exercise caution!'
    };
   
    chrome.notifications.create('maliciousWarning', notifOptions, function(notificationId) {
      var lastError = chrome.runtime.lastError;
      if (lastError) {
        console.error(lastError.message);
      } else {
        console.log("Notification created with ID: " + notificationId);
      }
    });



  }
});
