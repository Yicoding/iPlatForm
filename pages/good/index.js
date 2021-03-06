const app = getApp();
const config = require('../../config');

const { ajax } = require('../../utils/ajax');

Page({
  data: {
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    load: true,
  },
  onLoad() {
    console.log('app.globalData.userInfo**', app.globalData.userInfo)
    this.setData({ userInfo: app.globalData.userInfo });
    this.getGoodsByCompany();
  },
  onShow() {
    if (app.globalData.isAlertGood) {
      this.getGoodsByCompany();
      app.globalData.isAlertGood = false;
    }
  },
  onReady() {
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    this.getGoodsByCompany();
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
  // 删除商品
  remove(e) {
    console.log(e);
    const { item, todu, index, i } = e.currentTarget.dataset;
    wx.showModal({
      title: `确定要删除${todu.name}吗`,
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.removeGoods(todu.id, index, i);
        }
      }
    })
  },
  // 删除单个商品
  async removeGoods(id, index, i) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.removeGoods,
        method: 'PUT',
        data: { id }
      });
      app.globalData.isUpdateGood = true;
      console.log('removeGoods', data);
      this.getGoodsByCompany();
    } catch (e) {
      console.log('removeGoods报错', e);
    } finally{
      wx.hideLoading();
    }
  },
  // 修改商品
  editGood(e) {
    console.log(e);
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../good-edit/index?id=${id}`
    });
  },

  // 跳转到搜索页面
  linkSearch() {
    wx.navigateTo({
      url: '../search/index'
    });
  },
  // 跳转到详情页面
  linkDetail(e) {
    console.log(e);
    const { item } = e.currentTarget.dataset;
    wx.setStorage({
      key: "goodDetail",
      data: item,
      success: (res)=> {
        wx.navigateTo({
          url: `../good-detail/index`
        });
      },
      fail: (err) => {
        console.log('首页跳转详情页设置缓存失败', err);
      }
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
  }
})