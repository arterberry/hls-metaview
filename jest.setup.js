// jest.setup.js - custom setup for Jest tests

// add test-setup.js content here to mock the DOM environment
document.body.innerHTML = `
<div class="video-container">
  <video id="videoPlayer" controls></video>
</div>
<div class="input-group">
  <input type="text" id="hlsUrl" placeholder="https://example.com/stream.m3u8">
  <button id="playVideo">Play</button>
</div>
<div class="helper-link">
  <a href="#" id="playbackHelper">Playback Helper</a>
</div>
<div id="closeButton"></div>
<div id="metadataList"></div>
<div id="resolutionList"></div>
`;

// mock hls.js structure
global.Hls = function () {
    return {
        loadSource: jest.fn(),
        attachMedia: jest.fn(),
        on: jest.fn(),
        startLoad: jest.fn(),
        recoverMediaError: jest.fn(),
        destroy: jest.fn()
    };
};

global.Hls.isSupported = jest.fn().mockReturnValue(true);
global.Hls.Events = {
    MANIFEST_LOADING: 'hlsManifestLoading',
    MANIFEST_LOADED: 'hlsManifestLoaded',
    MANIFEST_PARSED: 'hlsManifestParsed',
    LEVEL_LOADING: 'hlsLevelLoading',
    FRAG_LOADING: 'hlsFragLoading',
    FRAG_LOADED: 'hlsFragLoaded',
    ERROR: 'hlsError',
    BUFFER_APPENDED: 'hlsBufferAppended',
    BUFFER_STALLING: 'hlsBufferStalling'
};
global.Hls.ErrorTypes = {
    NETWORK_ERROR: 'networkError',
    MEDIA_ERROR: 'mediaError',
    OTHER_ERROR: 'otherError'
};
global.Hls.ErrorDetails = {
    BUFFER_STALLED_ERROR: 'bufferStalledError'
};

global.Hls.DefaultConfig = {
    loader: function () { /* Mock loader implementation */ }
};

// mock video element methods
HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue();
HTMLVideoElement.prototype.addEventListener = jest.fn();
HTMLVideoElement.prototype.canPlayType = jest.fn((type) => {
    return type === 'application/vnd.apple.mpegurl' ? 'maybe' : '';
});

// mock Fetch API
global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
        ok: true,
        text: () => Promise.resolve("#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=1280x720\nsample_720p.m3u8"),
        headers: {
            forEach: (callback) => {
                callback('content-type', 'application/vnd.apple.mpegurl');
            }
        }
    })
);

// mock console methods
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

// mock window.open
global.window.open = jest.fn().mockImplementation(() => ({
    focus: jest.fn()
}));

// mock window.close
global.window.close = jest.fn();

// mock window.screen
global.window.screen = {
    width: 1920,
    height: 1080
};

// mock Date functionality
global.Date.prototype.toLocaleTimeString = jest.fn().mockReturnValue('12:00:00');

// mock alert
global.alert = jest.fn();

global.addMetadataEntry = jest.fn();
global.fetchAndParseManifest = jest.fn();
global.parseAndDisplayResolutions = jest.fn();
global.createCustomLoader = jest.fn().mockReturnValue(function () { });

global.resetAllMocks = () => {
    jest.clearAllMocks();
    document.getElementById('hlsUrl').value = '';
    document.getElementById('metadataList').innerHTML = '';
    document.getElementById('resolutionList').innerHTML = '';
};

// mock for chrome API
global.chrome = {
    runtime: {
        onInstalled: {
            addListener: jest.fn()
        },
        onMessage: {
            addListener: jest.fn()
        }
    },
    action: {
        onClicked: {
            addListener: jest.fn()
        }
    },
    contextMenus: {
        create: jest.fn(),
        onClicked: {
            addListener: jest.fn()
        }
    },
    windows: {
        create: jest.fn()
    }
};