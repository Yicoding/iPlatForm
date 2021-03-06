// components/user/user.js
const app = getApp();

Component({
    /**
     * 组件的属性列表
     */
    externalClasses: [ 'my-class' ],
    properties: {
        visible: {
            type: Boolean,
            default: false
        },
        icon: {
            type: String,
            default: '/images/data-empty.png'
        },
        title: {
            type: String,
            default: '暂时还没有相关数据哦～～'
        },
        buttons: {
            type: Array,
            default: []
        },
        rootClass: {
            type: Boolean,
            default: false
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
    },
    attached() {
    },
    methods: {
        clickHandle() {
            this.triggerEvent('click');
        }
    },
})
