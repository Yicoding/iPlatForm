const app = getApp();
const config = require('../../config');

const { ajax } = require('../../utils/ajax');

Page({
  data: {
    keyword: [],
    min: 7,
    max: 9999,
    num: 7,
    goodList: [],
    userInfo: {},
    msg: {
      icon: '/images/data-empty.png',
      title: '抱歉，没有搜索到商品哦～'
    },
    value: '',
    loading: false,
    isDelete: false,
  },
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo });
    this.getKeyWord();
  },
  onShow() {
  },
  onReady() {
  },
  // 去搜索
  search(e) {
    console.log('search', e);
    const { detail } = e;
    this.setData({ value: detail });
    if (detail) {
      this.getGoodsList(detail);
      const keyword = JSON.parse(JSON.stringify(this.data.keyword));
      if (keyword.includes(detail)) {
        return;
      }
      keyword.push(detail);
      this.setData({ keyword });
      wx.setStorage({
        key: 'keyword',
        data: keyword
      });
    }
  },
  // 搜索商品
  async getGoodsList(name) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.setData({ loading: true });
    try {
      const { userInfo } = this.data;
      const { data } = await ajax({
        url: config.service.getGoodsList,
        data: {
          name,
          company_id: userInfo.company_id,
          pageSize: 9999
        }
      });
      console.log('getGoodsList', data);
      this.setData({ goodList: data.data });
    } catch (e) {
      console.log('getGoodsList报错', e);
    } finally{
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },
  // 获取关键词
  getKeyWord() {
    wx.getStorage({
      key: 'keyword',
      success: ({ data }) => {
        console.log('data', data);
        this.setData({ keyword: data });
      },
      fail: (err) => {
        console.log('err', err);
      }
    });
  },
  // 设置显示隐藏
  setNum(e) {
    const { num } = e.currentTarget.dataset;
    this.setData({ num });
  },
  // 取消
  backRemove() {
    this.setData({ isDelete: false });
  },
  // 删除切换
  delete() {
    const { isDelete } = this.data;
    this.setData({ isDelete: !isDelete });
  },
  // 全部删除
  removeAll() {
    wx.showModal({
      title: '确定要全部清空搜索历史吗？',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.removeFun();
        }
      }
    })
  },
  // 清空
  removeFun() {
    wx.removeStorage({
      key: 'keyword',
      success: () => {
        this.setData({ keyword: [] });
      },
      fail: (err) => {
        console.log('err', err);
      }
    })
  },
  // 删除单个
  remove(e) {
    console.log('remove', e);
    const { index } = e.currentTarget.dataset;
    const keyword = JSON.parse(JSON.stringify(this.data.keyword));
    keyword.splice(index, 1);
    this.setData({ keyword });
    wx.setStorage({
      key: 'keyword',
      data: keyword
    });
  },
  // 点击单个历史记录
  btnSearch(e) {
    if (this.data.isDelete) {
      return;
    }
    console.log('labelSearch', e);
    const { value } = e.currentTarget.dataset;
    this.selectComponent("#search").setText(value);
  }
})