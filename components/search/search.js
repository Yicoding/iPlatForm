// components/user/user.js
const app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        focus: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        text: '',
    },
    attached() {

    },
    methods: {
        // 键盘输入时触发
        textChange(e) {
            this.setData({ text: e.detail.value.trim() });
        },
        // 清空
        cancel() {
            this.setData({ text: '' });
        },
        // 去搜索
        goSearch(e) {
            console.log('goSearch');
            this.triggerEvent('callback', this.data.text);
        }
    },
})
