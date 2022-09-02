const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 增加一条用户数据
exports.insert = async () => {
  try {
    let { OPENID, APPID } = cloud.getWXContext();

    let addUserMsg = {
      _id: OPENID,
      _openid: OPENID,
      appID: APPID,
      createTime: new Date().getTime(),
      userName: '用户-' + (Math.random() * 1481414814).toFixed(0),
      avatarUrl: '',
      location: -1,
      phone: '',
      desc: '',
      teamsList: []
    }

    await db.collection('user').add({
      data: addUserMsg
    })

    return {
      success: true,
      message: '创建成功',
      data: addUserMsg
    };
  } catch (e) {
    return {
      success: false,
      message: '创建失败'
    };
  }
};

// 查询用户，根据 id
exports.getUserInfo = async () => {
  try {
    let { OPENID } = cloud.getWXContext();

    let returnMsg = {};
    await db.collection('user').doc(OPENID).get().then(res => {
      // res.data 包含该记录的数据
      returnMsg = {
        success: true,
        data: res.data,
        message: '查询成功'
      }
    })

    return returnMsg;
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};

// 查询用户数组
exports.getUsers = async (event) => {
  try {
    let pageSize = event.pageSize || 10;
    let pageIndex = event.pageIndex || 1;
    let totalPage = 0;
    let totalCount = 0;

    let returnMsg = {
      pageSize,
      pageIndex,
      totalPage,
      totalCount,
      list: [],
      success: true,
      message: '查询成功'
    };

    const arr = event.ids.split(',');
    const length = arr.length > pageSize ? pageSize : arr.length;
    for (let i = 0; i < length; i++) {
      await db.collection('user').doc(arr[i])
        .get()
        .then(res => {
          // res.data 包含该记录的数据
          returnMsg.list.push(res.data)
        })
    }
    return returnMsg;
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
}

// 修改用户头像
exports.changeAvatar = async (event) => {
  try {
    let { OPENID } = cloud.getWXContext();

    let returnMsg = {};
    await db.collection('user').doc(OPENID).update({
      data: {
        avatarUrl: event.avatarUrl
      }
    })
      .then(data => {
        returnMsg = {
          success: true,
          message: '上传成功'
        }
      })
      .catch(data => {
        returnMsg = {
          success: false,
          message: '上传失败',
          data,
        }
      })

    return returnMsg;
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};

// 修改用户信息
exports.changeUserInfo = async (event) => {
  try {
    let { OPENID } = cloud.getWXContext();

    let { userName, desc, phone, location } = event;

    let returnMsg = {};
    await db.collection('user').doc(OPENID).update({
      data: {
        userName,
        desc,
        phone,
        location
      }
    })
      .then(data => {
        returnMsg = {
          success: true,
          message: '更新成功'
        }
      })
      .catch(data => {
        returnMsg = {
          success: false,
          message: '更新失败',
          data,
        }
      })

    return returnMsg;
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};