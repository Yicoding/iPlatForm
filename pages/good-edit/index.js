//index.js
//获取应用实例
const app = getApp()
const config = require('../../config');
var { uploadFile } = require('../../utils/upload');
const { ajax } = require('../../utils/ajax');
import { $wuxSelect } from '../../miniprogram_npm/wux-weapp/index';

Page({
  data: {
    isIpx: app.globalData.isIpx,
    id: 0,
    userInfo: {},
    unitList: [],
    typeList: [],
    name: '',
    coverImg: 'https://qcloudtest-1257454171.cos.ap-guangzhou.myqcloud.com/present/1574164351806-FFphnQmq.jpg',
    unitSingle: '',
    unitAll: '',
    typeName: '',
    buySingle: '',
    buyAll: '',
    midSingle: '',
    midAll: '',
    sellSingle: '',
    sellAll: '',
    num: '',
    desc: '',
    origin: '',
  },
  onLoad(options) {
    this.setData({ userInfo: app.globalData.userInfo });
    console.log(options);
    const { id = 1 } = options;
    if (id) {
      this.getGoodsDetailById(id);
      this.setData({ id: Number(id) });
    }
    this.getUnitList();
    this.getGoodsTypeList();
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
  // 查看单个商品详情
  async getGoodsDetailById(id) {
    try {
      const { company_id } = this.data.userInfo;
      this.timee = setTimeout(() => {
        wx.showLoading({
          title: '加载中...',
          mask: true
        });
      }, 300);
      const { data } = await ajax({
        url: config.service.getGoodsDetailById,
        data: {
          id,
          company_id
        }
      });
      console.log('getGoodsDetailById', data);
      const { name, coverImg, unitSingle, unitAll, typeName, buySingle, buyAll, midSingle, midAll, sellSingle, sellAll, num, desc, origin } = data;
      this.setData({ name, coverImg, unitSingle, unitAll, typeName, buySingle, buyAll, midSingle, midAll, sellSingle, sellAll, num, desc, origin });
    } catch (e) {
      console.log('getGoodsDetailById报错', e);
    } finally {
      if (this.timee) {
        clearTimeout(this.timee);
        this.timee = null;
      }
      wx.hideLoading();
    }
  },
  // 查看单位
  async getUnitList() {
    try {
      const { company_id } = this.data.userInfo;
      const { data } = await ajax({
        url: config.service.getUnitList,
        data: { company_id }
      });
      console.log('getUnitList', data);
      this.setData({ unitList: data });
    } catch (e) {
      console.log('getUnitList报错', e);
    }
  },
  // 查看类型
  async getGoodsTypeList() {
    try {
      const { company_id } = this.data.userInfo;
      const { data } = await ajax({
        url: config.service.getGoodsTypeList,
        data: { company_id }
      });
      console.log('getGoodsTypeList', data);
      this.setData({ typeList: data });
    } catch (e) {
      console.log('getGoodsTypeList报错', e);
    }
  },
  // 单价单位
  onClick1() {
    const { unitList, unitSingle } = this.data;
    const options = unitList.map(item => {
      return {
        title: item.name,
        value: String(item.id)
      }
    });
    $wuxSelect('#wux-select1').open({
      value: String(unitSingle),
      options,
      onConfirm: (value, index, options) => {
        console.log('onConfirm', value, index, options)
        if (index !== -1) {
          this.setData({
            unitSingle: value
          })
        }
      },
    })
  },
  // 总单位
  onClick2() {
    const { unitList, unitAll } = this.data;
    const options = unitList.map(item => {
      return {
        title: item.name,
        value: String(item.id)
      }
    });
    $wuxSelect('#wux-select1').open({
      value: String(unitAll),
      options,
      onConfirm: (value, index, options) => {
        console.log('onConfirm', value, index, options)
        if (index !== -1) {
          this.setData({
            unitAll: value
          })
        }
      },
    })
  },
  // 商品类型
  onClick3() {
    const { typeList, typeName } = this.data;
    const options = typeList.map(item => {
      return {
        title: item.name,
        value: item.code
      }
    });
    const value = typeName.split(',');
    $wuxSelect('#wux-select2').open({
      value,
      options,
      multiple: true,
      max: 3,
      toolbar: {
        title: '请选择(最多3个)',
        confirmText: '确定',
        cancelText: '取消'
      },
      onConfirm: (value, index, options) => {
        console.log('click3', value, index);
        if (index.length > 0) {
          this.setData({
            typeName: String(value)
          });
        } else {
          wx.showToast({
            title: '请至少选择一个选项',
            icon: 'none'
          });
        }
      },
    })
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
    const { name, coverImg, unitSingle, unitAll, typeName, num, buySingle, midSingle, sellSingle  } = this.data;
    if (!name.trim()) {
      this.saveToast('商品名');
    } else if (!coverImg.trim()) {
      this.saveToast('商品图片');
    } else if (!unitSingle) {
      this.saveToast('单价单位');
    } else if (!unitAll) {
      this.saveToast('总单位');
    } else if (!typeName) {
      this.saveToast('商品类别');
    } else if (!num) {
      this.saveToast('商品数量');
    } else if (!buySingle) {
      this.saveToast('进货单价');
    } else if (!midSingle) {
      this.saveToast('批发单价');
    } else if (!sellSingle) {
      this.saveToast('零售单价');
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
  // 保存商品
  async saveFun() {
    console.log('saveFun')
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    try {
      const { company_id } = this.data.userInfo;
      const { id, name, coverImg, unitSingle, unitAll, typeName, buySingle, midSingle, sellSingle, num, desc, origin } = this.data;
      const method = id ? 'PUT' : 'POST';
      const url = id ? 'updateGoods' : 'addGoods';
      const { data } = await ajax({
        url: config.service[url],
        method,
        data: {
          id,
          company_id,
          name,
          coverImg,
          unitOne_id: unitSingle,
          unitDouble_id: unitAll,
          typeName,
          num,
          buySingle,
          buyAll: buySingle * num,
          midSingle,
          midAll: midSingle * num,
          sellSingle,
          sellAll: sellSingle * num,
          desc,
          origin
        }
      });
      console.log('getUnitList', data);
      app.globalData.isAlertGood = true;
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
      console.log('getUnitList报错', e);
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
