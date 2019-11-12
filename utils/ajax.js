/**
 * promise封装wx.request
 * @param {*} obj 
 */
const ajax = obj => {
  return new Promise((resolve, reject) => {
    wx.request(Object.assign(obj, {
      success: function({ data }) {
        if (data.code === 0) {
          resolve(data);
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
      fail: function(e) {
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
