//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    orderInfo: {},
    unShipList: [], // 未发货列表
    shipList: [], // 已发货列表
    active: 0,
    isIpx: app.globalData.isIpx,
    userInfo: {},
    loading: true,
    disabled: false,
    id: null,
    total: null,
  },
  // 页面出现
  onLoad(options) {
    this.setData({ userInfo: app.globalData.userInfo });
    const { id = 69, total = '250' } = options;
    this.setData({
      id,
      total
    });
    this.getOrderDetailList(id);
  },
  // 获取订单列表
  async getOrderDetailList(id) {
    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      const { data } = await ajax({
        url: config.service.getOrderDetailList,
        data: { order_id: id }
      });
      console.log('getOrderDetailList', data);
      const unShipList = [];
      const shipList = [];
      data.data.forEach(item => {
        if (item.isChecked === 0) {
          unShipList.push(item);
        } else {
          shipList.push(item);
        }
      });
      console.log('unShipList', unShipList);
      console.log('shipList', shipList);
      this.setData({
        unShipList,
        shipList
      });
      if (unShipList.length === 0) {
        this.setData({active: 1});
      }
    } catch (e) {
      console.log('getOrderDetailList报错', e);
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },
  // 更改订单状态
  async updateOrder() {
    try {
      const { id, userInfo } = this.data;
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      const { data } = await ajax({
        url: config.service.updateOrder,
        method: 'PUT',
        data: {
          id,
          state: 3,
          user_id: userInfo.id
        }
      });
      console.log('updateOrder', data);
      wx.showToast({
        title: '发货完成',
        icon: 'none'
      });
      this.setData({disabled: true});
      setTimeout(() => {
        wx.hideToast();
        wx.navigateBack();
      }, 2000);
    } catch (e) {
      console.log('updateOrder报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // tab切换
  changeTabs(e) {
    console.log(e)
    const { index } = e.detail;
    this.setData({ active: index });
    if (index === 0) {
    } else {
    }
    wx.pageScrollTo({
      scrollTop: 0
    });
  },
  // 勾选
  async onChange(e) {
    try {
      const unShipList = JSON.parse(JSON.stringify(this.data.unShipList));
      const shipList = JSON.parse(JSON.stringify(this.data.shipList));
      const { index, type, check, id } = e.currentTarget.dataset;
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      const { data } = await ajax({
        url: config.service.updateOrderGood,
        method: 'PUT',
        data: {
          ids: id,
          isChecked: check
        }
      });
      if (type === 'unShipList') { // 点击的为未打勾
        unShipList[index].isChecked = check;
        unShipList.forEach(item => {
          item.disabled = true;
        });
        unShipList[index].ani = true;
        this.setData({ unShipList });
        setTimeout(() => {
          const item = unShipList[index];
          item.ani = false;
          unShipList.forEach(item => {
            item.disabled = false;
          });
          unShipList.splice(index, 1);
          shipList.unshift(item);
          this.setData({
            unShipList,
            shipList
          });
          if (unShipList.length === 0) {
            this.setData({active: 1});
          }
        }, 1400);
      } else {
        shipList[index].isChecked = check;
        shipList[index].ani = true;
        shipList.forEach(item => {
          item.disabled = true;
        });
        this.setData({ shipList });
        setTimeout(() => {
          const item = shipList[index];
          item.ani = false;
          shipList.forEach(item => {
            item.disabled = false;
          });
          shipList.splice(index, 1);
          unShipList.unshift(item);
          this.setData({
            unShipList,
            shipList
          });
          if (shipList.length === 0) {
            this.setData({active: 0});
          }
        }, 1400);
      }
      console.log('updateOrderGood', data);
    } catch (e) {
      console.log('updateOrderGood报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 一键操作
  async changeCheck() {
    try {
      const { active, unShipList, shipList } = this.data;
      let isChecked;
      let ids;
      if (active === 0) { // 一键发货
        isChecked = 1;
        ids = unShipList.map(item => item.id);
      } else { // 一键撤回
        isChecked = 0;
        ids = shipList.map(item => item.id);
      }
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      await ajax({
        url: config.service.updateOrderGood,
        method: 'PUT',
        data: {
          ids,
          isChecked
        }
      });
      if (active === 0) { // 一键发货
        unShipList.forEach(item => {
          item.ani = true;
          item.isChecked = 1;
        });
        this.setData({ unShipList });
        setTimeout(() => {
          unShipList.forEach(item => {
            item.ani = false;
          });
          this.setData({
            shipList: [...unShipList, ...shipList],
            unShipList: []
          });
          this.setData({active: 1});
        }, 1400);
      } else { // 一键撤回
        shipList.forEach(item => {
          item.ani = true;
          item.isChecked = 0;
        });
        this.setData({ shipList });
        setTimeout(() => {
          shipList.forEach(item => {
            item.ani = false;
          });
          this.setData({
            unShipList: [...shipList, ...unShipList],
            shipList: []
          });
          this.setData({active: 0});
        }, 1400);
      }
    } catch (e) {
      console.log('updateOrderGood报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 点击确认发货按钮
  onSubmit() {
    wx.showModal({
      title: '确定要发货了吗？',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.updateOrder();
        }
      }
    })
  }
})
