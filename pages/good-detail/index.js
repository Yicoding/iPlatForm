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
    name: '',
    coverImg: 'https://qcloudtest-1257454171.cos.ap-guangzhou.myqcloud.com/present/1574164351806-FFphnQmq.jpg',
    unitSingle: '',
    unitAll: '',
    typeName: '',
    buySingle: '',
    buyAll: '',
    midSingle: '',
    midAll: '',
    sellSingle: '',
    sellAll: '',
    num: '',
    desc: '',
    origin: '',
    out: false
  },
  onLoad(options) {
    this.setData({ userInfo: app.globalData.userInfo });
    console.log(options);
    const { id = 1, out } = options;
    if (id) {
      this.getGoodsDetailById(id);
      this.getUnitList(id);
      this.getGoodsTypeList(id);
    }
    if (out) {
      this.setData({ out: true });
    }
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    let item = this.data.coverImg
    let urls = [item]
    wx.previewImage({
      current: item, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
    wx.stopPullDownRefresh()
  },
  // 查看单个商品详情
  async getGoodsDetailById(id) {
    try {
      const { company_id } = this.data.userInfo;
      this.timee = setTimeout(() => {
        wx.showLoading({
          title: '加载中...',
          mask: true
        });
      }, 300);
      const { data } = await ajax({
        url: config.service.getGoodsDetailById,
        data: {
          id,
          company_id
        }
      });
      console.log('getGoodsDetailById', data);
      const { name, coverImg, unitSingle, unitAll, typeName, buySingle, buyAll, midSingle, midAll, sellSingle, sellAll, num, desc, origin } = data;
      this.setData({ name, coverImg, unitSingle, unitAll, typeName, buySingle, buyAll, midSingle, midAll, sellSingle, sellAll, num, desc, origin });
    } catch (e) {
      console.log('getGoodsDetailById报错', e);
    } finally {
      if (this.timee) {
        clearTimeout(this.timee);
        this.timee = null;
      }
      wx.hideLoading();
    }
  },
  // 查看单位列表
  async getUnitList(id) {
    try {
      const { company_id } = this.data.userInfo;
      const { data } = await ajax({
        url: config.service.getUnitList,
        data: { company_id }
      });
      console.log('getUnitList', data);
      this.setData({ unitList: data });
    } catch (e) {
      console.log('getUnitList报错', e);
    }
  },
  // 查看类型列表
  async getGoodsTypeList(id) {
    try {
      const { company_id } = this.data.userInfo;
      const { data } = await ajax({
        url: config.service.getGoodsTypeList,
        data: { company_id }
      });
      console.log('getGoodsTypeList', data);
      this.setData({ typeList: data });
    } catch (e) {
      console.log('getGoodsTypeList报错', e);
    }
  },
});
