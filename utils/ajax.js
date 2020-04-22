/**
 * promise封装wx.request
 * @param {*} obj 
 */
const ajax = obj => {
  return new Promise((resolve, reject) => {
    const { phone = '', token = '' } = wx.getStorageSync('userInfo');
    wx.request(Object.assign(obj, {
      header: {
        phone,
        token
      }
    }, {
      success: function ({ data }) {
        if (data.code === 0) {
          resolve(data);
        } else if (data.code === 403) { // 登录过期
          wx.showToast({
            title: '登录过期啦',
            icon: 'none'
          });
          wx.reLaunch({ url: '../login/index' });
          reject(data.data);
        } else if (data.code === -1) {
          reject(data.error);
          wx.showModal({
            title: '出错啦',
            content: data.error,
            showCancel: false,
            confirmColor: '#e4393c'
          })
        } else {
          reject(data.data);
          wx.showModal({
            title: '出错啦',
            content: data.data,
            showCancel: false,
            confirmColor: '#e4393c'
          })
        }
      },
      fail: function (e) {
        reject(e);
        wx.showModal({
          title: '出错啦',
          content: e,
          showCancel: false,
          confirmColor: '#e4393c'
        })
      }
    }));
  });
}
module.exports = {
  ajax
}
