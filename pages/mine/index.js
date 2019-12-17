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
      { image: 'cart', text: '商品管理', url: 'good', color: '#34BFA3' },
      { image: 'order', text: '系统管理', url: 'map' },
      { image: 'setting', text: '设置', color: '#34BFA3', url: 'setting' },
    ],
    gridsStaff: [
      { image: 'user', text: '成员列表', url: 'user' },
      { image: 'cart', text: '商品列表', url: 'good', color: '#34BFA3' },
      { image: 'order', text: '系统列表', url: 'map' },
      { image: 'setting', text: '设置', color: '#34BFA3', url: 'setting' },
    ],
    showTop: false,
  },
  pageIndex: 0,
  pageSize: 10,
  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo,
      avatar: app.globalData.userInfo.avatar || (app.globalData.userInfo.sex === 'man' ? man : woman)
    });
    this.getGoodsList();
  },
  onShow() {
    if (app.globalData.editBySelf) {
      console.log('app.globalData.userInfo', app.globalData.userInfo)
      app.globalData.editBySelf = false;
      this.setData({
        userInfo: app.globalData.userInfo,
        avatar: app.globalData.userInfo.avatar || (app.globalData.userInfo.sex === 'man' ? man : woman)
      });
    }
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
          id: item.id,
          image: item.coverImg,
          title: item.name,
          describe: item.desc,
          count: item.sellSingle
        }
      })
      this.setData({ goodList });
      this.setData({ hasMore: goodList.length === this.pageSize });
      wx.lin.renderWaterFlow(this.data.goodList, pageIndex === 0, () => {
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
  },
  // 查看图片
  viewImg(e) {
    const item = app.globalData.userInfo.avatar;
    if (!item) {
      return;
    }
    const urls = [item]
    wx.previewImage({
      current: item, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    });
  },
  // 跳转到用户详情
  linkUser() {
    const { id } = this.data.userInfo;
    wx.navigateTo({
      url: `../user-detail/index?id=${id}`
    });
  },
  // 回到顶部
  toTop() {
    wx.pageScrollTo({ scrollTop: 0, duration: 500 });
  },
  // 监听页面滚动距离
  onPageScroll: function (e) {
    console.log(e.scrollTop);
    if (e.scrollTop > 1000) {
      this.setData({ showTop: true });
    } else {
      this.setData({ showTop: false });
    }
  }
})
