/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
// var host = 'https://0az3korx.qcloud.la/weapp'; // 开发
// var host = 'http://localhost:3005'; // 调试
var host = 'https://ilovelyplat.com:3000'; // 生产

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,
        // 角色
        getRoleList: `${host}/getRoleList`, // 查看角色列表
        // 商品类型
        getGoodsTypeList: `${host}/getGoodsTypeList`, // 查看商品类型列表
        getGoodsTypeDetail: `${host}/getGoodsTypeDetail`, // 查看单个商品类型
        addGoodsType: `${host}/addGoodsType`, // 新增商品类型
        updateGoodsType: `${host}/updateGoodsType`, // 更新单个商品类型
        removeGoodsType: `${host}/removeGoodsType`, // 删除单个商品类型
        // 用户
        getUserList: `${host}/getUserList`, // 查看用户列表
        getUserDetail: `${host}/getUserDetail`, // 查看单个用户
        userLogin: `${host}/userLogin`, // 用户登录
        loginByWx: `${host}/loginByWx`, // 用户登录
        addUser: `${host}/addUser`, // 新增用户
        updateUser: `${host}/updateUser`, // 更新单个用户
        removeUser: `${host}/removeUser`, // 删除单个用户
        // 商品
        getGoodsList: `${host}/getGoodsList`, // 查看商品列表
        getGoodsDetail: `${host}/getGoodsDetail`, // 查看单个商品
        getGoodsDetailById: `${host}/getGoodsDetailById`, // 查看单个商品
        addGoods: `${host}/addGoods`, // 新增商品
        updateGoods: `${host}/updateGoods`, // 更新单个商品
        removeGoods: `${host}/removeGoods`, // 删除单个商品
        getGoodsByCompany: `${host}/getGoodsByCompany`, // 按公司查找所有商品类型+类型下的商品列表
        // 单位
        getUnitList: `${host}/getUnitList`, // 查看单位列表
        getUnitDetail: `${host}/getUnitDetail`, // 查看单个单位
        addUnit: `${host}/addUnit`, // 新增单位
        updateUnit: `${host}/updateUnit`, // 更新单个单位
        removeUnit: `${host}/removeUnit`, // 删除单个单位
        // 偏好
        getHobbyList: `${host}/getHobbyList`, // 查看单位列表
        getHobbyDetail: `${host}/getHobbyDetail`, // 查看单个单位
        addHobby: `${host}/addHobby`, // 新增单位
        updateHobby: `${host}/updateHobby`, // 更新单个单位
        removeHobby: `${host}/removeHobby`, // 删除单个单位
        // 订单
        getOrderList: `${host}/getOrderList`, // 查看订单列表
        getOrderDetail: `${host}/getOrderDetail`, // 查看订单详情
        addOrder: `${host}/addOrder`, // 更新单个订单信息
        updateOrder: `${host}/updateOrder`, // 更新单个订单信息
        updateOrderGood: `${host}/updateOrderGood`, // 更新单个订单信息
        removeOrder: `${host}/removeOrder`, // 删除单个订单
        getOrderDetailList: `${host}/getOrderDetailList`, // 单个订单包含的商品列表
        getShoplist: `${host}/getShoplist`, // 获取购物车列表
        getShoplistInValid: `${host}/getShoplistInValid`, // 获取购物车列表
        getShoplistEasy: `${host}/getShoplistEasy`, // 获取购物车列表easy版
        addShop: `${host}/addShop`, // 获取购物车列表easy版
        addShopMultiple: `${host}/addShopMultiple`, // 获取购物车列表easy版
        updateShop: `${host}/updateShop`, // 获取购物车列表easy版
        removeShop: `${host}/removeShop`, // 获取购物车列表easy版
        removeShopById: `${host}/removeShopById`, // 获取购物车列表easy版
        removeShopByUser: `${host}/removeShopByUser`, // 获取购物车列表easy版
        printOrderById: `${host}/printOrderById`, // 打印
        putObject: `${host}/putObject`, // 打印
    }
};

module.exports = config;
