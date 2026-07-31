var adviceId = document.getElementById("adviceId");
var adviceText = document.getElementById("adviceText");
var diceBtn = document.getElementById("diceBtn");
var copyBtn = document.getElementById("copyBtn");
var shareBtn = document.getElementById("shareBtn");
var historyBtn = document.getElementById("historyBtn");
var historyPanel = document.getElementById("historyPanel");
var closeHistory = document.getElementById("closeHistory");
var historyList = document.getElementById("historyList");
var clearHistory = document.getElementById("clearHistory");

var advices = [];
var currentAdvice = null;
var adviceHistory = [];

function loadHistory() {
  adviceHistory = [];

  try {
    var saved = localStorage.getItem("adviceHistory");

    if (saved) {
      var parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        adviceHistory = parsed;
      }
    }
  } catch (e) {
    adviceHistory = [];
  }
}

function loadAdvices() {
  fetch("data/advices.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      advices = data;
      generateAdvice();
    })
    .catch(function () {
      adviceText.textContent = "Failed to load advices. Try again later.";
    });
}

function generateAdvice() {
  if (!advices || advices.length === 0) return;

  diceBtn.classList.add("spin");

  setTimeout(function () {
    diceBtn.classList.remove("spin");
  }, 600);

  adviceText.style.opacity = "0";

  setTimeout(function () {
    var randomIndex = Math.floor(Math.random() * advices.length);

    currentAdvice = advices[randomIndex];

    if (!currentAdvice) return;

    adviceId.textContent = currentAdvice.id;
    adviceText.textContent = '"' + currentAdvice.text + '"';
    adviceText.style.opacity = "1";

    addToHistory(currentAdvice);
  }, 300);
}

function addToHistory(advice) {
  if (!advice || !advice.id || !advice.text) return;

  if (!Array.isArray(adviceHistory)) {
    adviceHistory = [];
  }

  // იგივე რჩევა ზედიზედ აღარ დაემატოს
  if (
    adviceHistory.length > 0 &&
    adviceHistory[0].id === advice.id &&
    adviceHistory[0].text === advice.text
  ) {
    return;
  }

  adviceHistory.unshift({
    id: advice.id,
    text: advice.text,
    time: new Date().toLocaleString(),
  });

  if (adviceHistory.length > 50) {
    adviceHistory.pop();
  }

  localStorage.setItem(
    "adviceHistory",
    JSON.stringify(adviceHistory)
  );

  renderHistory();
}

function renderHistory() {
  if (!Array.isArray(adviceHistory)) {
    adviceHistory = [];
  }

  if (!historyList) return;

  historyList.innerHTML = "";

  if (adviceHistory.length === 0) {
    var empty = document.createElement("li");
    empty.textContent = "No history yet.";
    historyList.appendChild(empty);
    return;
  }

  for (var i = 0; i < adviceHistory.length; i++) {
    (function (item) {
      var li = document.createElement("li");
      li.textContent = "#" + item.id + ": " + item.text;

      li.addEventListener("click", function () {
        adviceId.textContent = item.id;
        adviceText.textContent = '"' + item.text + '"';

        currentAdvice = {
          id: item.id,
          text: item.text,
        };

        historyPanel.classList.remove("open");
      });

      historyList.appendChild(li);
    })(adviceHistory[i]);
  }
}

function copyAdvice() {
  if (!currentAdvice) return;

  navigator.clipboard
    .writeText(currentAdvice.text)
    .then(function () {
      var original = copyBtn.textContent;

      copyBtn.textContent = "✓";

      setTimeout(function () {
        copyBtn.textContent = original;
      }, 1500);
    })
    .catch(function () {
      alert("Failed to copy.");
    });
}

function shareTwitter() {
  if (!currentAdvice) return;

  var text = encodeURIComponent('"' + currentAdvice.text + '"');

  window.open(
    "https://twitter.com/intent/tweet?text=" + text,
    "_blank"
  );
}

diceBtn.addEventListener("click", generateAdvice);

copyBtn.addEventListener("click", copyAdvice);

shareBtn.addEventListener("click", shareTwitter);

historyBtn.addEventListener("click", function () {
  historyPanel.classList.add("open");
});

closeHistory.addEventListener("click", function () {
  historyPanel.classList.remove("open");
});

clearHistory.addEventListener("click", function () {
  adviceHistory = [];
  localStorage.removeItem("adviceHistory");
  renderHistory();
});

loadHistory();
renderHistory();
loadAdvices();