//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    shopList: [],
    shopInvalidList: [],
    totalPrice: 0,
    msg: {
      icon: '/images/shop-empty.png',
      title: '购物车空空如也～',
      buttons: [{
        text: '随便逛逛'
      }],
    },
    loading: true,
    userInfo: {},
    isprvent: false,
  },
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo });
  },
  // 页面出现
  onShow() {
    if (this.data.isprvent) {
      this.setData({ isprvent: false });
      return;
    }
    this.getShoplist();
    this.getShoplistInValid();
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    this.getShoplist();
    this.getShoplistInValid();
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
        data: {
          user_id: this.data.userInfo.id,
          company_id: this.data.userInfo.company_id
        }
      });
      console.log('getShoplist', data);
      this.setData({ shopList: data });
      if (data.length === 0) {
        this.setData({ totalPrice: 0 });
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
      console.log('totalPrice', totalPrice);
      this.setData({ totalPrice });
    } catch (e) {
      console.log('getShoplist报错', e);
    } finally {
      wx.stopPullDownRefresh();
      if (this.timee) {
        clearTimeout(this.timee)
        this.timee = null;
      }
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },
  // 获取购物车失效列表
  async getShoplistInValid() {
    try {
      const { data } = await ajax({
        url: config.service.getShoplistInValid,
        data: {
          user_id: this.data.userInfo.id,
          company_id: this.data.userInfo.company_id
        }
      });
      console.log('getShoplistInValid', data);
      this.setData({ shopInvalidList: data });
      if (data.length === 0) {
        return;
      }
    } catch (e) {
      console.log('getShoplistInValid报错', e);
    }
  },
  // 修改单个购物车商品数量
  async updateShop(index, num, item) {
    console.log('updateShop**num', index, num, item);
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.updateShop,
        method: 'PUT',
        data: {
          good_id: item.good_id,
          unitType: item.unitType,
          priceType: item.priceType,
          user_id: this.data.userInfo.id,
          num
        }
      });
      const shopList = JSON.parse(JSON.stringify(this.data.shopList));
      const todu = shopList[index];
      this.setData({
        totalPrice: this.data.totalPrice + (num - todu.num) * (todu.unitType === 1 ? (
          todu.priceType === 1 ? todu.sellSingle : todu.priceType === 2 ? todu.midSingle : todu.writePrice
        ) : (
            todu.priceType === 1 ? todu.sellAll : todu.priceType === 2 ? todu.midAll : todu.writePrice
          ))
      });
      shopList[index].num = num;
      this.setData({ shopList });
      console.log('updateShop', data);
    } catch (e) {
      console.log('updateShop报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 删除无效商品
  removeInvalid(e) {
    this.remove(e, 'invalid');
  },
  // 点击删除
  remove(e, isInvalid=null) {
    console.log(e)
    const { index, item } = e.currentTarget.dataset;
    wx.showModal({
      title: `确定删除 ${item.name} 吗？`,
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          if (isInvalid) {
            this.removeShopInvalid(item.id, index);
          } else {
            this.removeShopById(item.id, index);
          }
        }
      }
    })
  },
  // 删除单个无效的购物车
  async removeShopInvalid(id, index) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.removeShopById,
        method: 'PUT',
        data: {
          id
        }
      });
      console.log('removeShopInvalid', data);
      const shopInvalidList = JSON.parse(JSON.stringify(this.data.shopInvalidList));
      shopInvalidList.splice(index, 1);
      this.setData({ shopInvalidList });
    } catch (e) {
      console.log('removeShopInvalid报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 删除单个购物车
  async removeShopById(id, index) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.removeShopById,
        method: 'PUT',
        data: {
          id
        }
      });
      console.log('removeShopById', data);
      const shopList = JSON.parse(JSON.stringify(this.data.shopList));
      const todu = shopList[index];
      this.setData({
        totalPrice: this.data.totalPrice - todu.num * (todu.unitType === 1 ? (
          todu.priceType === 1 ? todu.sellSingle : todu.priceType === 2 ? todu.midSingle : todu.writePrice
        ) : (
            todu.priceType === 1 ? todu.sellAll : todu.priceType === 2 ? todu.midAll : todu.writePrice
          ))
      });
      shopList.splice(index, 1);
      this.setData({ shopList });
    } catch (e) {
      console.log('removeShopById报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 去结算
  onSubmit() {
    console.log('提交订单', this.data.shopList);
    wx.navigateTo({ url: '../order-confirm/index' });
  },
  // 数量变化
  shopChange(e) {
    console.log(e);
    const { value } = e.detail;
    const { index, item } = e.currentTarget.dataset;
    this.updateShop(index, value, item);
  },
  // 清空购物车
  clearShop() {
    if (this.data.shopList.length === 0 && this.data.shopInvalidList.length === 0) {
      return;
    }
    wx.showModal({
      title: '确定要清空购物车吗？',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.removeShopByUser();
        }
      }
    })
  },
  // 删除该用户全部购物车
  async removeShopByUser() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.removeShopByUser,
        method: 'PUT',
        data: {
          user_id: this.data.userInfo.id,
          company_id: this.data.userInfo.company_id
        }
      });
      console.log('removeShopByUser', data);
      this.setData({
        shopList: [],
        shopInvalidList: [],
        totalPrice: 0
      });
    } catch (e) {
      console.log('removeShopByUser接口报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 随便逛逛
  buttonClicked() {
    wx.switchTab({
      url: '../index/index'
    })
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
