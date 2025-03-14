// apiKey for google safe browsing
var safeBrowsingApiKey = "AIzaSyDIyw6HcIxbqupewuv51_6FyZaL0wAhjeU";

// Function to get the current tab URL
function getCurrentTabUrl(callback) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      var tab = tabs[0];
      var url = tab.url;
      callback(url);
    }
  );
}

// Function to get the shortened version of the URL
function shortenUrl(url, maxLength) {
  if (url.length <= maxLength) {
    return url;
  }
  return url.substring(0, maxLength - 3) + "...";
}

// Function to check if a website has HTTPS and display it
function checkHttps() {
  getCurrentTabUrl(function (url) {
    var hasHttps = url.startsWith("https://");
    var status = document.getElementById("httpsStatus");

    if (hasHttps) {
      status.innerText = "This website uses HTTPS.";
      status.style.color = "green";
    } else {
      status.innerText = "This website does not use HTTPS.";
      status.style.color = "red";
    }

    status.style.display = "block";
  });
}



// Function to check the URL using Google Safe Browsing API
function checkSafeBrowsing(url) {
  var apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safeBrowsingApiKey}`;

  var requestBody = {
    client: {
      clientId: "company",
      clientVersion: "1.0",
    },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        {
          url: url,
        },
      ],
    },
  };

  return fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error checking URL with Safe Browsing:", error);
      throw error;
    });
}

// Function to display Google Safe Browsing result
function displaySafeBrowsingResult(result) {
  var status = document.getElementById("safeBrowsingResult");
  if (result.matches && result.matches.length > 0) {
    status.innerText = "This URL is unsafe according to Google Safe Browsing!";
  } else {
    status.innerText = "This URL is safe according to Google Safe Browsing!";
  }
  status.style.display = "block";
}

// Function to check URL using VirusTotal API
async function getAnalysesId(url) {
  const response = await fetch("http://localhost:3000/submit-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Error happend in client-side for posting data");
  }

  const { id } = await response.json();
  return id;
}

async function getAnalysesResult(url) {
  const analysesId = await getAnalysesId(url);

  const response = await fetch(
    `http://localhost:3000/scan-results/${analysesId}`
  );
  if (!response.ok) {
    throw new Error("Error happened in client-side for get analyses data");
  }

  const { stats } = await response.json();
  return stats;
}

// Function to display VirusTotal result
function displayVirusTotalResult(data) {
  var status = document.getElementById("virusTotalResult");

  if (!data) {
    status.innerText = "Sorry! Error getting data from the sources";
    status.style.display = "block";
    return;
  }

  if (data.suspicious > 0 || data.malicious > 0) {
    // status.innerText = `This URL may be unsafe, here is the check result:
    
    // harmless: ${data.harmless}
    // malicious: ${data.malicious}
    // suspicious: ${data.suspicious}
    // undetected: ${data.undetected}
    // *These numbers refers to number of algorithms checked;
    // `;
    status.innerHTML = `This URL is unsafe according to Multiple algorithms!
    <br>
    harmless: ${data.harmless} <br>
    <span style="background-color:#ff0000; color:#fff;"> malicious: ${data.malicious}</span><br>
    suspicious: ${data.suspicious}<br>
    undetected: ${data.undetected}<br>
    *These numbers refers to number of algorithms checked;
    `;
  } else {
    status.innerText = `This URL is safe according to Multiple algorithms!
    
    harmless: ${data.harmless}
    malicious: ${data.malicious}
    suspicious: ${data.suspicious}
    undetected: ${data.undetected}
    `;
  }

  status.style.display = "block";
}


// Function to update the URL highlighting based on the result
function updateUrlHighlighting(virusTotalResult) {
  var shortenedUrl = document.getElementById("shortened-url");
  
  if (virusTotalResult.malicious>0 || virusTotalResult.suspicious > 0) {
    shortenedUrl.classList.remove("safe");
    shortenedUrl.classList.add("unsafe");
  } else {
    shortenedUrl.classList.remove("unsafe");
    shortenedUrl.classList.add("safe");
  }
}


// Function to save history
function saveToHistory(url, scanner, result) {
  chrome.storage.local.get("history", function (data) {
    let history = data.history || [];
    history.push({ url, scanner, result });
    chrome.storage.local.set({ history });
  });
}

// Get the current URL and check it using both Google Safe Browsing and VirusTotal APIs when the popup is loaded
document.addEventListener("DOMContentLoaded", function () {
 // document.getElementById("loadUrl").addEventListener("click", function () {
    getCurrentTabUrl(function (url) {
      var shortenedUrl = shortenUrl(url, 40); // Change 40 to the desired maximum length
      document.getElementById("shortened-url").innerText = shortenedUrl;
      document.getElementById("shortened-url").style.display = "block";
      document.getElementById("checkUrl").style.display = "inline-block";
      document.getElementById("loadUrl").style.display = "none";
    });
 // });

  document.getElementById("checkHistory").addEventListener("click", function () {
      chrome.tabs.create({ url: chrome.runtime.getURL("history.html") });
    });
  // Toggle mode
  const modeToggle = document.getElementById("modeToggle");
  const modeText = document.getElementById("modeText");

  // onclick checked value save on local storage
  modeToggle.addEventListener("click", function () {
    if (modeToggle.checked) {
      updateModeText("automatic");
      chrome.storage.local.set({ mode: "automatic" });
      // as well as saving mode to local storage
      localStorage.setItem("mode", "Automatic");
      document.getElementById("checkUrl").click();
    } else {
      updateModeText("manual");
      chrome.storage.local.set({ mode: "manual" });
      // as well as save mode to local storage
      localStorage.setItem("mode", "Manual");
    }
  });

  // every time popup is opened, we are chcking the mode and updating the toggle
  chrome.storage.local.get("mode", function (data) {
    if (data.mode === "automatic") {
      // set the toggle to checked because the mode is automatic
      modeToggle.checked = true;
      updateModeText("automatic");
      document.getElementById("checkUrl").click();
    } else {
      // otherwise it remains unchecked
      modeToggle.checked = false;
      updateModeText("manual");
    }
  });

  // Function to update the mode text
  function updateModeText(mode) {
    modeText.textContent = `Mode: ${
      mode.charAt(0).toUpperCase() + mode.slice(1)
    }`;
  }

  document.getElementById("checkUrl").addEventListener("click", function () {
    getCurrentTabUrl(function (url) {
      checkHttps();
      checkSafeBrowsing(url)
        .then((result) => displaySafeBrowsingResult(result))
        .catch((error) => console.error("Error checking URL :", error));

      getAnalysesResult(url)
        .then((virusTotalResult) => {
          displayVirusTotalResult(virusTotalResult);
          saveToHistory(url, "VirusTotal", virusTotalResult);
          updateUrlHighlighting(virusTotalResult); // Update the URL highlighting
          // Send a message to the background script
         chrome.runtime.sendMessage({ maliciousCount: virusTotalResult.malicious });
    
        })
        .catch((error) => console.error("Error checking URL :", error));
    });
  });
});
