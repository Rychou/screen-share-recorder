# Screen Share Recorder

> 有时候会需要使用到录屏功能，但是在 Window 10 上要找录屏软件很麻烦，有很多软件混杂了很多无用的功能，不够纯净。也有用过 PPT 上面的屏幕录制功能，勉强够用，但是不够方便。
>
> 最近在学 WebRTC，用来做毕设，于是催生了制作该录屏工具的想法。

基于 WebRTC 和 Vue 实现的 Web 端录屏工具，支持屏幕分享+音频录制，并导出为 mp4 文件，预览地址：https://rychou.github.io/screen-share-recorder/dist/index.html

## 项目启动步骤

```shell
git clone https://github.com/Rychou/screen-share-recorder.git

cd screen-share-recorder

npm install

npm run serve
```

## 原理说明

主要用到了以下三个接口：

- WebRTC 获取麦克风设备接口 [getUserMedia](<https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia>)

- WebRTC 屏幕分享接口 [getDisplayMedia](<https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getDisplayMedia>)

- 媒体录制接口 [MediaRecorder](<https://developer.mozilla.org/zh-CN/docs/Web/API/MediaRecorder>)

实现的主要流程：

1. 开启屏幕分享。调用 getDisplayMedia 接口获取屏幕分享的 MediaStream，即可获取到屏幕分享流，可将此流放到 video 标签中进行播放预览。
2. 获取音频 Track。第一步中获取到的屏幕分享流是不支持麦克风的，所以如果需要导出有音频的录屏文件，则需要调用 getUserMedia 接口获取麦克风的音频 Track。
3. 添加音频 Track。将第二步获取到的音频 Track，调用 MediaStream.addTrack 接口，添加到第一步获取到的屏幕分享 MediaStream 中，这样我们就得到了具备音频录制功能的屏幕分享 MediaStream。
4. 使用媒体录制接口进行录制。利用 MediaRecorder，可以录制第三部得到的 MediaStream。
5. 导出为 MP4 文件。

> 主要逻辑都在 App.vue 中实现了，欢迎大家参考。 

## License

MIT
