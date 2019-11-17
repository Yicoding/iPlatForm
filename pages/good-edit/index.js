//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');
import { $wuxSelect } from '../../miniprogram_npm/wux-weapp/index';

Page({
  data: {
    userInfo: {},
    unitList: [],
    typeList: [],
    name: '',
    coverImg: '',
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
  },
  onLoad(options) {
    this.setData({ userInfo: app.globalData.userInfo });
    console.log(options);
    const { id } = options;
    if (id) {
      this.getGoodsDetailById(id);
    }
    this.getUnitList();
    this.getGoodsTypeList();
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
  // 查看单位
  async getUnitList() {
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
  // 查看类型
  async getGoodsTypeList() {
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
  // 单价单位
  onClick1() {
    const { unitList, unitSingle } = this.data;
    const options = unitList.map(item => {
      return {
        title: item.name,
        value: item.id,
      }
    });
    $wuxSelect('#wux-select1').open({
      value: unitSingle,
      options,
      onConfirm: (value, index, options) => {
        console.log('onConfirm', value, index, options)
        if (index !== -1) {
          this.setData({
            unitSingle: value
          })
        }
      },
    })
  },
  // 总单位
  onClick2() {

  },
  // 商品类型
  onClick3() {

  }
});
