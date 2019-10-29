const app = getApp();
const config = require('../../config');

const { ajax } = require('../../utils/ajax');

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    shopList: [],
    load: true,
    visible: false,
    good: {},
    goodNum: 0,
    goodUnitType: 1,
    goodPriceType: 1,
    showPrice: false,
    countInfo: {}
  },
  onLoad() {
    this.getGoodsByCompany();
    this.getShoplistEasy();
  },
  onReady() {
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    this.getGoodsByCompany();
    this.getShoplistEasy();
  },
  // 按公司查找所有商品类型+类型下的商品列表
  async getGoodsByCompany() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.getGoodsByCompany,
        data: {
          company_id: 1,
          role: 'admin'
        }
      });
      console.log('getGoodsByCompany', data);
      this.setData({
        list: data,
        listCur: data[0],
        load: true
      })
      wx.hideLoading();
      wx.stopPullDownRefresh()
    } catch(e) {
      wx.hideLoading();
      console.log('getGoodsByCompany报错', e);
      wx.stopPullDownRefresh()
    }
  },
  // 查询购物车列表
  async getShoplistEasy() {
    try {
      const { data } = await ajax({
        url: config.service.getShoplistEasy,
        data: {
          user_id: 2
        }
      });
      const countInfo = {};
      data.forEach(item => {
        if (countInfo[item.good_id]) {
          countInfo[item.good_id] += Number(item.num);
        } else {
          countInfo[item.good_id] = Number(item.num);
        }
      });
      console.log('getShoplistEasy', data, countInfo);
      this.setData({
        shopList: data,
        countInfo
      });
    } catch(e) {
      console.log('getShoplist报错', e);
    }
  },
  // 新增购物车
  async addShop() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.addShop,
        method: 'POST',
        data: {
          good_id: this.data.good.id,
          unitType: this.data.goodUnitType,
          priceType: this.data.goodPriceType,
          user_id: 2,
          num: 1
        }
      });
      console.log('addShop', data);
      wx.hideLoading();
    } catch(e) {
      wx.hideLoading();
      console.log('addShop报错', e);
    }
  },
  // 修改单个购物车商品数量
  async updateShop(num, value=null) {
    console.log('updateShop**num', num);
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.updateShop,
        method: 'PUT',
        data: {
          good_id: this.data.good.id,
          unitType: this.data.goodUnitType,
          priceType: this.data.goodPriceType,
          user_id: 2,
          num,
          value
        }
      });
      console.log('updateShop', data);
      wx.hideLoading();
    } catch(e) {
      wx.hideLoading();
      console.log('updateShop报错', e);
    }
  },
  // 删除单个购物车
  async removeShop() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.removeShop,
        method: 'DELETE',
        data: {
          good_id: this.data.good.id,
          unitType: this.data.goodUnitType,
          priceType: this.data.goodPriceType,
          user_id: 2
        }
      });
      console.log('removeShop', data);
      wx.hideLoading();
    } catch(e) {
      wx.hideLoading();
      console.log('removeShop报错', e);
    }
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  // 滚动联动
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + i);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight; 
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    // console.log('list', list)
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (i - 1) * 50,
          TabCur: i
        })
        return false
      }
    }
  },
  // 打开弹窗
  showSpace(e) {
    const data = e.currentTarget.dataset;
    const { item } = data;
    console.log(item);
    const { id } = item;
    const todu = this.data.shopList.find(item => (item.good_id === id && Number(item.unitType) === 1));
    console.log('todu', todu);
    if (todu) { // 购物车中存在
      this.setData({
        visible: true,
        good: item,
        goodNum: Number(todu.num),
        goodUnitType: Number(todu.unitType),
        goodPriceType: Number(todu.priceType),
        showPrice: Number(todu.priceType) === 2
      });
    } else {
      this.setData({
        visible: true,
        good: item,
        goodNum: 0,
        goodUnitType: 1,
        goodPriceType: 1,
        showPrice: false
      });
    }
  },
  // 规格弹窗关闭
  onClose() {
    this.setData({ visible: false });
  },
  // 单选
  switchType(e) {
    const data = e.currentTarget.dataset;
    const { key, value } = data;
    if (this.data[key] === value) {
      return;
    }
    console.log(data);
    if (key === 'goodPriceType' && this.data.goodNum > 0) { // 切换价格并且购物车中存在
      const index = this.data.shopList.findIndex(item => (
        (item.good_id === this.data.good.id) && (Number(item.unitType) === this.data.goodUnitType) && (Number(item.priceType) === this.data.goodPriceType)
      ));
      const shopList = this.data.shopList;
      shopList[index].priceType = value;
      this.setData({ shopList });
      console.log('shopList', shopList)
      this.updateShop(this.goodNum, value);
    }
    this.setData({ [key]: value });
    if (key === 'goodUnitType') { // 切换规格时去查询购物车
      const todu = this.data.shopList.find(item => (item.good_id === this.data.good.id && Number(item.unitType) === value));
      console.log('todu', todu)
      if (todu) {
        this.setData({
          goodNum: Number(todu.num),
          goodPriceType:  Number(todu.priceType),
          showPrice: Number(todu.priceType) === 2
        });
      } else {
        this.setData({ goodNum: 0 })
      }
    }
  },
  // 价格开关
  switchChange(e) {
    const value = e.detail.value;
    this.setData({ showPrice: value });
  },
  // 数量变化
  shopChange(e) {
    console.log(e);
    const num = this.data.goodNum;
    const { value } = e.detail;
    const countInfo = this.data.countInfo;
    if (countInfo[this.data.good.id]) {
      countInfo[this.data.good.id] += (value - num);
    } else {
      countInfo[this.data.good.id] = value;
    }
    this.setData({
      countInfo,
      goodNum: value
    });
    console.log('countInfo-shopChange', countInfo)
    this.editShop(value);
  },
  editShop(val) { // 修改购物车
    console.log('editShop', val);
    const index = this.data.shopList.findIndex(item => (
      (item.good_id === this.data.good.id) && (Number(item.unitType) === this.data.goodUnitType) && (Number(item.priceType) === this.data.goodPriceType)
    ));
    console.log('index', index);
    if (index > -1) { // 存在，修改数量
      if (val === 0) { // 移除购物车
        const shopList = this.data.shopList;
        shopList.splice(index, 1)
        this.setData({ shopList });
        this.removeShop();
      } else {
        const shopList = this.data.shopList;
        shopList[index].num = val;
        this.setData({ shopList });
        console.log('shopList', shopList)
        this.updateShop(val);
      }
    } else { // 不存在新增
      this.setData({
        shopList: [...this.data.shopList, {
          good_id: this.data.good.id,
          num: val,
          unitType: this.data.goodUnitType,
          priceType: this.data.goodPriceType
        }]
      })
      this.addShop();
    }
  },
})