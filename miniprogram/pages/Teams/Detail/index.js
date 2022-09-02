// pages/Teams/Detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamID: '',
    teamInfo: {},
    activeNav: 0,
    userList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        teamID: options.id
      })
      // 获取数据
      this.getTeamInfo(options.id);
    }
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
        if (data.result.success) {
          this.setData({
            teamInfo: data.result.data
          })
          
          this.getUsersInfo(data.result.data.userList.join(','));
        }
      })
  },

  getUsersInfo(ids) {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getUsers',
        ids: ids
      }
    })
      .then(data => {
        this.setData({
          userList: data.result.list
        })
      })
  },

  // 按钮操作
  operations(e) {
    const dataset = e.currentTarget.dataset;
    const type = dataset.type;
    const id = dataset.id;
    const teamName = dataset.name;

    switch (type) {
      case 'addAct':
        wx.navigateTo({
          url: `/pages/Activity/EditActivity/index?tid=${id}`,
        })
        break;
      case 'challenge':
        wx.navigateTo({
          url: `/pages/Teams/Challenge/index?id=${id}`,
        })
        break;
      case 'edit':
        wx.navigateTo({
          url: `/pages/Teams/EditTeam/index?id=${id}`,
        })
        break;
      case 'add':
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'joinTeamInfo',
            id: id
          }
        })
          .then(data => {
            this.setData({
              ['teamInfo.role']: [1]
            })
          })
        break;
      case 'quit':
        wx.showModal({
          title: '提示',
          content: `确定退出战队【${teamName}】吗`
        })
          .then(() => {
            wx.cloud.callFunction({
              name: 'quickstartFunctions',
              data: {
                type: 'quitTeamInfo',
                id: id
              }
            })
              .then(data => {
                this.setData({
                  ['teamInfo.role']: [2]
                })
              })
            
          })
        break;
      case 'delete':
        wx.showModal({
          title: '提示',
          content: `确定解散战队【${teamName}】吗`
        })
          .then(() => { })
        break;
    }
  },

  switchNav(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeNav: index
    })
  },

})