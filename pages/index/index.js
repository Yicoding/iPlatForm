const app = getApp();
const config = require('../../config');
const { convertAll } = require('../../utils/util')

const { ajax } = require('../../utils/ajax');

Page({
  data: {
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
    userInfo: {},
    shopNum: 0,
    totalPrice: 0,
    avatar: 'https://qcloudtest-1257454171.cos.ap-guangzhou.myqcloud.com/present/1574164351806-FFphnQmq.jpg',
    isprvent: false,
    words: [],
    cities: [],
    scrollTop: 0,
    showPop: false,
    checked: false
  },
  onLoad() {
    console.log('app.globalData.userInfo**', app.globalData.userInfo)
    this.setData({ userInfo: app.globalData.userInfo });
    try {
      const data = wx.getStorageSync('checked');
      console.log('checked', data);
      if (data) {
        this.setData({ checked: data });
      }
    } catch (e) {
      console.log('checked报错', e);
    }
  },
  onShow() {
    if (this.data.isprvent) {
      this.setData({ isprvent: false });
      return;
    }
    if (app.globalData.showItem) {
      app.globalData.showItem = false;
      console.log('goodItem', {
        currentTarget: {
          dataset: {
            data: app.globalData.goodItem
          }
        }
      })
      this.showSpace({
        currentTarget: {
          dataset: {
            item: app.globalData.goodItem
          }
        }
      });
    }
    this.getShoplist();
    if (this.data.checked) {
      this.getGoodsList();
    } else {
      this.getGoodsByCompany();
    }
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    this.getShoplist();
    if (this.data.checked) {
      this.getGoodsList();
    } else {
      this.getGoodsByCompany();
    }
  },
  // 按公司查找所有商品类型+类型下的商品列表
  async getGoodsByCompany() {
    this.timee && clearTimeout(this.timee);
    this.timee = setTimeout(() => {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }, 350);
    try {
      const { data } = await ajax({
        url: config.service.getGoodsByCompany,
        data: {
          company_id: this.data.userInfo.company_id,
          role: this.data.userInfo.role_name
        }
      });
      if (JSON.stringify(data) === JSON.stringify(this.data.list)) {
        return console.log('不需要重新渲染list')
      }
      console.log('getGoodsByCompany', data);
      this.setData({
        list: data,
        listCur: data[0],
        load: true
      })
    } catch (e) {
      console.log('getGoodsByCompany报错', e);
    } finally {
      wx.stopPullDownRefresh();
      wx.hideLoading();
      this.timee && clearTimeout(this.timee);
      this.timee = null;
    }
  },
  // 按公司查找所有商品
  async getGoodsList() {
    this.timee && clearTimeout(this.timee);
    this.timee = setTimeout(() => {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }, 350);
    try {
      const { data } = await ajax({
        url: config.service.getGoodsList,
        data: {
          company_id: this.data.userInfo.company_id,
          pageSize: 99999
        }
      });
      console.log('getGoodsList', data.data);
      const storeCity = new Array();
      const words = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      words.forEach((item, index) => {
        storeCity[index] = {
          key: item,
          list: []
        }
      });
      const cities = data.data.map(item => {
        return Object.assign({}, {
          pinyin: convertAll(item.name)
        }, item);
      });
      console.log('cities', cities);
      cities.forEach(item => {
        let firstName = item.pinyin.substring(0, 1);
        let index = words.indexOf(firstName);
        storeCity[index].list.push(Object.assign({}, {
          key: firstName
        }, item));
      });
      if (JSON.stringify(storeCity) === JSON.stringify(this.data.cities)) {
        return console.log('不需要重新渲染list')
      }
      console.log('storeCity', storeCity);
      const wordList = words.filter((item, index) => storeCity[index].list.length > 0);
      const goodList = storeCity.filter(item => item.list.length > 0);
      this.setData({
        words: wordList,
        cities: goodList
      });
    } catch (e) {
      console.log('getGoodsList报错', e);
    } finally {
      wx.stopPullDownRefresh();
      wx.hideLoading();
      this.timee && clearTimeout(this.timee);
      this.timee = null;
    }
  },
  // 查询购物车列表
  async getShoplist() {
    try {
      const { data } = await ajax({
        url: config.service.getShoplist,
        data: {
          user_id: this.data.userInfo.id
        }
      });
      const countInfo = {};
      let shopNum = 0;
      data.forEach(item => {
        if (countInfo[item.good_id]) {
          countInfo[item.good_id] += Number(item.num);
        } else {
          countInfo[item.good_id] = Number(item.num);
        }
        shopNum += Number(item.num);
      });
      const totalPrice = data.reduce((total, item) => {
        const currentPrice = item.unitType === 1 ? (
          item.priceType === 1 ? item.num * item.sellSingle : item.priceType === 2 ? item.num * item.midSingle : item.num * item.writePrice
        ) : (
            item.priceType === 1 ? item.num * item.sellAll : item.priceType === 2 ? item.num * item.midAll : item.num * item.writePrice
          );
        return total + currentPrice;
      }, 0);
      console.log('getShoplist', data, countInfo, shopNum, totalPrice);
      this.setData({
        shopList: data,
        countInfo,
        shopNum,
        totalPrice
      });
    } catch (e) {
      console.log('getShoplist报错', e);
    }
  },
  // 新增购物车
  async addShop(goodPriceType = null, writePrice = null) {
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
            writePrice,
            midSingle: this.data.good.midSingle,
            midAll: this.data.good.midAll,
            sellSingle: this.data.good.sellSingle,
            sellAll: this.data.good.sellAll,
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
        this.setData({
          totalPrice: Number(this.data.totalPrice) + Number((this.data.goodUnitType === 1 ? (
            this.data.goodPriceType === 1 ? this.data.good.sellSingle : this.data.goodPriceType === 2 ? this.data.good.midSingle : writePrice
          ) : (
              this.data.goodPriceType === 1 ? this.data.good.sellAll : this.data.goodPriceType === 2 ? this.data.good.midAll : writePrice
            )))
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
  async updateShop(num, value = null, writePrice = null, key = null) {
    console.log('updateShop**num', num, value, this.data.goodUnitType);
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
      if (value) { // 价格切换
        // this.setData({ goodPriceType: value });
        const index = this.data.shopList.findIndex(item => (
          (item.good_id === this.data.good.id) && (Number(item.unitType) === this.data.goodUnitType)
        ));
        const shopList = this.data.shopList;
        shopList[index].priceType = value;
        this.setData({ shopList });
        const todu = this.data.todu;

        if (num - this.data.goodNum) { // 数量变化
          this.setData({
            totalPrice: Number(this.data.totalPrice) + Number((num - this.data.goodNum) * (this.data.goodUnitType === 1 ? (
              this.data.goodPriceType === 1 ? this.data.good.sellSingle : this.data.goodPriceType === 2 ? this.data.good.midSingle : writePrice
            ) : (
                this.data.goodPriceType === 1 ? this.data.good.sellAll : this.data.goodPriceType === 2 ? this.data.good.midAll : writePrice
              )))
          });
        } else { // 价格切换
          const newPrice = value === 1 ?
            this.data.goodUnitType === 1 ? todu.sellSingle : todu.sellAll :
            value === 2 ? this.data.goodUnitType === 1 ? todu.midSingle : todu.midAll : writePrice;
          const oldPrice = this.data.goodPriceType === 1 ?
            this.data.goodUnitType === 1 ? todu.sellSingle : todu.sellAll :
            this.data.goodPriceType === 2 ? this.data.goodUnitType === 1 ? todu.midSingle : todu.midAll : todu.writePrice;
          console.log('价格切换', value, this.data.goodPriceType, newPrice, oldPrice)
          this.setData({
            totalPrice: Number(this.data.totalPrice) + Number(num * (newPrice - oldPrice))
          });
        }
        if (key) {
          this.setData({ [key]: value });
        }
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
        method: 'PUT',
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
    const { item } = e.currentTarget.dataset;
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
      this.setData({
        shopNum: this.data.shopNum + 1
      });
    } else {
      this.updateShop(this.data.goodNum, 3, val, 'goodPriceType');
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
      this.updateShop(this.data.goodNum, value, null, 'goodPriceType');
    }
    if ((key === 'goodPriceType' && value !== 3 && this.data.goodNum === 0) || key === 'goodUnitType') {
      this.setData({ [key]: value });
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
    }
    // else {
    //   this.setData({ [key]: value });
    // }
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
  // 自定义新增
  shopChangeAdd() {
    const value = 1;
    const num = this.data.goodNum;
    const countInfo = this.data.countInfo;
    let shopNum = this.data.shopNum;
    if (countInfo[this.data.good.id]) {
      countInfo[this.data.good.id] += (value - num);
      shopNum += (value - num);
    } else {
      countInfo[this.data.good.id] = value;
      shopNum += value;
    }
    this.setData({
      countInfo,
      shopNum
    });
    console.log('countInfo-shopChange', countInfo)
    this.editShop(value);
  },
  // 数量输入框失焦
  shopBlur(e) {
    console.log(e);
    const num = this.data.goodNum;
    let { value } = e.detail;
    if (value == num) {
      return;
    }
    if (!value) {
      value = 1;
    }
    value = Number(value);
    if (value > 9999) {
      wx.showToast({
        title: '数量不能超过9999',
        icon: 'none'
      });
      value = 9999;
    }
    const countInfo = this.data.countInfo;
    let shopNum = this.data.shopNum;
    if (countInfo[this.data.good.id]) {
      countInfo[this.data.good.id] += (value - num);
      shopNum += (value - num);
    } else {
      countInfo[this.data.good.id] = value;
      shopNum += value;
    }
    this.setData({
      countInfo,
      shopNum
    });
    console.log('countInfo-shopChange', countInfo)
    this.editShop(value);
  },
  // 数量变化
  shopChange(e) {
    console.log(e);
    const num = this.data.goodNum;
    const { type } = e;
    const value = type === 'plus' ? num + 1 : num - 1;
    const countInfo = this.data.countInfo;
    let shopNum = this.data.shopNum;
    if (countInfo[this.data.good.id]) {
      countInfo[this.data.good.id] += (value - num);
      shopNum += (value - num);
    } else {
      countInfo[this.data.good.id] = value;
      shopNum += value;
    }
    this.setData({
      countInfo,
      shopNum
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
        const todu = shopList[index];
        // return console.log('todu***', todu, this.data.totalPrice, this.data.goodNum);
        // 计算总价
        this.setData({
          totalPrice: this.data.totalPrice - this.data.goodNum * (todu.unitType === 1 ? (
            todu.priceType === 1 ? todu.sellSingle : todu.priceType === 2 ? todu.midSingle : todu.writePrice
          ) : (
              todu.priceType === 1 ? todu.sellAll : todu.priceType === 2 ? todu.midAll : todu.writePrice
            ))
        });
        shopList.splice(index, 1)
        this.setData({ shopList });
        this.removeShop();
      } else {
        const shopList = this.data.shopList;
        shopList[index].num = val;
        this.setData({ shopList });
        console.log('shopList', shopList)
        this.updateShop(val);
        this.setData({
          totalPrice: Number(this.data.totalPrice) + Number((val - this.data.goodNum) * (this.data.goodUnitType === 1 ? (
            this.data.goodPriceType === 1 ? this.data.good.sellSingle : this.data.goodPriceType === 2 ? this.data.good.midSingle : this.data.todu.writePrice
          ) : (
              this.data.goodPriceType === 1 ? this.data.good.sellAll : this.data.goodPriceType === 2 ? this.data.good.midAll : this.data.todu.writePrice
            )))
        });
      }
    } else { // 不存在新增
      this.setData({
        shopList: [...this.data.shopList, {
          good_id: this.data.good.id,
          num: val,
          unitType: this.data.goodUnitType,
          priceType: this.data.goodPriceType,
          midSingle: this.data.good.midSingle,
          midAll: this.data.good.midAll,
          sellSingle: this.data.good.sellSingle,
          sellAll: this.data.good.sellAll,
          writePrice: this.data.todu.writePrice
        }]
      })
      this.setData({
        totalPrice: Number(this.data.totalPrice) + Number((this.data.goodUnitType === 1 ? (
          this.data.goodPriceType === 1 ? this.data.good.sellSingle : this.data.goodPriceType === 2 ? this.data.good.midSingle : this.data.todu.writePrice
        ) : (
            this.data.goodPriceType === 1 ? this.data.good.sellAll : this.data.goodPriceType === 2 ? this.data.good.midAll : this.data.todu.writePrice
          )))
      });
      this.addShop(null, this.data.todu.writePrice);
    }
    this.setData({ goodNum: val });
  },
  // 查看购物车
  onSubmit() {
    wx.switchTab({
      url: '../shop/index'
    });
  },
  // 跳转到搜索页面
  linkSearch() {
    wx.navigateTo({
      url: '../search/index'
    });
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
  },
  // 查看商品详情
  onProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../good-detail/index?id=${id}&out=${true}`
    });
  },
  onPageScroll(event) {
    this.setData({
      scrollTop: event.scrollTop
    });
  },
  // 关闭左侧弹出层
  onClosePop() {
    this.setData({ showPop: !this.data.showPop });
  },
  // 开关
  onChangeSwitch({ detail }) {
    this.setData({ checked: detail });
    // 存储
    wx.setStorage({
      key: 'checked',
      data: detail
    });
    if (detail) {
      this.getGoodsList();
    } else {
      this.getGoodsByCompany();
    }
  }
})