
// Handles dark/light theme switching for the app
const themeContainer = document.querySelector(".theme-change-container");
themeContainer.addEventListener("click", (e) => {
  const body = document.querySelector("body");
  body.classList.toggle("body--dark");
  body.classList.toggle("body--light");
});


// Main textarea for user input
const textArea = document.querySelector("#word-count");

// On every input, update all counters and UI states
textArea.addEventListener('input', () => {
  let excludeSpaces = checkExcludeSpaces();
  countTotalCharacters(excludeSpaces);
  countTotalWords();
  countTotalSentences();
  checkCharLimit(textArea.value);
  showMore();
  checkLetterDensity(textArea.value);
});


// Counts total characters, optionally excluding spaces, and updates UI
function countTotalCharacters(excludeSpaces) {
  const textArea = document.querySelector("#word-count");
  let value = textArea.value;
  if (value === "") {
    let container = document.querySelector(".progress-container-all");
    container.innerHTML = "";
    renderTotalCharacters(0);
    return;
  }
  let map = new Map();
  value = value.toUpperCase();
  let countWithoutSpace = 0;
  let count = 0;
  for (let v of value) {
    if (v === " ") {
      if (!excludeSpaces) {
        count++;
      }
    } else {
      count++;
      countWithoutSpace++;
      if (map.get(v) === undefined) {
        map.set(v, 1);
      } else {
        let x = map.get(v);
        x++;
        map.set(v, x);
      }
    }
  }
  letterDensity(map, countWithoutSpace);
  renderTotalCharacters(count);
}

// Updates the displayed total character count
function renderTotalCharacters(count) {
  const totalCountText = document.querySelector(".char-count");
  totalCountText.innerHTML = `${count}`;
}

// Handles the "exclude spaces" checkbox state
const checkBox = document.querySelector(".exclude-spaces-checkbox");
checkBox.addEventListener("click", () => {
  let excludeSpaces = checkExcludeSpaces();
  countTotalCharacters(excludeSpaces);
});

// Returns true if "exclude spaces" is checked
function checkExcludeSpaces() {
  const checkBox = document.querySelector(".exclude-spaces-checkbox");
  return checkBox.checked;
}


// Counts total words and updates UI
function countTotalWords() {
  const textArea = document.querySelector("#word-count");
  let origValue = textArea.value;
  if (origValue === "") {
    readingTime(0);
    renderTotalWords(0);
    return;
  }
  let value = textArea.value.split(" ").filter((v) => v !== "");
  readingTime(value.length);
  renderTotalWords(value.length);
}

// Updates the displayed total word count
function renderTotalWords(count) {
  const totalWordsText = document.querySelector(".word-count");
  totalWordsText.innerHTML = `${count}`;
}

// Counts total sentences (by periods) and updates UI
function countTotalSentences() {
  const textArea = document.querySelector("#word-count");
  let origValue = textArea.value;
  if (origValue === "") {
    renderTotalSentence(0);
    return;
  }
  let lastChar = origValue.charAt(origValue.length - 1);
  let value = textArea.value.split(".").filter((v) => v !== "" && v !== ".");
  let count = 0;
  if (lastChar === ".") {
    count = value.length;
  } else {
    count = value.length - 1;
  }
  renderTotalSentence(count);
}

// Updates the displayed total sentence count
function renderTotalSentence(count) {
  const totalSentenceText = document.querySelector(".sentence-count");
  totalSentenceText.innerHTML = `${count}`;
}


// Renders the letter density bars for each character
function letterDensity(map, total) {
  const container = document.querySelector(".progress-container-all");
  if (!container || total === 0) {
    container.innerHTML = ""; // Clear if empty
    return;
  }

  // Track existing bars for smooth updates
  const existingBars = new Map();
  const currentContainers = container.querySelectorAll(".progress-container");
  currentContainers.forEach((bar) => {
    const char = bar.getAttribute("data-char");
    if (char) {
      existingBars.set(char, bar);
    }
  });

  // Sort characters by frequency (descending)
  const sortedEntries = Array.from(map.entries()).sort((a, b) => {
    const aPerc = parseFloat(calculatePercentage(a[1], total));
    const bPerc = parseFloat(calculatePercentage(b[1], total));
    return bPerc - aPerc;
  });

  container.innerHTML = "";

  // Render each character's bar
  for (let [char, count] of sortedEntries) {
    const percentage = calculatePercentage(count, total);
    let bar;
    if (existingBars.has(char)) {
      bar = existingBars.get(char);
      const info = bar.querySelector(".progress-info");
      const valueBar = bar.querySelector(".value");
      info.innerHTML = `${count} (${percentage}%)`;
      requestAnimationFrame(() => {
        valueBar.style.width = `${percentage}%`;
      });
    } else {
      bar = createProgress(char, count, percentage);
    }
    container.appendChild(bar);
  }
}

// Calculates the percentage for a character
function calculatePercentage(value, total) {
  return ((value / total) * 100).toFixed(2);
}

// Creates a progress bar element for a character
function createProgress(char, count, percentage) {
  let outerDiv = document.createElement("div");
  outerDiv.classList.add(
    "progress-container",
    "flex",
    "align-center",
    "gap-15"
  );
  outerDiv.setAttribute("data-char", char);

  let label = document.createElement("p");
  label.classList.add("progress-label");
  label.innerHTML = `${char}`;

  let info = document.createElement("p");
  info.classList.add("progress-info");
  info.innerHTML = `${count} (${percentage}%)`;

  let innerDiv = document.createElement("div");
  innerDiv.classList.add("progress");

  let subInnerDiv = document.createElement("div");
  subInnerDiv.classList.add("value");
  subInnerDiv.style.width = `0%`;

  innerDiv.appendChild(subInnerDiv);
  outerDiv.appendChild(label);
  outerDiv.appendChild(innerDiv);
  outerDiv.appendChild(info);

  // Animate the bar width
  requestAnimationFrame(() => {
    subInnerDiv.style.width = `${percentage}%`;
  });

  return outerDiv;
}


// Hides all but the top 6 letter bars, shows "Show More" button if needed
function showMore(map) {
  let containers = document.querySelectorAll(".progress-container");
  let showMore = document.querySelector(".btn");
  if (containers.length > 6) {
    showMore.classList.remove("hidden");
    let count = 1;
    containers.forEach((container) => {
      if (count > 6) {
        container.classList.add("hidden");
      }
      else{
        container.classList.remove("hidden");
      }
      count++;
    });
  } else {
    showMore.classList.add("hidden");
  }
}

// Handles "Show More"/"Show Less" button click
let showMoreBtn = document.querySelector(".btn");
showMoreBtn.addEventListener("click", () => {
  let containers = document.querySelectorAll(".progress-container");
  let count = 1;
  containers.forEach((container) => {
    if (count > 6) {
      container.classList.toggle("hidden");
    }
    count++;
  });

  let seeMore = document.querySelector(".see-more");
  let seeLess = document.querySelector(".see-less");
  let downIcon = document.querySelector(".down");
  let upIcon = document.querySelector(".up");

  seeMore.classList.toggle("hidden");
  seeLess.classList.toggle("hidden");
  downIcon.classList.toggle("hidden");
  upIcon.classList.toggle("hidden");
});


// Handles character limit checkbox and input
let charLimitCheckbox = document.querySelector(".char-limit-checkbox");
charLimitCheckbox.addEventListener("click", () => {
  let charLimitContainer = document.querySelector(".char-limit-container");
  if (isCharLimit()) {
    charLimitContainer.classList.remove("hidden");
  } else {
    charLimitContainer.classList.add("hidden");
  }
  checkCharLimit(textArea.value);
});

// Returns true if character limit is enabled
function isCharLimit() {
  return charLimitCheckbox.checked;
}

// Checks if input exceeds character limit and updates UI
function checkCharLimit(value) {
  let charLimitContainer = document.querySelector(".char-limit-input");
  let limit = charLimitContainer.value;
  let textArea = document.querySelector("#word-count");
  let errorTextContainer = document.querySelector(".error-state-container");
  let errorText = errorTextContainer.querySelector(".error-state-text");

  if (value.length > limit && isCharLimit()) {
    textArea.classList.add("error-state");
    errorTextContainer.classList.remove("hidden");
    errorText.innerHTML = `Limit reached! Your text exceeds ${limit} characters.`;
  } else {
    textArea.classList.remove("error-state");
    errorTextContainer.classList.add("hidden");
  }
}

// Ensures empty limit input is always set to zero
let charLimitContainer = document.querySelector(".char-limit-input");
charLimitContainer.addEventListener("blur", (e) => {
  if (charLimitContainer.value === "") {
    charLimitContainer.value = "0";
  }
});
charLimitContainer.addEventListener("input", (e) => {
  checkCharLimit(textArea.value);
});


// Shows/hides the "empty" message for letter density
function checkLetterDensity(value) {
  let emptyText = document.querySelector(".empty-text");
  if (value.length > 0) {
    emptyText.classList.add("hidden");
  } else {
    emptyText.classList.remove("hidden");
  }
}

// Estimates and displays approximate reading time
function readingTime(words) {
  const wpm = 200;
  const appText = document.querySelector(".reading-time-text");

  if (words === 0) {
    appText.innerHTML = `Approx. reading time: 0 min`;
    return;
  }

  const timeInMinutes = words / wpm;

  if (timeInMinutes < 1) {
    appText.innerHTML = `Approx. reading time: less than 1 min`;
  } else {
    const roundedMinutes = Math.round(timeInMinutes);
    appText.innerHTML = `Approx. reading time: ${roundedMinutes} min`;
  }
}




