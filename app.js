//app.js
App({
  onLaunch: function () {
    // // 打开调试11
    // wx.setEnableDebug({
    //   enableDebug: true
    // });
    // 获取设备信息
    this.getSystemInfo();
  },
  // 获取设备信息
  getSystemInfo() {
    var _that = this
    wx.getSystemInfo({
      success(res) {
        _that.globalData.ww = res.windowWidth;
        _that.globalData.hh = res.windowHeight;
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
        var model = res.model
        if (model.search('iPhone X') != -1 || model.search('iPhone XS') != -1 || model.search('iPhone XR') != -1 || model.search('iPhone XS Max') != -1) {
          _that.globalData.isIpx = true;
        } else {
          _that.globalData.isIpx = false;
        }
        _that.globalData.platform = res.platform;
      }
    })
  },
  globalData: {
    userList: [],
    userInfo: {},
    isIpx: false, // 是否为iPhone X
    isAlertGood: false,
    goodItem: {},
    showItem: false,
    isUpdateShop: false,
    isUpdateGood: false,
    showShopModal: false,
    platform: '',
  },

  /**
    * @param sx 起始点x坐标
    * @param sy 起始点y坐标
    * @param cx 控制点x坐标
    * @param cy 控制点y坐标
    * @param ex 结束点x坐标
    * @param ey 结束点y坐标
    * @param part 将起始点到控制点的线段分成的份数，数值越高，计算出的曲线越精确
    * @return 贝塞尔曲线坐标
    */
  bezier: function (points, part) {

    let sx = points[0]['x'];

    let sy = points[0]['y'];

    let cx = points[1]['x'];

    let cy = points[1]['y'];

    let ex = points[2]['x'];

    let ey = points[2]['y'];

    var bezier_points = [];

    // 起始点到控制点的x和y每次的增量

    var changeX1 = (cx - sx) / part;

    var changeY1 = (cy - sy) / part;

    // 控制点到结束点的x和y每次的增量

    var changeX2 = (ex - cx) / part;

    var changeY2 = (ey - cy) / part;

    //循环计算

    for (var i = 0; i <= part; i++) {

      // 计算两个动点的坐标

      var qx1 = sx + changeX1 * i;

      var qy1 = sy + changeY1 * i;

      var qx2 = cx + changeX2 * i;

      var qy2 = cy + changeY2 * i;

      // 计算得到此时的一个贝塞尔曲线上的点

      var lastX = qx1 + (qx2 - qx1) * i / part;

      var lastY = qy1 + (qy2 - qy1) * i / part;

      // 保存点坐标

      var point = {};

      point['x'] = lastX;

      point['y'] = lastY;

      bezier_points.push(point);

    }
    return {
      'bezier_points': bezier_points
    };
  }
})