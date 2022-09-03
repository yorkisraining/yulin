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

// 增加战队
exports.insert = async (event) => {
  try {
    let { OPENID, APPID } = cloud.getWXContext();

    const teamID = randomName(24);

    const params = event.params;

    let addTeamMsg = {
      _id: teamID,
      id: teamID,
      appID: APPID,
      creatorID: OPENID,
      createTime: new Date().getTime(),
      name: params.name || '',
      desc: params.desc || '',
      slogan: params.slogan || '',
      avatarUrl: params.avatarUrl || 'cloud://cloud1-0g9ocwgo91faee3e.636c-cloud1-0g9ocwgo91faee3e-1313203757/defaultImage/defaultAvatar.jpg',
      backgroundUrl: params.backgroundUrl || 'cloud://cloud1-0g9ocwgo91faee3e.636c-cloud1-0g9ocwgo91faee3e-1313203757/defaultImage/defaultBg.jpg',
      isPublic: params.isPublic || true,
      isComfirm: params.isComfirm || false,
      location: params.location || -1,
      score: 0,
      medal: [],
      activityList: [],
      userList: []
    }

    await db.collection('team').add({
      data: addTeamMsg
    })

    return {
      success: true,
      message: '创建成功',
      data: teamID
    };

  } catch (e) {
    return {
      success: false,
      message: '创建失败'
    };
  }
};

// 修改战队信息
exports.changeTeamInfo = async (event) => {
  try {
    const _id = event.params.id;

    for (let key in event.params) {
      if (key != 'id') {
        if (event.params[key] !== null && event.params[key] !== '' && event.params[key] !== undefined) {
          await db.collection('team').doc(_id).update({
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

// 获取战队信息，一个
exports.getTeamInfo = async (event) => {
  try {
    const _id = event.id;
    let { OPENID } = cloud.getWXContext();

    let returnMsg = {
      data: {},
      success: true,
      message: '查询成功'
    };
    await db.collection('team').doc(_id)
      .get()
      .then(res => {
        let arr = [];
        if (res.data.creatorID == OPENID) {
          // 是创建者
          arr.push(0);
        } else {
          if (res.data.userList.indexOf(OPENID) > -1) {
            // 已加入
            arr.push(1);
          } else {
            // 未加入
            arr.push(2);
          }
        }
        res.data.role = arr;
        res.data.activityInfoList = [];
        returnMsg.data = res.data;
      })

    for (let i = 0; i < returnMsg.data.activityList.length; i++) {
      await db.collection('activity').doc(returnMsg.data.activityList[i])
        .get()
        .then(res => {
          returnMsg.data.activityInfoList.push(res.data);
        })
    }

    return returnMsg
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
}

// 获取战队列表，分页
exports.getTeamPage = async (event) => {
  try {
    // const _id = event.id;
    let { OPENID } = cloud.getWXContext();

    // {
    // teamType: 0 -> 城市 1 -> 创建的 2 -> 加入的
    // }
    let pageSize = event.pageSize || 10;
    let pageIndex = event.pageIndex || 1;
    let totalPage = 0;
    let totalCount = 0;

    await db.collection('team').where({
      creatorID: OPENID
    })
      .count()
      .then(res => {
        totalCount = res.total;
        totalPage = totalCount === 0 ? 0 : totalCount <= pageSize ? 1 : parseInt(totalCount / pageSize) + 1;
      })

    let curUserTeamsList = [];
    await db.collection('user')
      .doc(OPENID)
      .get()
      .then(res => {
        curUserTeamsList = res.data.teamsList || [];
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
      let sqlParams = {};
      switch (event.teamType) {
        case 1:
          // 我创建的
          sqlParams = {
            creatorID: OPENID
          }
          break;
        case 2:
          // 我加入的
          sqlParams = {
            _id: _.in(curUserTeamsList)
          }
          break;
        default:
          // 默认是 0
          sqlParams = {
            location: -1
          }
          break;
      }

      await db.collection('team')
        .where({
          ...sqlParams
        })
        .limit(pageSize)
        .skip((pageIndex - 1) * pageSize)
        .get()
        .then(res => {
          for (let i = 0; i < res.data.length; i++) {
            let arr = [];
            if (res.data[i].creatorID == OPENID) {
              // 是创建者
              arr.push(0);
            } else {
              if (curUserTeamsList.indexOf(res.data[i]._id) > -1) {
                // 已加入
                arr.push(1);
              } else {
                // 未加入
                arr.push(2);
              }
            }
            res.data[i].role = arr;
          }
          returnMsg.list = res.data;
        })
    }

    for (let i = 0; i < returnMsg.list.length; i++) {
      await db.collection('activity')
        .where({
          teamID: returnMsg.list[i].id
        })
        .limit(5)
        .get()
        .then(res => {
          returnMsg.list[i].activityInfoList = res.data;
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

// 加入战队
exports.joinTeamInfo = async (event) => {
  try {
    const _id = event.id;
    let { OPENID } = cloud.getWXContext();

    let teamsList = [];
    await db.collection('user')
      .doc(OPENID)
      .get()
      .then(res => {
        teamsList = res.data.teamsList || [];
      })

    const index = teamsList.indexOf(_id);
    if (index > -1) {
      return {
        success: false,
        message: '已加入该战队'
      }
    }

    teamsList.push(_id);
    await db.collection('user').doc(OPENID).update({
      data: {
        teamsList
      }
    })

    let userList = [];
    await db.collection('team')
      .doc(_id)
      .get()
      .then(res => {
        userList = res.data.userList || [];
      })

    userList.push(OPENID);
    await db.collection('team').doc(_id).update({
      data: {
        userList
      }
    })

    return {
      success: true,
      message: '加入成功'
    }
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
}

// 退出战队
exports.quitTeamInfo = async (event) => {
  try {
    const _id = event.id;
    let { OPENID } = cloud.getWXContext();

    let teamsList = [];
    await db.collection('user')
      .doc(OPENID)
      .get()
      .then(res => {
        teamsList = res.data.teamsList || [];
      })

    const index = teamsList.indexOf(_id);
    if (index < 0) {
      return {
        success: false,
        message: '未加入该战队'
      }
    }

    teamsList.splice(index, 1)
    await db.collection('user').update({
      data: {
        teamsList
      }
    })

    let userList = [];
    await db.collection('team')
      .doc(_id)
      .get()
      .then(res => {
        userList = res.data.userList || [];
      })

    const userIndex = userList.indexOf(_id);
    userList.splice(userIndex, 1)
    await db.collection('team').doc(_id).update({
      data: {
        userList
      }
    })

    return {
      success: true,
      message: '退出成功',
    }
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
}
