//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    userList: [],
    avatar: 'https://qcloudtest-1257454171.cos.ap-guangzhou.myqcloud.com/present/1574164351806-FFphnQmq.jpg',
    msg: {
      icon: '/images/data-empty.png',
      title: '孤军奋战～'
    },
    loading: true,
    userInfo: {}
  },
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo });
    this.getUserList();
  },
  // 页面出现
  onShow() {
    if (app.globalData.isAlertGood) {
      this.getUserList();
      app.globalData.isAlertGood = false;
    }
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    this.getUserList();
  },
  // 获取购物车列表
  async getUserList() {
    this.timee = setTimeout(() => {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }, 350);
    try {
      const { userInfo } = this.data;
      const { data } = await ajax({
        url: config.service.getUserList,
        data: { company_id: userInfo.company_id }
      });
      console.log('getUserList', data);
      this.setData({ userList: data });
    } catch (e) {
      console.log('getUserList报错', e);
    } finally {
      wx.stopPullDownRefresh();
      if (this.timee) {
        clearTimeout(this.timee)
        this.timee = null;
      }
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },
  // 点击删除
  remove(e) {
    console.log(e)
    const { index, item } = e.currentTarget.dataset;
    wx.showModal({
      title: `确定删除 ${item.name} 吗？`,
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.removeUser(item.id, index);
        }
      }
    })
  },
  // 删除单个购物车
  async removeUser(id, index) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.removeUser,
        method: 'DELETE',
        data: {
          id
        }
      });
      console.log('removeUser', data);
      const userList = JSON.parse(JSON.stringify(this.data.userList));
      userList.splice(index, 1);
      this.setData({ userList });
    } catch (e) {
      console.log('removeShopById报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 修改用户
  editUser(e) {
    console.log(e);
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../user-edit/index?id=${id}`
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
  },
  // 跳转到用户详情
  linkUser(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../user-detail/index?id=${id}`
    });
  }
})
