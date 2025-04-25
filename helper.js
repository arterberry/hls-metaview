// helper.js

document.addEventListener('DOMContentLoaded', function() {
    const urlButtons = document.querySelectorAll('.common-url');
    urlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            if (url && window.opener && !window.opener.closed) {
                const inputField = window.opener.document.getElementById('hlsUrl');
                if (inputField) {
                    inputField.value = url;
                    
                    // Optionally trigger the play button
                    const playButton = window.opener.document.getElementById('playVideo');
                    if (playButton) {
                        playButton.click();
                    }
                    
                    window.close();
                }
            }
        });
    });

    const goButton = document.getElementById('goButton');
    if (goButton) {
        goButton.addEventListener('click', fetchAndSetPlayURL);
    }

    const channelInput = document.getElementById('channelInput');
    if (channelInput) {
        channelInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const goButton = document.getElementById('goButton');
                if (goButton && !goButton.disabled) {
                    fetchAndSetPlayURL();
                }
            }
        });

        channelInput.addEventListener('input', function () {
            const channel = this.value.trim().toLowerCase();
            const goButton = document.getElementById('goButton');

            if (goButton) {
                if (channel && !channelsData.channels[channel]) {
                    goButton.disabled = true;
                    goButton.title = `Channel "${channel}" not available`;
                    this.style.borderColor = "#ff6b6b"; // red border for invalid channel
                } else {
                    goButton.disabled = false;
                    goButton.title = "";
                    this.style.borderColor = channel ? "#4CAF50" : ""; // gree border for valid channel
                }
            }
        });
    }

    const cdnSelect = document.getElementById('cdnSelect');
    if (!cdnSelect) {
        console.error("CDN dropdown not found");
    }
});

// test config for foxsports1
const channelsData = {
    // common env
    environments: {
        sports: {
            prod: {
                path: "http://k8s-sportsproduseast1-e77211e626-767331699.us-east-1.elb.amazonaws.com/v1/live?"
            },
            qa: {
                path: "http://k8s-sportsqauswest2-a3adee7975-698804697.us-west-2.elb.amazonaws.com/v1/live?"
            }
        }
    },
    
    // commom patterns
    patterns: {
        sports: "cdn={param:cdn}&bu=sports&duration=31536000&mcl_region={param:mcl_region}&ad_env=1&_fw_ae=nomvpd&_fw_did=85fe6c6c-1f37-68e4-c0f1-872d10abbda6&_fw_did_android_id=&_fw_did_google_advertising_id=&_fw_did_idfa=&_fw_is_lat=0&_fw_nielsen_app_id=P5CFA3B51-3361-481F-B75D-D119A71FF616&_fw_seg=&_fw_us_privacy=1YNN&_fw_vcid2=516429%3A85fe6c6c-1f37-68e4-c0f1-872d10abbda6&ad=fw_prod&ad.csid=fsapp%2Fwebdesktop%2Flive%2Ffs1&ad.flags=+slcb+sltp+qtcb+emcr+fbad+dtrd+vicb&ad.metr=7&ad.prof=516429%3Ayospace_foxsports_webdesktop_live&ad_mode=JIT&caid=EP044429620282&is_lat=0&kuid=&thumbsray=0&traceid=watch-watch-cj%28Mo%25c9mz2B&yo.av=4&yo.eb.bp=profile-jit&yo.lpa=dur&yo.pdt=sync&yo.po=-3&yo.pst=true&yo.t.jt=1500&yo.t.pr=1500&yo.ug=11801&yo.vm=W3siREVTSVJFRF9EVVJBVElPTiI6ICIke0RFU0lSRURfRFVSQVRJT05fU0VDU30iLCAiUFJPR1JBTV9DQUlEIjogIiR7TUVUQURBVEEuQ0FJRH0ifV0K"
    },
    
    // channels 
    channels: {
        "foxsports1": { 
            category: "sports"
        },
        "foxsports2": { 
            category: "sports" 
        },
        "deportes": { 
            category: "sports" 
        }
    }
};

// get region code based on selection
function getRegionCode() {
    const regionEast = document.getElementById('regionEast');
    return regionEast && regionEast.checked ? "ue1" : "uw2";
}

// get environment based on selection
function getEnvironment() {
    const envProd = document.getElementById('envProd');
    return envProd && envProd.checked ? "prod" : "qa";
}

// get CDN based on dropdown selection
function getCDN() {
    const cdnSelect = document.getElementById('cdnSelect');
    return cdnSelect && cdnSelect.value ? cdnSelect.value : "cf"; // default
}

// get CDN name from code
function getCdnName(cdnCode) {
    switch(cdnCode) {
        case 'cf': return 'Cloudfront';
        case 'ak': return 'Akamai';
        case 'fa': return 'Fastly';
        default: return 'Unknown';
    }
}

// function to fetch and set the play URL
async function fetchAndSetPlayURL() {
    const channelInput = document.getElementById('channelInput');
    const channel = channelInput ? channelInput.value.trim().toLowerCase() : "";
    
    if (!channel) {
        alert("Please enter a channel name");
        return;
    }
    
    if (!channelsData.channels[channel]) {
        alert(`Channel "${channel}" is not available.`);
        return;
    }
    
    const region = getRegionCode();
    const environment = getEnvironment();
    const cdn = getCDN();
    
    try {
        const goButton = document.getElementById('goButton');
        if (goButton) {
            goButton.textContent = "Loading...";
            goButton.disabled = true;
        }
        
        const playURL = await fetchPlayURL(channel, region, environment, cdn);
        
        if (goButton) {
            goButton.textContent = "Go";
            goButton.disabled = false;
        }
        
        if (playURL) {
            if (window.opener && !window.opener.closed) {
                const inputField = window.opener.document.getElementById('hlsUrl');
                if (inputField) {
                    inputField.value = playURL;
                    
                    const playButton = window.opener.document.getElementById('playVideo');
                    if (playButton) {
                        playButton.click();
                    }
                    
                    window.close();
                }
            } else {
                alert("Unable to communicate with the main window");
            }
        } else {
            alert("Failed to get stream URL. Check console for details.");
        }
    } catch (error) {
        const goButton = document.getElementById('goButton');
        if (goButton) {
            goButton.textContent = "Go";
            goButton.disabled = false;
        }
        
        console.error("Error in fetchAndSetPlayURL:", error);
        alert(`Error: ${error.message}`);
    }
}

// fetch the playURL
async function fetchPlayURL(channel, region, environment, cdn) {
    console.log(`Fetching playURL for channel: ${channel}, region: ${region}, env: ${environment}, cdn: ${cdn} (${getCdnName(cdn)})`);
    
    if (!channelsData.channels[channel]) {
        console.error(`Error: Channel '${channel}' not found.`);
        return null;
    }
    
    const channelConfig = channelsData.channels[channel];
    const category = channelConfig.category;
    
    if (!channelsData.environments[category] || !channelsData.environments[category][environment]) {
        console.error(`Error: Category '${category}' or environment '${environment}' not found for channel '${channel}'.`);
        return null;
    }

    let requestChannel = channel;
    if (environment === "qa") {
        requestChannel = `${channel}-qa`;
        console.log(`Using QA-formatted channel name: ${requestChannel}`);
    }
    
    // get environment path - check for channel-specific override 
    let envPath;
    if (channelConfig.env && channelConfig.env[environment] && channelConfig.env[environment].path) {
        envPath = channelConfig.env[environment].path;
    } else {
        envPath = channelsData.environments[category][environment].path;
    }
    
    // construct the base URL
    const url = `${envPath}cdn=${cdn}&channel=${requestChannel}&mcl_region=${region}`;
    
    let pattern;
    if (channelConfig.pattern) {
        pattern = channelConfig.pattern;
    } else if (channelsData.patterns[category]) {
        pattern = channelsData.patterns[category];
    } else {
        console.error(`Error: No pattern found for channel '${channel}' or category '${category}'.`);
        return null;
    }
    
    const postData = {
        pattern: pattern
    };
    
    try {
        console.log("Fetching from URL:", url);
        console.log("With payload:", postData);
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
        }
        
        const result = await response.json();
        console.log("API Response:", result);
        
        if (result.playURL) {
            console.log("Successfully retrieved playURL:", result.playURL);
            return result.playURL;
        } else {
            console.error("API response did not contain playURL:", result);
            return null;
        }
    } catch (error) {
        console.error("Error fetching playURL:", error.message);
        throw error;
    }
}