const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

const _ = db.command;

function randomName(len) {
  len = len || 28;
  var chars = 'ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';
  var maxPos = chars.length;
  var str = '';
  for (i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return str;
}

// 创建活动
exports.insert = async (event) => {
  try {
    let { OPENID, APPID } = cloud.getWXContext();

    const avticityID = randomName(24);

    const params = event.params;

    let addActivityMsg = {
      _id: avticityID,
      id: avticityID,
      appID: APPID,
      creatorID: OPENID,
      createTime: new Date().getTime(),
      teamID: params.teamID || "", // 战队 id，非必填
      name: params.name, // 活动名称
      startTime: params.startTime, // 活动时间
      address: params.address, // 活动地点
      desc: params.desc || '',
      backgroundUrl: params.backgroundUrl || 'cloud://cloud1-0g9ocwgo91faee3e.636c-cloud1-0g9ocwgo91faee3e-1313203757/defaultImage/defaultBg.jpg',
      location: params.location || -1,
    }

    await db.collection('activity').add({
      data: addActivityMsg
    })

    if (params.teamID) {
      let activityList = [];
      await db.collection('team')
        .doc(params.teamID)
        .get()
        .then(res => {
          activityList = res.data.activityList || [];
        })

      activityList.push(avticityID);
      await db.collection('team').doc(params.teamID).update({
        data: {
          activityList
        }
      })
    }

    return {
      success: true,
      message: '创建成功',
      data: avticityID
    };

  } catch (e) {
    return {
      success: false,
      message: '创建失败',
      data: e
    };
  }
};

// 修改活动信息
exports.changeAcitivityInfo = async (event) => {
  try {
    const _id = event.params.id;

    for (let key in event.params) {
      if (key != 'id') {
        if (event.params[key] !== null && event.params[key] !== '' && event.params[key] !== undefined) {
          await db.collection('activity').doc(_id).update({
            data: {
              key: event.params[key]
            }
          })
        }
      }
    }

    return {
      success: true,
      message: '更新成功'
    }
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};

// 获取活动信息，一个
exports.getActivityInfo = async (event) => {
  try {
    const _id = event.id;

    let returnMsg = {
      data: {},
      success: true,
      message: '查询成功'
    };
    await db.collection('activity').doc(_id)
      .get()
      .then(res => {
        returnMsg.data = res.data;
      })

    return returnMsg
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
}

// 获取活动列表，分页
exports.getActivityPage = async (event) => {
  try {
    let pageSize = event.pageSize || 10;
    let pageIndex = event.pageIndex || 1;
    let totalPage = 0;
    let totalCount = 0;

    await db.collection('activity').where({
      location: -1
    })
      .count()
      .then(res => {
        totalCount = res.total;
        totalPage = totalCount === 0 ? 0 : totalCount <= pageSize ? 1 : parseInt(totalCount / pageSize) + 1;
      })

    let returnMsg = {
      pageSize,
      pageIndex,
      totalPage,
      totalCount,
      list: [],
      success: true,
      message: '查询成功'
    };

    if (totalPage >= pageIndex) {
      await db.collection('activity')
        .where({
          location: -1
        })
        .limit(pageSize)
        .skip((pageIndex - 1) * pageSize)
        .get()
        .then(res => {
          returnMsg.list = res.data;
        })
    }

    return returnMsg
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};
