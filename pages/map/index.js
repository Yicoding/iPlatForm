//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {}
  },
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo });
  },
  // 跳转
  linkMenu(e) {
    console.log(e);
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../${url}/index`
    });
  }
})
