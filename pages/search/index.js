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
    this.getGoodsList(detail);
  },
  // 搜索商品
  async getGoodsList(name) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
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
      this.setData({ goodList: data });
    } catch (e) {
      console.log('getGoodsList报错', e);
    } finally{
      wx.hideLoading();
    }
  },
  // 获取关键词
  getKeyWord() {
    wx.getStorage({
      key: 'keyword',
      success: ({ data }) => {
        console.log('data', data);
        const keyword = data.split(',');
        this.setData({ keyword });
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
  remove() {
    wx.showModal({
      title: '确定要清空搜索历史吗？',
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
})