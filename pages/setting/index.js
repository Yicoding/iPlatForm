//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    
  },
  onLoad() {
  },
  // 退出
  loginOut() {
    wx.showModal({
      title: '确定要退出登录吗',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          wx.clearStorage({
            success: () => {
              wx.reLaunch({
                url: '../login/index'
              })
            }
          })
        }
      }
    })
  }
})
