

chrome.runtime.onMessage.addListener((request) => {
  console.log("\nš Receiving token")
  chrome.storage.local.set({ 'user': request }).then(() => {
    console.log("\nš Token is set to: ", request);
    console.log("\nš Fetching Activities")
    chrome.action.setBadgeBackgroundColor({ color: '#FFA500' })
    chrome.action.setBadgeText({ text: ' ' });
    getAllActivity(request['access_token']);
  });
});


async function getAllActivity(
  token,
  before_id = "*",
  previousActivities = []) {
  return fetch(`https://api.nike.com/plus/v3/activities/before_id/v3/${before_id}?&types=run%2Cjogging&include_deleted=false`,
    {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Bearer ' + token,
        'nike-api-caller-id': 'nike:com.nike.sport.running.ios:ios:7.19',
        'x-nike-ux-id': 'com.nike.sport.running.ios.6.5.1',
        'content-type': 'application/json'
      }),
    }).then(response => response.json())
    .then(data => {
      const activities = [...previousActivities, ...data.activities]
      if (data.paging.before_id) {
        console.log("\nš Fetching page: " + data.paging.before_id)
        return getAllActivity(token, data.paging.before_id, activities);
      }
      console.log("\nš Fetched all Activities")
      return storeActivities(activities);
    });
}

function storeActivities(activities) {
  console.log("\nš¾ Storing Activity");
  try {
    chrome.storage.local.set({ 'activities': activities }).then(() => {
      console.log("\nš¾ All Activities Stored");
      chrome.action.setBadgeBackgroundColor({ color: '#008000' })
    });
  } catch (err) {
    console.error(err);
  }
}