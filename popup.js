let latestActivity = {};
let activities = {};

chrome.action.setBadgeText({ text: ' ' });


chrome.storage.local.get(["user"]).then((result) => {
  console.log(result.user);
  if (result.user === undefined || result.user.expires_at * 1000 < Date.now()) {
    chrome.action.setBadgeBackgroundColor({ color: '#FFA500' })
    document.getElementById("error-message").style.display = 'initial';
    document.getElementById("error-message").addEventListener("click", function () {
      window.open("https://www.nike.com");
    })
  } else {
    document.getElementById("avatar").style.backgroundImage = "url(" + result.user.profile.picture + ")";
    chrome.action.setBadgeBackgroundColor({ color: '#008000' })
  }

});

chrome.storage.local.get(["activities"]).then((result) => {
  if (result.activities === undefined) { return }
  else {
    latestActivity = result.activities[0];
    const element = displayActivity(result.activities[0]);
    document.getElementById('error-message').parentNode.insertBefore(element, document.getElementById('error-message').nextSibling);
  }
});

function getMetric(activity, metric) {
  const summary = activity.summaries.find(obj => { return obj.metric === metric })
  return summary;
}

function formatPace(pace) {
  var paceMins = Math.floor(pace);
  var paceSecs = Math.floor((pace - paceMins) * 60);
  return `${paceMins}'${paceSecs}`
}

function formatDate(ms) {
  var date = new Date(ms);
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  return formattedDate;
}

function formatTime(ms) {
  return new Date(ms).toISOString().slice(14, 19);
}

function downloadData(url, target, downloadName) {
  var hiddenElement = document.createElement('a');
  hiddenElement.href = url;
  hiddenElement.target = target;
  hiddenElement.download = downloadName;
  hiddenElement.click();
}

document.getElementById("download-latest").addEventListener("click", function () {
  var url = 'data:text/json;charset=utf-8,' + encodeURI(JSON.stringify(latestActivity));
  downloadData(url, "_blank", "latestActivity.json");
});

document.getElementById("download-all").addEventListener("click", function () {
  var url = 'data:text/json;charset=utf-8,' + encodeURI(JSON.stringify(activities));
  downloadData(url, "_blank", "allActivity.json");
});

document.getElementById("show-all").addEventListener("click", function () {
  document.getElementById("show-all").style.display = "none";
  document.getElementById("download-latest").style.display = "none";
  chrome.storage.local.get(["activities"]).then((result) => {
    activities = result.activities;
    result.activities.shift();
    displayActivities(result.activities.reverse());
  });
  document.getElementById("download-all").style.display = "initial";
})

function displayActivity(activity) {
  const card = `
    <div class="wrapper main">
       <span class="material-symbols-outlined">
          directions_run
          </span>
        <span class="tag">${activity.tags['com.nike.name']}</span>
        <span class="distance">${getMetric(activity, 'distance')?.value.toFixed(2)}KM</span>
      </div>
      <div class="wrapper secondary">
        <span class="material-symbols-outlined icon">
          calendar_month
          </span>
        <div class="date">
        ${formatDate(activity.end_epoch_ms)}
        </div>
        <span class="material-symbols-outlined icon">
          speed
          </span>
        <div class="pace">
        ${formatPace(getMetric(activity, 'pace')?.value)}
        </div>
        <span class="material-symbols-outlined icon">
          timer
          </span>
        <div class="time">
        ${formatTime(activity.active_duration_ms)}
        </div>
      </div>`
  const element = document.createElement('div');
  element.innerHTML = card;
  element.classList.add('card')
  return element;
}

function displayActivities(activities) {
  const activityElements = activities.map(displayActivity);
  const container = document.createElement('div');
  activityElements.forEach((element) => container.appendChild(element));
  document.getElementsByClassName('card')[0].parentNode.insertBefore(container, document.getElementsByClassName('card')[0].nextSibling);
}

