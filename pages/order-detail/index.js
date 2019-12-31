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
    isprvent: false,
  },
  // 页面出现
  onLoad(options) {
    const { id = 90 } = options;
    this.setData({
      id,
      userInfo: app.globalData.userInfo
    });
    // this.getOrderDetail(id);
    this.getOrderDetailList(id);
  },
  onShow() {
    if (this.data.isprvent) {
      this.setData({ isprvent: false });
      return;
    }
    const { id } = this.data;
    this.getOrderDetail(id);
  },
  // 去打印
  goPrint(e) {
    const { id } = e.currentTarget.dataset;
    console.log('id', id);
    wx.showModal({
      title: '要打印订单吗？',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.printOrderById(id);
        }
      }
    })
  },
  async printOrderById(id) {
    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      const { data } = await ajax({
        url: config.service.printOrderById,
        method: 'POST',
        data: { id }
      });
      console.log('printOrderById', data);
    } catch (e) {
      console.log('printOrderById报错', e);
    } finally {
      wx.hideLoading();
    }
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
      let steps = [];
      let active;
      if (data.state !== 4) {
        steps = [
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
        active = data.state - 1;
      }
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
  },
  // 重新下单
  resetOrder() {
    wx.showModal({
      title: '确定要取消该订单，重新下单吗？',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.cancelOrder();
          this.onceOrderFun();
        }
      }
    })
  },
  // 再来一单
  onceOrder() {
    wx.showModal({
      title: '确定要再来一单吗？',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.onceOrderFun();
        }
      }
    })
  },
  // 点击取消订单
  goCancel() {
    wx.showModal({
      title: '确定要取消该订单吗？',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.cancelOrder();
        }
      }
    })
  },
  // 取消订单
  async cancelOrder() {
    try {
      const { id, userInfo, orderInfo } = this.data;
      await ajax({
        url: config.service.updateOrder,
        method: 'PUT',
        data: {
          id,
          state: 4,
          user_id: userInfo.id
        }
      });
      console.log('updateOrder取消订单成功');
      this.getOrderDetail(orderInfo.id);
    } catch (e) {
      console.log('updateOrder报错', e);
    }
  },
  async onceOrderFun() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const shopList = this.data.orderList.map(item => {
        const { good_id, unitType, priceType, num, writePrice } = item;
        return {
          user_id: this.data.userInfo.id,
          good_id,
          unitType,
          priceType,
          num,
          writePrice
        }
      });
      await ajax({
        url: config.service.removeShopByUser,
        method: 'PUT',
        data: {
          user_id: this.data.userInfo.id
        }
      });
      const { data } = await ajax({
        url: config.service.addShopMultiple,
        method: 'POST',
        data: {
          shopList
        }
      });
      console.log('addShopMultiple', data);
      wx.switchTab({
        url: '../shop/index'
      });
    } catch (e) {
      console.log('addShopMultiple报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 查看图片
  viewImg(e) {
    const { item } = e.currentTarget.dataset;
    const urls = [item]
    wx.previewImage({
      current: item, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    });
    this.setData({ isprvent: true });
  }
})
