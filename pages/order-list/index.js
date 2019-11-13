//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

import { $wuxCalendar } from '../../miniprogram_npm/wux-weapp/index';

Page({
  data: {
    active: 0,
    userInfo: {},
    state: '',
    orderList: [],
    value: [],
    hasMore: false,
    loading: true,
    info: ''
  },
  pageIndex: 0,
  pageSize: 10,
  // 页面出现
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo });
  },
  onShow() {
    this.getOrderList();
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    this.pageIndex = 0;
    this.getOrderList();
  },
  // 监听用户上拉触底事件
  onReachBottom(e) {
    console.log('到底了');
    const { loading, hasMore } = this.data;
    if (loading || !hasMore) {
      return;
    }
    this.pageIndex += 1;
    this.getOrderList();
  },
  // 获取订单列表
  async getOrderList() {
    try {
      this.setData({
        loading: true,
        nfo: '数据加载中...'
      });
      const { userInfo, value, state } = this.data;
      const info = {
        company_id: userInfo.company_id,
        date: value[0] || '',
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        sort: 'DESC',
        state
      };
      if (this.data.userInfo.role_name === 'admin') { // 管理员查看自己公司的订单列表
        info.role = userInfo.role_name === 'admin'
      } else {
        info.createUser = userInfo.id
      }
      const { data } = await ajax({
        url: config.service.getOrderList,
        data: info
      });
      console.log('getOrderList', data);
      if (this.pageIndex === 0) { // 初始化请求
        this.setData({ orderList: data.data });
      } else {
        this.setData({ orderList: [...this.data.orderList, ...data.data] });
      }
      this.setData({ hasMore: data.data.length === this.pageSize });
    } catch (e) {
      console.log('getOrderList报错', e);
    } finally {
      wx.stopPullDownRefresh();
      this.setData({ loading: false });
    }
  },
  // tab切换
  changeTabs(e) {
    console.log(e)
    const { index } = e.detail;
    if (index === 0) {
      this.setData({ state: '' });
    } else {
      this.setData({ state: index });
    }
    wx.pageScrollTo({
      scrollTop: 0,
      success: () => {
        this.pageIndex = 0;
        this.getOrderList();
      }
    });
  },
  // 打开日历
  openCalendar() {
    $wuxCalendar().open({
      value: this.data.value,
      onChange: (values, displayValues) => {
        if (displayValues[0] === this.data.value[0]) {
          return;
        }
        console.log('onChange', values, displayValues)
        this.setData({
          value: displayValues
        });
        this.goPageTop();
      },
    })
  },
  // 清除日历
  clearDate() {
    this.setData({ value: [] });
    this.goPageTop();
  },
  // 回到顶部
  goPageTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      success: () => {
        this.pageIndex = 0;
        this.getOrderList();
      }
    });
  },
  // 跳转到订单详情
  linkDetail(e) {
    console.log(e);
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../order-detail/index?id=${id}`
    })
  }
})
