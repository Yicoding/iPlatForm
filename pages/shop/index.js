//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    shopList: [],
    totalInfo: {}
  },
  // 页面出现
  onShow() {
    this.getShoplist();
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    this.getShoplist();
  },
  // 获取购物车列表
  async getShoplist() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.getShoplist,
        data: { user_id: 2 }
      });
      console.log('getShoplist', data);
      this.setData({ shopList: data });
    } catch (e) {
      console.log('getShoplist报错', e);
    } finally {
      wx.stopPullDownRefresh()
      wx.hideLoading();
    }
  }
})
