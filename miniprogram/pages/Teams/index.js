Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabsList: [
      {
        id: 0,
        title: '城市战队',
      },
      {
        id: 1,
        title: '我创建的',
      },
      {
        id: 2,
        title: '我加入的',
      },
    ],
    pageIndex: 1,
    totalPage: 0,
    activeTab: 0,
    teamsList: [],
    showToTopBtn: false,
    showLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.setData({
      teamsList: [],
      pageIndex: 1
    })
    this.getTeamList();
  },

  getTeamList() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getTeamPage',
        teamType: this.data.activeTab,
        pageIndex: this.data.pageIndex
      }
    })
      .then(data => {
        this.setData({
          totalPage: data.result.totalPage,
          pageIndex: data.result.pageIndex,
          teamsList: this.data.teamsList.concat(data.result.list)
        })
      })
  },

  async addImagePath(fileId) {
    let url = '';
    await wx.cloud.getTempFileURL({
      fileList: [fileId],
      success: res => {
        url = res.fileList[0].tempFileURL;
      },
      fail: console.error
    })
    return url;
  },

  createTeam() {
    wx.navigateTo({
      url: `/pages/Teams/EditTeam/index`,
    })
  },

  // 切换导航 tabs
  swichNav(e) {
    this.setData({
      activeTab: e.currentTarget.dataset.id,
      teamsList: []
    })
    this.getTeamList();
  },

  // 按钮操作
  operations(e) {
    const dataset = e.currentTarget.dataset;
    const type = dataset.type;
    const id = dataset.id;
    const teamName = dataset.name;

    switch (type) {
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
            const index = dataset.index;
            let teamList = this.teamsList;
            teamList[index].role = [2];
            this.setData({
              teamsList
            })
          })
        break;
      case 'quit':
        wx.showModal({
          title: '提示',
          content: `确定退出战队【${teamName}】吗`
        })
          .then(() => {
            const index = dataset.index;
            let teamList = this.teamsList;
            teamList[index].role = [1];
            this.setData({
              teamsList
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

  // 滚动到顶部
  scrollToTop() {
    wx.pageScrollTo({
      duration: 300,
      scrollTop: 0
    })
  },

  toTeamDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/Teams/Detail/index?id=${id}`,
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听页面滚动
   */
  onPageScroll: function (ev) {
    if (ev.scrollTop > 100) {
      this.setData({
        showToTopBtn: true
      })
    } else {
      this.setData({
        showToTopBtn: false
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      pageIndex: 1,
      teamsList: []
    })
    this.getTeamList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.pageIndex < this.data.totalPage) {
      this.setData({
        pageIndex: this.data.pageIndex++
      })
      this.getTeamList();
    }
  },
})