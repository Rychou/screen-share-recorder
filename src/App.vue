<template>
  <div id="app">
    <div class="record"
         v-if="isSupported">
      <h2>Record</h2>
      <span class="rec"
            v-show="showREC">REC</span>
      <video ref="screen-share"
             autoplay />
      <div class="action-group">
        <button @click="openScreenShare"
                :disabled="disabled.open">open screen share</button>
        <button :disabled="disabled.start"
                @click="start">start</button>
        <button :disabled="disabled.pause"
                @click="pause">pause</button>
        <button :disabled="disabled.resume"
                @click="resume">resume</button>
        <button :disabled="disabled.stop"
                @click="stop">stop</button>
      </div>
    </div>
    <h2 v-else>Sorry! WebRTC is not fully supported on your browser! Please install latest Chrome on your computer and try this page again.</h2>
    <div class="preview"
         v-if="!!blobUrl">
      <h2>Preview</h2>
      <video :src="blobUrl"
             autoplay
             controls></video>
      <button @click="handleDownload"
              class="download-button">download</button>
    </div>
    <a class="feedback"
       href="https://github.com/Rychou/screen-share-recorder/issues"
       title="feedback on github issues">feedback</a>
  </div>
</template>

<script>
import { RECORD_STATUS_UNSTART, RECORD_STATUS_RECORDING, RECORD_STATUS_PAUSED, RECORD_STATUS_STOPPED } from './utils/const';
import { isScreenShareSupported, isWebRTCSupported } from './utils/index';

export default {
  name: 'App',
  data () {
    return {
      recorder: null,
      screenShareVideoElement: null,
      localScreenShareStream: null,
      disabled: {
        open: false,
        start: true,
        pause: true,
        resume: true,
        stop: true,
      },
      status: RECORD_STATUS_UNSTART,
      chunks: [],
      blobUrl: '',
    }
  },
  computed: {
    showREC () {
      return this.status === RECORD_STATUS_RECORDING;
    },
    isSupported () {
      return isScreenShareSupported() && isWebRTCSupported();
    }
  },
  mounted () {
    this.screenShareVideoElement = this.$refs['screen-share'];
  },
  methods: {
    async openScreenShare () {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.localScreenShareStream = await navigator.mediaDevices.getDisplayMedia();

      // add audio track to screen share stream
      this.localScreenShareStream.addTrack(tempStream.getAudioTracks()[0]);

      // do something when user stop screen share manually
      const screenShareTrack = this.localScreenShareStream.getVideoTracks()[0];
      if (screenShareTrack) {
        screenShareTrack.onended = this.onScreenShareEnded;
        screenShareTrack.onmute = this.onScreenShareEnded;
      }

      // init recorder
      this.recorder = new MediaRecorder(this.localScreenShareStream);
      this.recorder.onstop = this.onRecordStopped;
      this.recorder.ondataavailable = this.onDataAvailable;

      this.screenShareVideoElement.srcObject = this.localScreenShareStream;
      this.screenShareVideoElement.muted = true; // mute local audio to prevent aftersound

      this.disabled.open = true;
      this.disabled.start = false;
    },
    start () {
      this.recorder.start();
      this.status = RECORD_STATUS_RECORDING;
      this.disabled.start = true;
      this.disabled.pause = false;
      this.disabled.stop = false;
    },
    pause () {
      this.recorder.pause();
      this.status = RECORD_STATUS_PAUSED;
      this.disabled.pause = true;
      this.disabled.resume = false;
    },
    resume () {
      this.recorder.resume();
      this.status = RECORD_STATUS_RECORDING;
      this.disabled.pause = false;
      this.disabled.resume = true;
    },
    stop () {
      if (this.recorder.state !== 'inactive') {
        this.recorder.stop();
      }
      this.status = RECORD_STATUS_STOPPED;
      this.disabled.start = false;
      this.disabled.pause = true;
      this.disabled.resume = true;
      this.disabled.stop = true;
    },
    onDataAvailable (e) {
      this.chunks.push(e.data);
    },
    onRecordStopped () {
      const blob = new Blob(this.chunks, { 'type': 'video/mp4' });
      this.blobUrl = URL.createObjectURL(blob);
      this.chunks = [];
    },
    onScreenShareEnded () {
      if (this.localScreenShareStream === null) {
        return;
      }
      console.log('screen share ended')
      this.stop();
      this.localScreenShareStream = null;
      this.screenShareVideoElement.srcObject = null;

      this.disabled.open = false;
      this.disabled.start = true;
    },
    handleDownload () {
      const link = document.createElement('a');
      link.href = this.blobUrl;
      link.download = 'screen-share-record.mp4';
      link.click();
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = '';
    }
  }
}
</script>

<style>
#app {
  display: flex;
  justify-content: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

video {
  width: 500px;
  background-color: #2c3e50;
}

.rec {
  position: absolute;
  background: red;
  color: #fff;
  padding: 0 4px;
}

.preview {
  margin-left: 24px;
}

.download-button {
  display: block;
  margin: 0 auto;
}

.feedback {
  position: absolute;
  right: -123px;
  top: 20px;
  width: 300px;
  padding: 4px 8px;
  font-weight: bold;
  background: aquamarine;
  color: black;
  transform: rotate(45deg);
  text-decoration: none;
}
</style>
