//index.js
//获取应用实例
const app = getApp();

Page({
  data: {
    userList: [],
    getList: []
  },
  onLoad() {
    wx.getStorage({
      key: 'userList',
      success: ({ data }) => {
        console.log(data);
        if (data && data.length > 0) {
          const getList = data.map((item, index) => {
            return {
              id: item.company_id,
              name: item.companyName,
              logo: item.company_logo,
              address: item.company_address
            }
          });
          this.setData({
            getList,
            userList: data
          });
        }
      }
    })
  },
  // 跳转
  linkCompany(e) {
    console.log(e);
    const { index } = e.currentTarget.dataset;
    app.globalData.userInfo = this.data.userList[index];
    wx.setStorage({
      key: 'userInfo',
      data: this.data.userList[index],
      success: () => {
        setTimeout(() => {
          wx.switchTab({
            url: `../index/index`
          });
        }, 10);
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
})
