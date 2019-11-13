//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    shopList: [],
    totalPrice: 0,
    spendAll: 0,
    isIpx: app.globalData.isIpx,
    name: '',
    phone: '',
    address: '',
    loading: false,
    disabled: false,
    userInfo: {}
  },
  // 页面加载
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo });
    this.getShoplist();
  },
  // 获取购物车列表
  async getShoplist() {
    this.timee = setTimeout(() => {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }, 350);
    try {
      const { data } = await ajax({
        url: config.service.getShoplist,
        data: { user_id: this.data.userInfo.id }
      });
      console.log('getShoplist', data);
      this.setData({ shopList: data });
      if (data.length === 0) {
        return;
      }
      const totalPrice = data.reduce((total, item) => {
        const currentPrice = item.unitType === 1 ? (
          item.priceType === 1 ? item.num * item.sellSingle : item.priceType === 2 ? item.num * item.midSingle : item.num * item.writePrice
        ) : (
            item.priceType === 1 ? item.num * item.sellAll : item.priceType === 2 ? item.num * item.midAll : item.num * item.writePrice
          );
        return total + currentPrice;
      }, 0);
      const spendAll = data.reduce((total, item) => {
        const currentPrice = item.num * (item.unitType === 1 ? item.buySingle : item.buyAll);
        return total + currentPrice;
      }, 0);
      console.log('totalPrice', totalPrice);
      this.setData({
        totalPrice,
        spendAll
      });
    } catch (e) {
      console.log('getShoplist报错', e);
    } finally {
      if (this.timee) {
        clearTimeout(this.timee)
        this.timee = null;
      }
      wx.hideLoading();
    }
  },
  // 返回
  goBack() {
    if (this.data.disabled === true) {
      return;
    }
    wx.navigateBack();
  },
  // 提交订单
  onSubmit() {
    console.log('提交订单', this.data.shopList, this.data.spendAll);
    const orderList = this.data.shopList.map(item => {
      const spend = item.unitType === 1 ? item.buySingle : item.buyAll;
      const sale = item.unitType === 1 ? (
        item.priceType === 1 ? item.sellSingle : item.priceType === 2 ? item.midSingle : item.writePrice
      ) : (
          item.priceType === 1 ? item.sellAll : item.priceType === 2 ? item.midAll : item.writePrice
        );
      const total = item.unitType === 1 ? (
        item.priceType === 1 ? item.num * item.sellSingle : item.priceType === 2 ? item.num * item.midSingle : item.num * item.writePrice
      ) : (
          item.priceType === 1 ? item.num * item.sellAll : item.priceType === 2 ? item.num * item.midAll : item.num * item.writePrice
        );
      return {
        good_id: item.good_id,
        name: item.name,
        unitSingle: item.unitSingleName,
        unitAll: item.unitAllName,
        spend,
        sale,
        num: item.num,
        total,
        gain: (sale - spend) * item.num,
        coverImg: item.coverImg,
        desc: item.desc,
        unitType: item.unitType,
        unitDecimal: item.unitDecimal,
        summary: 1 / item.unitDecimal
      }
    });
    console.log('orderList', orderList);
    this.addOrder(orderList);
  },
  // 创建订单
  async addOrder(orderList) {
    this.setData({ loading: true });
    try {
      const { spendAll, totalPrice, name, phone, address } = this.data;
      const { data, code } = await ajax({
        url: config.service.addOrder,
        method: 'POST',
        data: {
          company_id: 1,
          spend: spendAll,
          total: totalPrice,
          gain: totalPrice - spendAll,
          createUser: this.data.userInfo.id,
          customerName: name,
          customerPhone: phone,
          customerSite: address,
          orderList
        }
      });
      console.log('addOrder', data);
      this.removeShopByUser();
      this.setData({ disabled: true });
      wx.showToast({
        title: '提交成功'
      });
      setTimeout(() => {
        wx.redirectTo({
          url: `../order-detail/index?id=${data.id}`
        });
      }, 2000);
    } catch (e) {
      console.log('addOrder接口报错', e);
    } finally{
      this.setData({ loading: false });
    }
  },
  // 删除该用户全部购物车
  async removeShopByUser() {
    try {
      const { data } = await ajax({
        url: config.service.removeShopByUser,
        method: 'DELETE',
        data: {
          user_id: this.data.userInfo.id
        }
      });
      console.log('removeShopByUser', data);
    } catch (e) {
      console.log('removeShopByUser接口报错', e);
    }
  },
  // 输入框改变时触发
  changeVal(e) {
    const { detail } = e;
    const { type } = e.currentTarget.dataset;
    this.setData({
      [type]: detail
    })
  }
})