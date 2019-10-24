/**
 * promise封装wx.request
 * @param {*} obj 
 */
const ajax = obj => {
  return new Promise((resolve, reject) => {
    wx.request(Object.assign(obj, {
      success: function({ data }) {
        resolve(data);
      },
      fail: function(e) {
        reject(e);
      }
    }));
  });
}
module.exports = {
  ajax
}
