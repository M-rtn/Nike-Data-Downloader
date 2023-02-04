const localStorage = window.localStorage;

for (i in localStorage){
    if(i.match('oidc.user')){
        const oidc_user = (JSON.parse(localStorage[i]));
        chrome.runtime.sendMessage(
            oidc_user
        );
        console.log("\n🔑 Sending token")
    }
}


