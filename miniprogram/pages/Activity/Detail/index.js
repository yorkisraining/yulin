// pages/Activity/Detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    actID: '',
    actInfo: {},
    teamInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        actID: options.id
      })
      this.getActDetail();
    }
  },

  getActDetail() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getActivityInfo',
        id: this.data.actID
      }
    })
      .then(data => {
        this.setData({
          actInfo: data.result.data
        })
        wx.setNavigationBarTitle({
          title: data.result.data.name,
        })
        this.getTeamInfo(data.result.data.teamID);
      })
  },

  getTeamInfo(id) {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getTeamInfo',
        id: id
      }
    })
      .then(data => {
        this.setData({
          teamInfo: data.result.data
        })
      })
  },

  toTeamDetail() {
    wx.navigateTo({
      url: `/pages/Teams/Detail/index?id=${this.data.teamInfo.id}`,
    })
  }

 
})