const appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '',
      ...appInstance.globalUserInfo
    }
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
        this.setData({
          userInfo: result.data
        })
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
        this.uploadImg(res.fileID);
      },
    })
    this.setData({
      ['userInfo.avatarUrl']: url
    });
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

  navigateTo(e) {
    const URL = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: `/pages/Home/${URL}/index`
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    if (!this.data.userInfo._id) {
      this.getUserInfo();
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