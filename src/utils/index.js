export function isScreenShareSupported() {
  return navigator && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
}

export function isWebRTCSupported() {
  return navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
}