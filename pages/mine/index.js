//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');
const man = '/images/icon/user-man.png';
const woman = '/images/icon/user-woman.png';

Page({
  data: {
    userInfo: {},
    hasMore: false,
    loading: true,
    goodList: [],
    avatar: '',
    grids: [
      { image: 'user', text: '成员管理', url: 'user' },
      { image: 'cart', text: '商品管理', url: 'good' },
      { image: 'order', text: '字典管理', url: 'map' },
      { image: 'setting', text: '设置', color: '#34BFA3', url: 'setting' },
    ],
    gridsStaff: [
      { image: 'setting', text: '设置', color: '#34BFA3', url: 'setting' },
    ]
  },
  pageIndex: 0,
  pageSize: 10,
  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo,
      avatar: app.globalData.userInfo.sex === 'man' ? man : woman
    });
    this.getGoodsList();
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    this.pageIndex = 0;
    this.getGoodsList();
  },
  // 监听用户上拉触底事件
  onReachBottom(e) {
    console.log('到底了');
    const { loading, hasMore } = this.data;
    if (loading || !hasMore) {
      return;
    }
    this.pageIndex += 1;
    this.getGoodsList();
  },
  // 查看公司商品
  async getGoodsList() {
    try {
      this.setData({ loading: true });
      const { userInfo } = this.data;
      const { pageIndex, pageSize } = this;
      const { data } = await ajax({
        url: config.service.getGoodsList,
        data: {
          company_id: userInfo.company_id,
          pageIndex,
          pageSize
        }
      });
      console.log('getGoodsList', data.data);
      const goodList = data.data.map(item => {
        return {
          image: item.coverImg,
          title: item.name,
          describe: item.desc,
          count: item.sellSingle
        }
      })
      if (this.pageIndex === 0) { // 初始化请求
        console.log('pageIndex')
        this.setData({ goodList });
      } else {
        this.setData({ goodList: [...this.data.goodList, ...goodList] });
      }
      this.setData({ hasMore: goodList.length === this.pageSize });
      wx.lin.renderWaterFlow(this.data.goodList, true, () => {
        console.log('渲染成功')
      })
    } catch (e) {
      console.log('getGoodsList报错', e);
    } finally {
      wx.stopPullDownRefresh();
      this.setData({ loading: false });
    }
  },
  // 宫格点击
  gridTap(e) {
    console.log(e);
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../${url}/index`
    });
  }
})
