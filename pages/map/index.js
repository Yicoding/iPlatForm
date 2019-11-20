//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    
  },
  onLoad() {
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
