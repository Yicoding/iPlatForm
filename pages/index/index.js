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
    countInfo: {},
    writePrice: '',
    visible2: false,
    todu: {},
    userInfo: {}
  },
  onLoad() {
    console.log('app.globalData.userInfo**', app.globalData.userInfo)
    this.setData({ userInfo: app.globalData.userInfo });
    this.getGoodsByCompany();
  },
  onShow() {
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
          company_id: this.data.userInfo.company_id,
          role: this.data.userInfo.role_name
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
    } catch (e) {
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
          user_id: this.data.userInfo.id
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
    } catch (e) {
      console.log('getShoplist报错', e);
    }
  },
  // 新增购物车
  async addShop(goodPriceType=null, writePrice=null) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    const num = 1;
    try {
      const { data } = await ajax({
        url: config.service.addShop,
        method: 'POST',
        data: {
          good_id: this.data.good.id,
          unitType: this.data.goodUnitType,
          priceType: goodPriceType || this.data.goodPriceType,
          user_id: this.data.userInfo.id,
          num,
          writePrice: writePrice
        }
      });
      if (goodPriceType) {
        const countInfo = this.data.countInfo;
        if (countInfo[this.data.good.id]) {
          countInfo[this.data.good.id] += (num - this.data.goodNum);
        } else {
          countInfo[this.data.good.id] = num;
        }
        this.setData({
          goodNum: num,
          goodPriceType,
          shopList: [...this.data.shopList, {
            good_id: this.data.good.id,
            num,
            unitType: this.data.goodUnitType,
            priceType: goodPriceType,
            writePrice
          }],
          countInfo,
          todu: {
            good_id: this.data.good.id,
            num,
            unitType: this.data.goodUnitType,
            priceType: goodPriceType,
            writePrice
          }
        });
      }
      console.log('addShop', data);
      wx.hideLoading();
    } catch (e) {
      wx.hideLoading();
      console.log('addShop报错', e);
    }
  },
  // 修改单个购物车商品数量
  async updateShop(num, value = null, writePrice = null) {
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
          user_id: this.data.userInfo.id,
          num,
          value,
          writePrice
        }
      });
      if (value) {
        this.setData({ goodPriceType: value });
        const index = this.data.shopList.findIndex(item => (
          (item.good_id === this.data.good.id) && (Number(item.unitType) === this.data.goodUnitType)
        ));
        const shopList = this.data.shopList;
        shopList[index].priceType = value;
        this.setData({ shopList });
        const todu = this.data.todu;
        if (writePrice) {
          todu.writePrice = writePrice;
        }
        this.setData({ todu });
      }
      console.log('updateShop', data);
      wx.hideLoading();
    } catch (e) {
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
          user_id: this.data.userInfo.id
        }
      });
      console.log('removeShop', data);
      wx.hideLoading();
    } catch (e) {
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
        showPrice: Number(todu.priceType) === 2,
        todu,
        writePrice: todu.writePrice
      });
    } else {
      this.setData({
        todu: {},
        visible: true,
        good: item,
        goodNum: 0,
        goodUnitType: 1,
        goodPriceType: 1,
        showPrice: false,
        writePrice: ''
      });
    }
  },
  // 规格弹窗关闭
  onClose() {
    this.setData({ visible: false });
  },
  // 自定义价格弹窗关闭
  onClose2() {
    this.setData({
      visible2: false
    });
  },
  // 确认自定义价格
  onOk() {
    const val = this.data.writePrice.replace(/(^\s*)|(\s*$)/g, "");
    if (!val) {
      return wx.showToast({
        title: '价格不能为空',
        icon: 'none'
      })
    }
    const patten = /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g;
    if (!patten.test(val)) {
      return wx.showToast({
        title: '请输入数字',
        icon: 'none'
      })
    }
    this.setData({
      visible2: false
    });
    if (this.data.goodNum === 0) { // 新增
      this.addShop(3, val);
    } else {
      this.updateShop(this.data.goodNum, 3, val);
    }
  },
  // 输入框变化
  changePrice(e) {
    const { value } = e.detail;
    this.setData({ writePrice: value });
  },
  // 单选
  switchType(e) {
    const data = e.currentTarget.dataset;
    const { key, value } = data;
    if (this.data[key] === value && value !== 3) {
      return;
    }
    console.log(data);
    if (key === 'goodPriceType' && this.data.goodNum > 0 && value !== 3) { // 切换价格并且购物车中存在
      this.updateShop(this.data.goodNum, value);
    }
    if (value === 3) { // 自定义价格
      console.log('this.data.goodPriceType', this.data.goodPriceType)
      this.setData({ visible2: true });
      const todu = this.data.shopList.find(item => (item.good_id === this.data.good.id && Number(item.unitType) === this.data.goodUnitType));
      console.log('todu111', todu)
      if (todu) {
        this.setData({
          writePrice: todu.writePrice,
          todu
        });
      } else {
        this.setData({
          writePrice: '',
          todu: {}
        })
      }
    } else {
      this.setData({ [key]: value });
    }
    if (key === 'goodUnitType') { // 切换规格时去查询购物车
      const todu = this.data.shopList.find(item => (item.good_id === this.data.good.id && Number(item.unitType) === value));
      console.log('todu', todu)
      if (todu) {
        this.setData({
          goodNum: Number(todu.num),
          goodPriceType: Number(todu.priceType),
          showPrice: Number(todu.priceType) === 2,
          writePrice: todu.writePrice,
          todu
        });
      } else {
        this.setData({
          goodNum: 0,
          writePrice: '',
          todu: {},
          goodPriceType: 1
        })
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