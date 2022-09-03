// app.js
App({

  globalUserInfo: {},


  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      });
    }

    wx.login()
      .then(data => {
        const code = data.code;

        wx.getLocation({
          type: 'gcj02',
          success(res) {
            const { latitude, longitude, accuracy } = res;
          }
        })
        this.getOpenId();
      })

    // 查看授权信息
    wx.getSetting()
      .then(data => {
        console.log(data)
      })

    this.globalData = {};
  },

  // 获取用户 openid
  getOpenId() {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      this.globalUserInfo = {
        ...resp.result
      };
      this.getUserInfo();
      wx.hideLoading();
    }).catch((e) => {
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    });
  },

  // 获取用户信息
  getUserInfo() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getUserInfo'
      }
    }).then((resp) => {
      const result = resp.result;
      if (result.success && result.data._id) {
        this.globalUserInfo = {
          ...this.globalUserInfo,
          ...result.data
        }
      } else {
        this.createUser();
      }
    }).catch((e) => {
    });
  },

  // 创建新用户
  createUser() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'addUser'
      }
    })
      .then((resp) => {
        const result = resp.result;
        if (result.success && result.data._id) {
          this.globalUserInfo = {
            ...this.globalUserInfo,
            ...result.data
          }
        }
      })
  }
});
