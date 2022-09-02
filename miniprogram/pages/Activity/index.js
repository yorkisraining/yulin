Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityList: [],
    pageIndex: 1,
    totalPage: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.getAvtList();
  },

  filterTime(date, { fmt = 'YYYY-MM-DD HH:mm:ss', complementary = true } = {}) {
    if (!date) { return ''; }
    date = new Date(date);
    let ret;
    const opt = {
      "Y+": date.getFullYear().toString(),        // 年
      "M+": (date.getMonth() + 1).toString(),     // 月
      "D+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "m+": date.getMinutes().toString(),         // 分
      "s+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (const k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
        if (complementary) {
          // 要前置 0
          fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        } else {
          // 不要前置 0
          fmt = fmt.replace(ret[1], opt[k]);
        }
      }
    }
    return fmt;
  },

  getAvtList() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getActivityPage',
        pageIndex: this.pageIndex
      }
    })
      .then(data => {
        this.setData({
          activityList: this.data.activityList.concat(data.result.list),
          totalPage: data.result.totalPage
        })
      })
  },

  toDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/Activity/Detail/index?id=${id}`,
    })
  },

  search(value) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(1)
        resolve([{ text: '搜索结果', value: 1 }, { text: '搜索结果2', value: 2 }])
      }, 200)
    })
  },
  selectResult(e) {
    console.log('select result', e.detail)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      pageIndex: 1,
      activityList: []
    })
    this.getAvtList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.pageIndex < this.data.totalPage) {
      this.setData({
        pageIndex: this.data.pageIndex++
      })
      this.getAvtList();
    }
  },
})