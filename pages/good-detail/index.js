//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    userInfo: {},
    unitList: [],
    typeList: [],
    id: null,
    name: '',
    coverImg: 'https://qcloudtest-1257454171.cos.ap-guangzhou.myqcloud.com/present/1574164351806-FFphnQmq.jpg',
    unitSingle: '',
    unitAll: '',
    buySingle: '',
    buyAll: '',
    midSingle: '',
    midAll: '',
    sellSingle: '',
    sellAll: '',
    num: '',
    desc: '',
    origin: '',
    isIpx: app.globalData.isIpx,
    show: false,
    type: 'addShop',
    unitOne: {},
    unitDouble: {},
    goodUnitType: 1,
    goodPriceType: 1,
    showPrice: false,
    writePrice: '',
    todu: {},
    goodNum: 1,
    visible: false,
    shopList: [],
    isAdd: false,
    isShow: false,
  },
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo });
    try {
      const data = wx.getStorageSync('goodDetail');
      console.log('goodDetail', data);
      const { id, name, coverImg, unitOne, unitDouble, buySingle, buyAll, midSingle, midAll, sellSingle, sellAll, num, desc, origin } = data;
      const unitSingle = unitOne.id;
      const unitAll = unitDouble.id;
      this.setData({
        id, name, coverImg, unitOne, unitDouble, unitSingle, unitAll, buySingle, buyAll, midSingle, midAll, sellSingle, sellAll, num, desc, origin
      });
      this.getUnitList(id);
      this.getGoodsTypeList(id);
    } catch (e) {
      console.log('获取goodDetail缓存失败', e);
    }
  },
  onShow() {
    this.getShoplist();
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    let item = this.data.coverImg
    let urls = [item]
    wx.previewImage({
      current: item, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
    wx.stopPullDownRefresh()
  },
  // 获取购物车列表
  async getShoplist() {
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
    } catch (e) {
      console.log('查询购物车列表报错', e);
    }
  },
  // 查看单位列表
  async getUnitList(id) {
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
  // 查看类型列表
  async getGoodsTypeList(id) {
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
  // 查看购物车
  onClickIcon() {
    wx.navigateTo({ url: '../shop-inner/index' });
  },
  // 加入购物车/立即购买
  onClickButton(e) {
    console.log(e);
    const { type } = e.currentTarget.dataset;
    if (this.data.userInfo.companyType !== 1 && type === 'addShop') {
      return this.setData({ type }, () => {
        this.onConfirm();
      });
    }
    this.setData({
      show: true,
      type
    });
  },
  // 关闭弹窗
  onClose() {
    console.log('onClose');
    this.setData({ show: false });
  },
  // 单选
  switchType(e) {
    const data = e.currentTarget.dataset;
    const { key, value } = data;
    if (this.data[key] === value && value !== 3) {
      return;
    }
    console.log(data);
    if (key === 'goodPriceType' && value === 3) { // 自定义
      this.setData({ visible: true });
    } else {
      this.setData({ [key]: value });
    }
  },
  // 价格开关
  switchChange(e) {
    const value = e.detail.value;
    this.setData({ showPrice: value });
  },
  // 输入框变化
  changePrice(e) {
    const { value } = e.detail;
    this.setData({ writePrice: value });
  },
  // 自定义价格弹窗关闭
  onClose2() {
    this.setData({ visible: false });
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
      visible: false,
      goodPriceType: 3
    });
  },
  // 数量变化
  shopChange(e) {
    console.log(e);
    this.setData({ goodNum: e.detail });
  },
  // 确定
  onConfirm() {
    console.log('onConfirm');
    if (this.data.type === 'confirm') { // 立即购买
      const { buyAll, buySingle, coverImg, desc, id, midAll, midSingle, name, num, sellAll, sellSingle, writePrice, goodPriceType, goodUnitType, unitDouble, unitOne, goodNum } = this.data;
      wx.setStorage({
        key: 'buyList',
        data: [{
          buyAll,
          buySingle,
          coverImg,
          desc,
          good_id: id,
          midAll,
          midSingle,
          name,
          num: goodNum,
          priceType: goodPriceType,
          sellAll,
          sellSingle,
          unitAllName: unitDouble.name,
          unitDecimal: num,
          unitSingleName: unitOne.name,
          unitType: goodUnitType,
          writePrice,
        }],
        success: () => {
          this.setData({ show: false });
          wx.navigateTo({ url: `../order-confirm/index?buyNow=${true}` });
        }
      });
    } else { // 加入购物车
      this.confirmShop();
    }
  },
  // 加入购物车
  async confirmShop() {
    const { id, goodUnitType } = this.data;
    const index = this.data.shopList.findIndex(item => {
      return item.good_id === id && item.unitType === goodUnitType;
    });
    console.log('index', index);
    if (index > -1) { // 存在，修改购物车
      this.editShop(index);
    } else { // 不存在， 新增
      this.addShop();
    }
  },
  // 新增
  async addShop() {
    // wx.showLoading({
    //   title: '加载中...',
    //   mask: true
    // });
    try {
      const { id, goodNum, goodPriceType, goodUnitType, writePrice } = this.data;
      await ajax({
        url: config.service.addShop,
        method: 'POST',
        data: {
          user_id: this.data.userInfo.id,
          company_id: this.data.userInfo.company_id,
          good_id: id,
          num: goodNum,
          priceType: goodPriceType,
          unitType: goodUnitType,
          writePrice
        }
      });
      app.globalData.isUpdateShop = true;
      const shopList = this.data.shopList;
      shopList.push({
        good_id: id,
        num: goodNum,
        priceType: goodPriceType,
        unitType: goodUnitType
      });
      this.setData({
        show: false,
        shopList
      }, () => {
        setTimeout(() => {
          this.setData({ isAdd: true });
          setTimeout(() => {
            this.setData({ isAdd: false });
          }, 890);
        }, 300);
      });
    } catch (e) {
      console.log('添加购物车失败', e);
    } finally {
      // wx.hideLoading();
    }
  },
  // 修改购物车
  async editShop(index) {
    // wx.showLoading({
    //   title: '加载中...',
    //   mask: true
    // });
    try {
      const item = this.data.shopList[index];
      const { good_id, unitType, priceType, num } = item;
      const { goodNum, writePrice, goodPriceType } = this.data;
      console.log('item', item);
      const numTotal = Number(num) + Number(goodNum);
      await ajax({
        url: config.service.updateShop,
        method: 'PUT',
        data: {
          good_id,
          unitType,
          priceType,
          value: goodPriceType,
          user_id: this.data.userInfo.id,
          num: numTotal,
          writePrice
        }
      });
      app.globalData.isUpdateShop = true;
      const shopList = this.data.shopList;
      shopList[index].num = numTotal;
      this.setData({
        show: false,
        shopList
      }, () => {
        setTimeout(() => {
          this.setData({ isAdd: true });
          setTimeout(() => {
            this.setData({ isAdd: false });
          }, 890);
        }, 300);
      });
    } catch (e) {
      console.log('修改购物车失败', e);
    } finally {
      // wx.hideLoading();
    }
  },
  // 控制显隐
  setShow(e) {
    const value = e.detail.value;
    this.setData({ isShow: value });
  },
});
