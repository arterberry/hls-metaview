// admin.js

document.addEventListener("DOMContentLoaded", function () {
    // elements
    const emailInput = document.getElementById("emailInput");
    const signinButton = document.getElementById("signinButton");
    const signinStatus = document.getElementById("signinStatus");

    const aiKeyInput = document.getElementById("aiKeyInput");
    const setKeyButton = document.getElementById("setKeyButton");
    const showKeyButton = document.getElementById("showKeyButton");
    const keyStatus = document.getElementById("keyStatus");

    const settingsJsonEditor = document.getElementById("settingsJsonEditor");
    const channelsJsonEditor = document.getElementById("channelsJsonEditor");
    const saveJsonButton = document.getElementById("saveJsonButton");
    const jsonStatus = document.getElementById("jsonStatus");

    const settingsTabBtn = document.getElementById("settingsTabBtn");
    const channelsTabBtn = document.getElementById("channelsTabBtn");
    const settingsTab = document.getElementById("settingsTab");
    const channelsTab = document.getElementById("channelsTab");

    // constants
    const AI_KEY_STORAGE_KEY = "vidinfra_ai_key";
    const AI_PROVIDER_STORAGE_KEY = "vidinfra_ai_provider";

    // initialize
    initializeAdminPanel();

    // listeners
    if (signinButton) {
        signinButton.addEventListener("click", handleSignIn);
    }

    if (setKeyButton) {
        setKeyButton.addEventListener("click", handleSetKey);
    }

    if (showKeyButton) {
        showKeyButton.addEventListener("click", toggleShowKey);
    }

    if (saveJsonButton) {
        saveJsonButton.addEventListener("click", handleSaveJson);
    }

    if (setProviderButton) {
        setProviderButton.addEventListener("click", handleSetProvider);
    }

    // tab event listeners
    if (settingsTabBtn) {
        settingsTabBtn.addEventListener("click", function () {
            switchTab('settings');
        });
    }

    if (channelsTabBtn) {
        channelsTabBtn.addEventListener("click", function () {
            switchTab('channels');
        });
    }

    // base functions for Admin
    function initializeAdminPanel() {
        try {
            chrome.storage.local.get([AI_KEY_STORAGE_KEY], function (result) {
                if (result[AI_KEY_STORAGE_KEY]) {
                    aiKeyInput.value = "••••••••••••••••••••••••••";
                    aiKeyInput.classList.add("key-hidden");
                    keyStatus.textContent = "Key loaded from storage";
                    showKeyButton.textContent = "Show";
                }
            });

            chrome.storage.local.get([AI_PROVIDER_STORAGE_KEY], function (result) {
                if (result[AI_PROVIDER_STORAGE_KEY] && aiProviderSelect) {
                    aiProviderSelect.value = result[AI_PROVIDER_STORAGE_KEY];
                }
            });
        } catch (error) {
            console.error("Error accessing storage:", error);
        }

        // load dummy JSON data (placeholder)
        const dummySettings = {
            "settings": {
                "cacheMonitoring": true,
                "adTrackingEnabled": true,
                "maxLogEntries": 5000
            },
            "aiIntegration": {
                "enabled": false,
                "model": "gpt-4"
            },
            "uiCustomization": {
                "theme": "light",
                "showAdvancedMetrics": true
            }
        };

        // load channels JSON data
        const dummyChannels = {
            "channels": {
                "foxsports1": {
                    "category": "sports"
                },
                "foxsports2": {
                    "category": "sports"
                },
                "deportes": {
                    "category": "sports"
                }
            }
        };

        if (settingsJsonEditor) {
            settingsJsonEditor.value = JSON.stringify(dummySettings, null, 2);
        }

        if (channelsJsonEditor) {
            channelsJsonEditor.value = JSON.stringify(dummyChannels, null, 2);
        }

        switchTab('settings');
    }

    // tab functions
    function switchTab(tabName) {
        settingsTabBtn.classList.remove('active');
        channelsTabBtn.classList.remove('active');
        settingsTab.classList.remove('active');
        channelsTab.classList.remove('active');

        if (tabName === 'settings') {
            settingsTabBtn.classList.add('active');
            settingsTab.classList.add('active');
        } else if (tabName === 'channels') {
            channelsTabBtn.classList.add('active');
            channelsTab.classList.add('active');
        }
    }

    function handleSignIn() {
        const email = emailInput.value.trim();

        if (!email) {
            signinStatus.textContent = "Please enter your email address";
            signinStatus.className = "error-message";
            return;
        }

        if (!isValidEmail(email)) {
            signinStatus.textContent = "Please enter a valid email address";
            signinStatus.className = "error-message";
            return;
        }

        // a placeholder - no actual authentication
        signinStatus.textContent = "Sign in successful (placeholder)";
        signinStatus.className = "status-message";
    }

    function handleSetKey() {
        const key = aiKeyInput.value.trim();

        if (aiKeyInput.classList.contains("key-hidden")) {
            keyStatus.textContent = "Please enter a new key or click Show to edit the existing key";
            keyStatus.className = "error-message";
            return;
        }

        if (!key) {
            keyStatus.textContent = "Please enter an API key";
            keyStatus.className = "error-message";
            return;
        }

        // store the key securely in chrome.storage
        try {
            chrome.storage.local.set({ [AI_KEY_STORAGE_KEY]: key }, function () {
                aiKeyInput.value = "••••••••••••••••••••••••••";
                aiKeyInput.classList.add("key-hidden");

                keyStatus.textContent = "API key saved successfully";
                keyStatus.className = "status-message";
                showKeyButton.textContent = "Show";
            });
        } catch (error) {
            console.error("Error saving to storage:", error);
            keyStatus.textContent = "Error saving API key: " + error.message;
            keyStatus.className = "error-message";
        }
    }

    function toggleShowKey() {
        if (aiKeyInput.classList.contains("key-hidden")) {
            // TODO: make this show the key -- not working yet
            try {
                chrome.storage.local.get([AI_KEY_STORAGE_KEY], function (result) {
                    if (result[AI_KEY_STORAGE_KEY]) {
                        aiKeyInput.value = result[AI_KEY_STORAGE_KEY];
                        aiKeyInput.classList.remove("key-hidden");
                        showKeyButton.textContent = "Hide";
                    } else {
                        aiKeyInput.value = "";
                        aiKeyInput.classList.remove("key-hidden");
                        keyStatus.textContent = "No API key stored";
                        keyStatus.className = "error-message";
                    }
                });
            } catch (error) {
                console.error("Error accessing storage:", error);
                keyStatus.textContent = "Error retrieving API key: " + error.message;
                keyStatus.className = "error-message";
            }
        } else {
            aiKeyInput.value = "••••••••••••••••••••••••••";
            aiKeyInput.classList.add("key-hidden");
            showKeyButton.textContent = "Show";
        }
    }

    function handleSaveJson() {

        const isSettingsActive = settingsTab.classList.contains('active');
        const currentEditor = isSettingsActive ? settingsJsonEditor : channelsJsonEditor;
        const jsonText = currentEditor.value.trim();

        if (!jsonText) {
            jsonStatus.textContent = "Please enter JSON configuration";
            jsonStatus.className = "error-message";
            return;
        }

        try {
            const jsonObj = JSON.parse(jsonText);

            // a placeholder - no actual saving
            jsonStatus.textContent = isSettingsActive ?
                "Settings configuration saved successfully (placeholder)" :
                "Channels configuration saved successfully (placeholder)";
            jsonStatus.className = "status-message";

            // log the configuration for debugging
            console.log(`Saved ${isSettingsActive ? 'Settings' : 'Channels'} configuration:`, jsonObj);

        } catch (error) {
            jsonStatus.textContent = "Invalid JSON format: " + error.message;
            jsonStatus.className = "error-message";
        }
    }

    // handle setting AI
    function handleSetProvider() {
        const provider = aiProviderSelect.value;

        if (!provider) {
            keyStatus.textContent = "Please select an AI provider";
            keyStatus.className = "error-message";
            return;
        }

        // store the provider in chrome.storage
        try {
            chrome.storage.local.set({ [AI_PROVIDER_STORAGE_KEY]: provider }, function () {
                keyStatus.textContent = `AI provider set to ${provider === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}`;
                keyStatus.className = "status-message";
            });
        } catch (error) {
            console.error("Error saving provider to storage:", error);
            keyStatus.textContent = "Error saving provider: " + error.message;
            keyStatus.className = "error-message";
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});