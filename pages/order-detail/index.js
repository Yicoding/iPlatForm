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
    userInfo: {},
  },
  // 页面出现
  onLoad(options) {
    const { id = 22 } = options;
    this.setData({
      id,
      userInfo: app.globalData.userInfo
    });
    // this.getOrderDetail(id);
    this.getOrderDetailList(id);
  },
  onShow() {
    const { id } = this.data;
    this.getOrderDetail(id);
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
          desc: data.createTime.slice(0, -3)
        },
        {
          text: data.state === 1 ? '待付款' : `已付款(${data.payUser.name})`,
          desc: data.payTime && data.payTime.slice(0, -3) || ''
        },
        {
          text: data.state === 3 ? `已发货(${data.finishUser.name})` : '待发货',
          desc: data.finishTime && data.finishTime.slice(0, -3) || ''
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
  // 确认付款
  changeState() {
    wx.showModal({
      title: '请您确认收款',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.updateOrder();
        }
      }
    })
  },
  // 更改订单状态
  async updateOrder() {
    try {
      const { orderInfo, userInfo } = this.data;
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      const { data } = await ajax({
        url: config.service.updateOrder,
        method: 'PUT',
        data: {
          id: orderInfo.id,
          state: 2,
          user_id: userInfo.id
        }
      });
      console.log('updateOrder', data);
      this.getOrderDetail(orderInfo.id);
      this.getOrderDetailList(orderInfo.id);
    } catch (e) {
      console.log('updateOrder报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 去发货
  linkShip() {
    const { orderInfo } = this.data;
    wx.navigateTo({
      url: `../ship/index?id=${orderInfo.id}&total=${orderInfo.total}`
    })
  }
})
