// components/user/user.js
const app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        focus: {
            type: Boolean,
            value: false
        },
        disabled: {
            type: Boolean,
            value: false
        },
        showBtn: {
            type: Boolean,
            value: true
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        text: '',
    },
    attached() {
        console.log('showBtn', this.properties.showBtn)
    },
    methods: {
        // 键盘输入时触发
        textChange(e) {
            this.setData({ text: e.detail.value.trim() });
            if (!e.detail.value.trim()) {
                this.triggerEvent('callback', '');
            }
        },
        // 确认按钮
        onConfim(e) {
            console.log('onConfim', e);
            const { value } = e.detail;
            this.triggerEvent('callback', value);
        },
        // 清空
        cancel() {
            this.setData({ text: '' });
            this.triggerEvent('callback', '');
        },
        // 去搜索
        goSearch() {
            console.log('goSearch');
            this.triggerEvent('callback', this.data.text);
        },
        // 填充值
        setText(text) {
            if (text === this.data.text) {
                return;
            }
            this.setData({ text });
            this.triggerEvent('callback', text);
        }
    },
})
