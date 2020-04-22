//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    isMultiple: false
  },
  onLoad() {
    wx.getStorage({
      key: 'userList',
      success: ({ data }) => {
        if (data) {
          this.setData({ isMultiple: true });
        }
      }
    });
  },
  // 退出
  loginOut() {
    wx.showModal({
      title: '确定要退出登录吗',
      success: (res) => {
        console.log(res);
        const { confirm } = res;
        if (confirm) { // 确定
          wx.clearStorage({
            success: () => {
              wx.reLaunch({
                url: '../login/index'
              })
            }
          })
        }
      }
    })
  },
  // 修改个人信息
  linkEdit() {
    wx.getStorage({
      key: 'userInfo',
      success: ({ data }) => {
        console.log('userInfo', data);
        const { id } = data;
        wx.navigateTo({
          url: `../user-edit/index?id=${id}&self=true`
        });
      }
    })
  },
  // 打开相机
  showCamare() {
    wx.scanCode({
      success: (res) => {
        console.log('res', res);
        const { result } = res;
        // const arr = result.match(/D(.+)#/);
        const arr = result.match(/([0-9]+)#/);
        console.log('arr', arr);
        if (arr && arr.length > 0 && arr[1]) {
          const id = arr[1];
          wx.navigateTo({
            url: `../order-detail/index?id=${id}`
          });
        } else {
          wx.showToast({
            title: '无效的二维码，请更换',
            duration: 2500,
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.log('err', err);
      }
    })
  },
  // 切换公司
  switchCompany() {
    wx.reLaunch({
      url: '../company/index'
    });
  }
})
