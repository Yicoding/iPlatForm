//app.js
App({
  onLaunch: function () {
    // // 打开调试11
    // wx.setEnableDebug({
    //   enableDebug: true
    // });
    // 获取设备信息
    this.getSystemInfo();
  },
  // 获取设备信息
  getSystemInfo() {
    var _that = this
    wx.getSystemInfo({
      success(res) {
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
        var model = res.model
        if (model.search('iPhone X') != -1 || model.search('iPhone XS') != -1 || model.search('iPhone XR') != -1 || model.search('iPhone XS Max') != -1) {
          _that.globalData.isIpx = true;
        } else {
          _that.globalData.isIpx = false;
        }
      }
    })
  },
  globalData: {
    userInfo: {},
    isIpx: false, // 是否为iPhone X
    isAlertGood: false,
    goodItem: {},
    showItem: false,
    isprvent: false
  }
})