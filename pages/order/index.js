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
    msg: {
      icon: '/images/order-empty.png',
      title: '您暂时还没有订单哦～'
    },
    touchS: [0, 0],
    touchE: [0, 0],
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
      this.setData({ loading: true });
      if (this.pageIndex === 0) {
        this.timee = setTimeout(() => {
          wx.showLoading({
            title: '加载中...',
            mask: true
          });
        }, 300);
      }
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
      const orderList = data.data;
      console.log('getOrderList', data);
      orderList.forEach(item => {
        if (item.state !== 4) {
          item.steps = [
            {
              text: `已创建(${item.createUser.name})`,
              desc: item.createTime.slice(0, -3)
            },
            {
              text: item.state === 1 ? '待付款' : `已付款(${item.payUser.name})`,
              desc: item.payTime && item.payTime.slice(0, -3) || ''
            },
            {
              text: item.state === 3 ? `已发货(${item.finishUser.name})` : '待发货',
              desc: item.finishTime && item.finishTime.slice(0, -3) || ''
            }
          ];
          item.active = item.state - 1;
        }
      });
      if (this.pageIndex === 0) { // 初始化请求
        this.setData({ orderList: orderList });
      } else {
        this.setData({ orderList: [...this.data.orderList, ...orderList] });
      }
      this.setData({ hasMore: orderList.length >= this.pageSize - 1 });
    } catch (e) {
      console.log('getOrderList报错', e);
    } finally {
      wx.stopPullDownRefresh();
      this.setData({ loading: false });
      this.pageIndex === 0 && wx.hideLoading();
      this.timee && clearTimeout(this.timee);
      this.timee = null;
    }
  },
  // tab切换
  changeTabs(e) {
    console.log(e)
    const { index } = e.detail;
    this.delActive(index);
  },
  // 打开日历
  openCalendar() {
    const now = new Date();
    const maxDate = now.getTime();
    $wuxCalendar().open({
      value: this.data.value,
      maxDate,
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
  },
  // 触摸事件
  touchStart: function (e) {
    this.data.touchS = [];
    this.data.touchE = [];
    let sx = e.touches[0].pageX;
    let sy = e.touches[0].pageY;
    this.data.touchS = [sx, sy];
  },
  touchMove: function (e) {
    let sx = e.touches[0].pageX;
    let sy = e.touches[0].pageY;
    this.data.touchE = [sx, sy];
  },
  touchEnd: function (e) {
    let start = this.data.touchS
    let end = this.data.touchE
    console.log(start)
    console.log(end)
    if (start[0] < end[0] - 80) {
      console.log('右滑', this.data.active);
      if (this.data.active === 0) {
        return;
      }
      this.delActive(this.data.active - 1);
    } else if (start[0] > end[0] + 80) {
      console.log('左滑', this.data.active);
      if (this.data.active === 4) {
        return;
      }
      this.delActive(this.data.active + 1);
    } else {
      console.log('静止');
    }
  },
  delActive(active) {
    if (active === 0) {
      this.setData({ state: '' });
    } else {
      this.setData({ state: this.data.userInfo.companyType !== 1 ? active + 2 : active });
    }
    this.setData({ active }, () => {
      wx.pageScrollTo({
        scrollTop: 0,
        success: () => {
          this.pageIndex = 0;
          this.getOrderList();
        }
      });
    });
  },
})
