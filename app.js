//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 打开调试11
    wx.setEnableDebug({
      enableDebug: true
    });
    // 获取设备信息
    this.getSystemInfo();
    // 获取本地用户信息
    wx.getStorage({
      key: 'userInfo',
      success: ({ data }) => {
        console.log('userInfo', data);
        this.globalData.userInfo = data;
        wx.switchTab({
          url: '../index/index'
        });
      }
    })
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
  }
})