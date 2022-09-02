// pages/UserInfo/index.js
const appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName: '',
    desc: '',
    phone: '',
    avatarUrl: '',
  },

  initUserData(e = {}) {
    const userInfo = {
      ...appInstance.globalUserInfo,
      ...e
    }
    this.setData({
      userName: userInfo.userName,
      desc: userInfo.desc,
      phone: userInfo.phone,
      avatarUrl: userInfo.avatarUrl
    })
  },

  getUserInfo() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getUserInfo'
      }
    }).then((resp) => {
      const result = resp.result;
      if (result.success && result.data._id) {
        this.initUserData(result.data);
      } else {
        this.createUser();
      }
      console.log('getUnserInfo', result);
    }).catch((e) => {
      console.log('getUnserInfoError', e);
    });
  },

  // 获取用户头像
  getUserAvatar(e) {
    let url = e.detail.avatarUrl;
    wx.cloud.uploadFile({
      // 指定上传到的云路径
      cloudPath: `avatar/${this.data.userInfo._openid}.png`,
      // 指定要上传的文件的小程序临时文件路径
      filePath: url,
      // 成功回调
      success: res => {
        console.log('上传成功', res)
        this.setData({
          avatarUrl: url
        });
        this.uploadImg(res.fileID);
      },
    })
  },

  // 更新用户头像
  uploadImg(url) {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'changeAvatar',
        avatarUrl: url
      }
    })
      .then(data => {
        console.log('avatar', data);
      })
  },

  // 保存表单
  saveForm() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'changeUserInfo',
        userName: this.data.userName,
        desc: this.data.desc,
        phone: this.data.phone,
      }
    })
      .then(data => {
        if (data.result.success) {
          wx.showToast({
            title: data.result.message || '修改成功',
            icon: 'success'
          })
        }
      })
      .catch(data => {

      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!appInstance.globalUserInfo._id) {
      this.getUserInfo();
    } else {
      this.initUserData();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})