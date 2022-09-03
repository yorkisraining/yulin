const getOpenId = require('./getOpenId/index');
const user = require('./user/index'); // 用户
const team = require('./teams/index'); // 战队
const activity = require('./activity/index'); // 活动

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getOpenId':
      return await getOpenId.main(event, context);

    // 新增用户
    case 'addUser':
      return await user.insert(event, context);
    // 查询用户
    case 'getUserInfo':
      return await user.getUserInfo(event, context);
    // 查询用户,多个
    case 'getUsers':
      return await user.getUsers(event, context);
    // 修改用户头像
    case 'changeAvatar':
      return await user.changeAvatar(event, context);
    // 修改用户信息
    case 'changeUserInfo':
      return await user.changeUserInfo(event, context);

    // 新增战队
    case 'addTeam':
      return await team.insert(event, context);
    // 修改战队信息
    case 'changeTeamInfo':
      return await team.changeTeamInfo(event, context);
    // 获取战队列表
    case 'getTeamPage':
      return await team.getTeamPage(event, context);
    // 获取战队信息
    case 'getTeamInfo':
      return await team.getTeamInfo(event, context);
    // 加入战队
    case 'joinTeamInfo':
      return await team.joinTeamInfo(event, context);
    // 退出战队
    case 'quitTeamInfo':
      return await team.quitTeamInfo(event, context);

    // 新增活动
    case 'addActivity':
      return await activity.insert(event, context);
    // 修改活动
    case 'changeAcitivityInfo':
      return await activity.changeAcitivityInfo(event, context);
    // 获取活动信息
    case 'getActivityInfo':
      return await activity.getActivityInfo(event, context);
    // 获取活动列表
    case 'getActivityPage':
      return await activity.getActivityPage(event, context);
  }
};
