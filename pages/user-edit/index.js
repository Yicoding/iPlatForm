//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
var { uploadFile } = require('../../utils/upload');
const { ajax } = require('../../utils/ajax');

Page({
  data: {
    isIpx: app.globalData.isIpx,
    sexOption: [
      { value: 'man', text: '男' },
      { value: 'woman', text: '女' }
    ],
    sexIndex: 0,
    roleOption: [],
    roleIndex: 1,
    userInfo: {},
    id: 0,
    name: '',
    phone: '',
    password: '',
    age: '',
    role_id: null,
    sex: 'man',
    avatar: 'https://qcloudtest-1257454171.cos.ap-guangzhou.myqcloud.com/present/1574164351806-FFphnQmq.jpg',
    sign: '',
    company_id: null,
    editBySelf: false
  },
  onLoad(options) {
    this.setData({ userInfo: app.globalData.userInfo });
    console.log(options);
    const { id = 1, self } = options;
    if (id) {
      this.getUserDetail(id);
      this.setData({ id: Number(id) });
    } else {
      this.getRoleList();
    }
    if (self) {
      this.setData({ editBySelf: true });
    }
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
  // 查看用户详情
  async getUserDetail(id) {
    try {
      this.timee = setTimeout(() => {
        wx.showLoading({
          title: '加载中...',
          mask: true
        });
      }, 300);
      const { data } = await ajax({
        url: config.service.getUserDetail,
        data: { id }
      });
      console.log('getUserDetail', data);
      const { name, phone, password, age, role_id, sex, avatar, sign, company_id } = data;
      this.setData({ name, phone, password, age, role_id, sex, sign, company_id });
      if (avatar) {
        this.setData({ avatar });
      }
      const { sexOption } = this.data;
      const sexIndex = sexOption.findIndex(item => item.value === sex);
      console.log('sexIndex', sexIndex);
      if (sexIndex > -1) {
        this.setData({ sexIndex });
      }
      // 角色
      const res = await ajax({
        url: config.service.getRoleList,
        data: { company_id: this.data.userInfo.company_id }
      });
      console.log('getRoleList', res.data);
      const roleOption = res.data.map(item => {
        return {
          id: item.id,
          text: item.fullName
        }
      })
      this.setData({ roleOption });
      const roleIndex = roleOption.findIndex(item => item.id === role_id);
      console.log('roleIndex', roleIndex);
      if (roleIndex > -1) {
        this.setData({ roleIndex });
      }
    } catch (e) {
      console.log('getUserDetail报错', e);
    } finally {
      if (this.timee) {
        clearTimeout(this.timee);
        this.timee = null;
      }
      wx.hideLoading();
    }
  },
  // 查看角色
  async getRoleList() {
    try {
      const { company_id } = this.data.userInfo;
      const { data } = await ajax({
        url: config.service.getRoleList,
        data: { company_id }
      });
      console.log('getRoleList', data);
      const roleOption = data.map(item => {
        return {
          id: item.id,
          text: item.fullName
        }
      })
      this.setData({ roleOption });
    } catch (e) {
      console.log('getUnitList报错', e);
    }
  },
  // 角色选择
  bindPickerChangeRole(e) {
    console.log(e);
    const { roleOption } = this.data;
    const { value } = e.detail;
    this.setData({ role_id: roleOption[value].id });
  },
  // 性别选择时
  bindPickerChange(e) {
    console.log(e);
    const { value } = e.detail;
    const sexConfig = {
      '0': 'man',
      '1': 'woman'
    };
    this.setData({ sex: sexConfig[value] });
  },
  // 输入框变化时
  fieldChange(e) {
    console.log(e);
    const { detail } = e;
    const { key } = e.currentTarget.dataset;
    this.setData({ [key]: detail });
  },
  // 保存按钮
  save() {
    const { name, phone, password, role_id, sex } = this.data;
    const patten = /^1\d{10}$/;
    if (!name.trim()) {
      this.saveToast('用户名');
    } else if (!phone) {
      this.saveToast('手机号');
    } else if (!patten.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号！',
        icon: 'none'
      })
    } else if (!password.trim()) {
      this.saveToast('密码');
    } else if (!role_id) {
      this.saveToast('用户角色');
    } else if (!sex) {
      this.saveToast('性别');
    } else {
      this.saveFun();
    }
  },
  saveToast(name) {
    wx.showToast({
      title: `${name}不能为空`,
      icon: 'none'
    });
  },
  // 保存用户
  async saveFun() {
    console.log('saveFun')
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { id, name, phone, password, age, role_id, sex, avatar, sign, company_id, userInfo, editBySelf } = this.data;
      const method = id ? 'PUT' : 'POST';
      const url = id ? 'updateUser' : 'addUser';
      const { data } = await ajax({
        url: config.service[url],
        method,
        data: {
          id, name, phone, password, age, role_id, sex, avatar, sign, company_id: company_id || userInfo.company_id
        }
      });
      console.log(url, data);
      app.globalData.isAlertGood = true;
      if (editBySelf) {
        const { data } = await ajax({
          url: config.service.getUserDetail,
          data: { id }
        });
        wx.setStorage({
          key: 'userInfo',
          data
        });
        app.globalData.userInfo = data;
      }
      app.globalData.editBySelf = true;
      setTimeout(() => {
        wx.showToast({
          title: '保存成功',
          icon: 'none'
        });
      }, 10);
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (e) {
      console.log(`${url}报错`, e);
    } finally {
      wx.hideLoading();
    }
  },
  //上传封面图片
  uploadCover() {
    wx.chooseImage({
      count: 1, // 默认9
      // sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        wx.showLoading({
          title: '上传中',
          duration: 100000,
          mask: true
        })
        var promises = []
        promises = res.tempFilePaths.map(item => {
          return uploadFile(item)
        })
        Promise.all(promises).then((args) => {
          this.setData({ coverImg: args[0] })
          wx.hideLoading()
        }).catch(err => {
          wx.hideLoading()
          wx.showToast({
            title: '上传失败，请重试',
            icon: 'none'
          })
        })
      }
    })
  },
});
