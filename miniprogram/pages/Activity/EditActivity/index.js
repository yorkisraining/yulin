// pages/Activity/EditActivity/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {},
    rules: [
      { name: "name", rules: { required: true, message: '活动名称为必填项' } },
      { name: "startTime", rules: { required: true, message: '活动时间为必填项' } },
      { name: "address", rules: { required: true, message: '活动地点为必填项' } },
      { name: "backgroundUrl", rules: { required: true, message: '宣传图片为必填项' } },
    ],
    error: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        ['formData.activityID']: options.id
      })
      // 获取数据
      this.getActivityInfo(options.id);
    }

    if (options.tid) {
      this.setData({
        ['formData.teamID']: options.tid
      })
    }
  },

  // 获取数据
  getActivityInfo(id) {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getActivityInfo',
        id: id
      }
    })
      .then(data => {
        if (data.result.success) {
          this.setData({
            formData: data.result.data
          })
        }
      })
  },

  randomName(len) {
    len = len || 28;
    let chars = 'ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';
    let maxPos = chars.length;
    let str = '';
    for (let i = 0; i < len; i++) {
      str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return str;
  },

  uploadFild(url, cb) {
    const name = this.randomName(30);
    wx.cloud.uploadFile({
      // 指定上传到的云路径
      cloudPath: `activity/${name}.png`,
      // 指定要上传的文件的小程序临时文件路径
      filePath: url,
      // 成功回调
      success: res => {
        cb();
      },
    })
  },

  // 选择背景图
  chooseBackground() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed']
    })
      .then(data => {
        this.uploadFild(data.tempFiles[0].tempFilePath, () => {
          this.setData({
            ['formData.backgroundUrl']: data.tempFiles[0].tempFilePath
          })
        });
      })
  },

  changeFormData(e) {
    const name = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${name}`]: value
    })
  },

  saveForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      if (!valid) {
        this.setData({
          error: errors[0]?.message,
        })
        return;
      }
      let url = this.data.formData.activityID ? 'addActivity' : 'addActivity'

      wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: url,
          params: this.data.formData,
        }
      })
        .then(data => {
          wx.navigateBack({
            delta: 1
          })
        })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
})