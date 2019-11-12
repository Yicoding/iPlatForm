//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    orderInfo: {},
    orderList: [],
    steps: [],
    active: 0,
    isIpx: app.globalData.isIpx,
  },
  // 页面出现
  onLoad(options) {
    const { id = 22 } = options;
    this.getOrderDetail(id);
    this.getOrderDetailList(id);
  },
  // 获取订单信息
  async getOrderDetail(id) {
    this.timee = setTimeout(() => {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }, 350);
    try {
      const { data } = await ajax({
        url: config.service.getOrderDetail,
        data: { id }
      });
      console.log('getOrderDetail', data);
      const steps = [
        {
          text: `已创建(${data.createUser.name})`,
          desc: data.createTime
        },
        {
          text: data.state === 1 ? '待付款' : `已付款(${data.payUser.name})`,
          desc: data.payTime || ''
        },
        {
          text: data.state === 3 ? `已发货(${data.finishUser.name})` : '待发货',
          desc: data.finishTime || ''
        }
      ];
      const active = data.state - 1;
      this.setData({
        orderInfo: data,
        steps,
        active
      });
    } catch (e) {
      console.log('getOrderDetail报错', e);
    } finally {
      if (this.timee) {
        clearTimeout(this.timee)
        this.timee = null;
      }
      wx.hideLoading();
    }
  },
  // 获取订单列表
  async getOrderDetailList(id) {
    try {
      const { data } = await ajax({
        url: config.service.getOrderDetailList,
        data: { order_id: id }
      });
      console.log('getOrderDetailList', data);
      this.setData({ orderList: data.data });
    } catch (e) {
      console.log('getOrderDetailList报错', e);
    }
  },
  
})
