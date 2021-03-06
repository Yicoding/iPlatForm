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
    // 获取本地用户信息
    try {
      const userList = wx.getStorageSync('userList');
      console.log('userList', userList);
      if (userList) {
        const { phone, password } = userList[0];
        return this.loginByWx(phone, password);
      }
      const userInfo = wx.getStorageSync('userInfo');
      console.log('userInfo', userInfo);
      if (userInfo) {
        const { phone, password } = userInfo;
        this.loginByWx(phone, password);
      }
    } catch (e) {
      console.log('login onLoad报错', e);
    }
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
    if (!this.data.phone || !this.data.password) {
      return;
    }
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
  async loginByWx(phone, password) {
    try {
      this.setData({ isLogin: true });
      wx.showLoading({
        title: '加载中',
      });
      const { data } = await ajax({
        url: config.service.loginByWx,
        method: 'POST',
        data: {
          phone: phone || this.data.phone,
          password: password || this.data.password
        }
      });
      console.log('loginByWx', data);
      if (data && data.length && data.length === 1) {
        app.globalData.userInfo = data[0];
        wx.setStorage({
          key: 'userInfo',
          data: data[0]
        });
        wx.reLaunch({
          url: '../index/index'
        });
        return;
      }
      app.globalData.userList = data;
      wx.setStorage({
        key: 'userList',
        data: data
      });
      return wx.reLaunch({
        url: '../company/index'
        // url: '../index/index'
        // url: '../mine/index'
        // url: '../order/index'
        // url: '../shop/index'
      });
      wx.redirectTo({
        // url: '../order-detail/index'
        // url: '../ship/index'
        // url: '../good/index'
        url: '../good-detail/index'
        // url: '../search/index'
        // url: '../good-edit/index'
        // url: '../user/index'
        // url: '../map/index'
        // url: '../menu/index'
        // url: '../unit/index'
      })
    } catch (e) {
      wx.removeStorage({
        key: 'userInfo'
      });
      this.setData({ isLogin: false });
      console.log('loginByWx接口报错', e);
    } finally {
      wx.hideLoading();
    }
  }
})
