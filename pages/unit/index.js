//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    userInfo: {},
    dataList: [],
    nameList: [],
    isShow: false,
    name: '',
    focus: false
  },
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo });
    this.getUnitList();
  },
  // 监听用户下拉动作
  onPullDownRefresh() {
    this.getUnitList();
  },
  async getUnitList() {
    this.timee = setTimeout(() => {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }, 350);
    try {
      const { userInfo } = this.data;
      const { data } = await ajax({
        url: config.service.getUnitList,
        data: { company_id: userInfo.company_id }
      });
      console.log('getUnitList', data);
      this.setData({
        dataList: data,
        nameList: data
      });
    } catch (e) {
      console.log('getUnitList报错', e);
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
  // 点击编辑按钮
  editBtn(e) {
    const { index } = e.currentTarget.dataset;
    const dataList = JSON.parse(JSON.stringify(this.data.dataList));
    dataList[index].edit = true;
    this.setData({ dataList });
  },
  // 输入框
  onChange(e) {
    console.log(e)
    const { index } = e.currentTarget.dataset;
    const { detail } = e;
    const nameList = JSON.parse(JSON.stringify(this.data.nameList));
    nameList[index].name = detail.trim();
    this.setData({ nameList });
  },
  // 失去焦点
  onBlur(e) {
    const { index } = e.currentTarget.dataset;
    const dataList = JSON.parse(JSON.stringify(this.data.dataList));
    dataList[index].edit = false;
    this.setData({ dataList });
  },
  // 保存
  async saveBtn(e) {
    const { id, index } = e.currentTarget.dataset;
    const { nameList } = this.data;
    const name = nameList[index].name;
    if (name === this.data.dataList[index].name) {
      const dataList = JSON.parse(JSON.stringify(this.data.dataList));
      dataList[index].edit = false;
      this.setData({ dataList });
      return;
    }
    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      const { data } = await ajax({
        url: config.service.updateUnit,
        method: 'PUT',
        data: {
          id,
          name
        }
      });
      console.log('updateUnit', data);
      const dataList = JSON.parse(JSON.stringify(this.data.dataList));
      dataList[index].name = name;
      dataList[index].edit = false;
      this.setData({ dataList });
    } catch (e) {
      console.log('updateUnit报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 新增按钮
  addBtn() {
    this.setData({
      isShow: true,
      name: ''
    });
    setTimeout(() => {
      this.setData({ focus: true });
    }, 300);
  },
  // 取消
  onClose() {
    this.setData({
      isShow: false,
      name: '',
      focus: false
    });
  },
  // 输入
  onChangeName(e) {
    const { detail } = e;
    console.log('onChangeName', detail);
    this.setData({ name: detail.trim() })
  },
  // 确认
  async addType() {
    try {
      const { name } = this.data;
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      const { userInfo } = this.data;
      const { data } = await ajax({
        url: config.service.addUnit,
        method: 'POST',
        data: {
          name,
          company_id: userInfo.company_id
        }
      });
      console.log('addUnit', data);
      this.getUnitList();
      this.setData({
        isShow: false,
        name: '',
        focus: false
      });
      setTimeout(() => {
        wx.showToast({
          title: '新增成功',
          icon: 'none'
        })
      }, 30)
    } catch (e) {
      console.log('addGoodsType报错', e);
    } finally {
      wx.hideLoading();
    }
  },
  // 删除按钮
  remove(e) {
    const { item, index } = e.currentTarget.dataset;
    wx.showModal({
      title: `确定删除 ${item.name} 吗？`,
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          this.removeUnit(item.id, index);
        }
      }
    })
  },
  // 删除单个
  async removeUnit(id, index) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { data } = await ajax({
        url: config.service.removeUnit,
        method: 'DELETE',
        data: {
          id
        }
      });
      console.log('removeUnit', data);
      const dataList = JSON.parse(JSON.stringify(this.data.dataList));
      dataList.splice(index, 1);
      this.setData({
        dataList,
        nameList: dataList
      });
    } catch (e) {
      console.log('removeUnit报错', e);
    } finally {
      wx.hideLoading();
    }
  },
})
