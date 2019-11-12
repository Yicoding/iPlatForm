const app = getApp();
const config = require('../../config');

const { ajax } = require('../../utils/ajax');

Page({
  data: {
    disabled: true,
    phone: '',
    password: '',
    isLogin: false
  },
  onLoad: function () {
  },
  // 键盘输入时
  changeVal(e) {
    const { key } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [key]: value.trim()
    });
    if (this.data.phone && this.data.password) { // 都不为空
      this.setData({ disabled: false });
    } else {
      this.setData({ disabled: true });
    }
  },
  // 清除
  clearVal(e) {
    const { key } = e.currentTarget.dataset;
    console.log(key);
    this.setData({
      [key]: ''
    });
    this.setData({ disabled: true });
  },
  // 点击登录
  login() {
    const patten = /^1\d{10}$/;
    if (!patten.test(this.data.phone)) {
      return wx.showToast({
        title: '请输入正确的手机号！',
        icon: 'none'
      })
    }
    this.loginByWx();
  },
  // 去登录
  async loginByWx() {
    try {
      this.setData({ isLogin: true });
      wx.showLoading({
        title: '加载中',
      });
      const { phone, password } = this.data;
      const { data } = await ajax({
        url: config.service.loginByWx,
        method: 'POST',
        data: {
          phone,
          password
        }
      });
      console.log('loginByWx', data);
      app.globalData.userInfo = data;
      wx.setStorage({
        key: 'userInfo',
        data
      });
      wx.switchTab({
        url: '../index/index'
      });
    } catch (e) {
      this.setData({ isLogin: false });
      console.log('loginByWx接口报错', e);
    } finally {
      wx.hideLoading();
    }
  }
})
