//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    userInfo: {},
    unitList: [],
    typeList: [],
    id: 0,
    name: '',
    phone: '',
    password: '',
    age: '',
    role_name: '',
    sex: 'man',
    coverImg: 'https://qcloudtest-1257454171.cos.ap-guangzhou.myqcloud.com/present/1574164351806-FFphnQmq.jpg',
    avatar: '',
    sign: '',
    company_id: null,
  },
  onLoad(options) {
    const { id = 2 } = options;
    if (id) {
      this.getUserDetail(id);
    }
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    let item = this.data.avatar || this.data.coverImg
    let urls = [item]
    wx.previewImage({
      current: item, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
    wx.stopPullDownRefresh()
  },
  // 查看用户详情
  async getUserDetail(id) {
    try {
      this.timee = setTimeout(() => {
        wx.showLoading({
          title: '加载中...',
          mask: true
        });
      }, 300);
      const { data } = await ajax({
        url: config.service.getUserDetail,
        data: { id }
      });
      console.log('getUserDetail', data);
      const { name, phone, password, age, role_name, sex, avatar, sign, company_id } = data;
      this.setData({ name, phone, password, avatar, age, role_name, sex, sign, company_id });
    } catch (e) {
      console.log('getUserDetail报错', e);
    } finally {
      if (this.timee) {
        clearTimeout(this.timee);
        this.timee = null;
      }
      wx.hideLoading();
    }
  },
});
