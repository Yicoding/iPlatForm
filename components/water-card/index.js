// components/user/user.js
const app = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        data: Object
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        onProduct() {
            const { id } = this.data.data;
            wx.setStorage({
                key: "goodDetail",
                data: this.data.data,
                success: (res) => {
                    wx.navigateTo({
                        url: `../good-detail/index?id=${id}`
                    });
                },
                fail: (err) => {
                    console.log('我的页面跳转详情页设置缓存失败', err);
                }
            });
        }
    }
})