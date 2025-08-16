import request from '@/utils/request'
import axios from 'axios'
import { getUserId } from '@/utils/fingerprint'

/**
 * 获取验证码
 * @returns {Promise} 返回验证码图片和nonce
 */
export function getCaptcha() {
  return axios({
    url: `${import.meta.env.VITE_BACKEND_ROOT}/v1/getcaptcha`,
    method: 'get',
    responseType: 'blob'
  }).then(response => {
    const nonce = response.headers['x-captcha-nonce'] || response.headers['X-Captcha-Nonce']
    const imageBlob = response.data
    const imageUrl = URL.createObjectURL(imageBlob)
    return { imageUrl, nonce }
  })
}

/**
 * 用户注册
 * @param {Object} data 注册数据 { username, email, pass, code, nonce, userid }
 * @returns {Promise} 返回注册结果
 */
export function register(data) {
  return request({
    url: '/v1/user-reg',
    method: 'post',
    data
  })
}

/**
 * 用户登录
 * @param {Object} data 登录数据 { email, pass, code, nonce }
 * @returns {Promise} 返回登录结果
 */
export function login(data) {
  return request({
    url: '/v1/user-login',
    method: 'post',
    data: {
      email: data.email,
      pass: data.pass,
      code: data.code,
      nonce: data.nonce,
      userid: getUserId()
    }
  })
}

/**
 * 获取默认设置
 * @returns {Promise} 返回 project_name, start_time, start_type, guest_mode
 */
export function getDefaultSetting() {
  return request({
    url: '/v1/get-default-setting',
    method: 'post',
    data: {}
  })
}

/**
 * 开始比赛
 * @returns {Promise} 返回 start_prefix
 */
export function startCompetition() {
  return request({
    url: '/v1/start',
    method: 'post',
    data: {}
  })
}

/**
 * 发送激活邮件
 * @param {Object} data 激活数据 { email, code, nonce }
 * @returns {Promise} 返回激活结果
 */
export function sendActivationEmail(data) {
  return request({
    url: '/v1/user-email-activate',
    method: 'post',
    data: {
      email: data.email,
      code: data.code,
      nonce: data.nonce,
      userid: getUserId()
    }
  })
}

/**
 * 验证邮箱激活token
 * @param {string} token 激活token
 * @returns {Promise} 返回验证结果
 */
export function verifyEmailToken(token) {
  return request({
    url: '/v1/email-verify-check-token',
    method: 'post',
    data: {
      token: token
    }
  })
}

/**
 * 发送重置密码邮件
 * @param {Object} data 重置密码数据 { email, code, nonce }
 * @returns {Promise} 返回发送结果
 */
export function sendResetPasswordEmail(data) {
  return request({
    url: '/v1/send-reset-pass-email',
    method: 'post',
    data: {
      email: data.email,
      code: data.code,
      nonce: data.nonce,
      userid: getUserId()
    }
  })
}

/**
 * 验证重置密码token
 * @param {string} token 重置密码token
 * @returns {Promise} 返回验证结果，包含email字段
 */
export function checkResetPasswordToken(token) {
  return request({
    url: '/v1/reset-pass-check-token',
    method: 'post',
    data: {
      token: token
    }
  })
}

/**
 * 重置密码
 * @param {Object} data 重置密码数据 { token, pass, code, nonce }
 * @returns {Promise} 返回重置结果
 */
export function resetPassword(data) {
  return request({
    url: '/v1/reset-password',
    method: 'post',
    data: {
      token: data.token,
      pass: data.pass,
      code: data.code,
      nonce: data.nonce,
      userid: getUserId()
    }
  })
}

/**
 * 获取用户个人信息
 * @returns {Promise} 返回用户信息和组队信息
 */
export function getProfileInfo() {
  return request({
    url: '/v1/get-profileInfo',
    method: 'post',
    data: {}
  })
}

/**
 * 编辑用户信息
 * @param {Object} data 编辑数据 { username, profile, theme_color }
 * @returns {Promise} 返回编辑结果
 */
export function editUser(data) {
  return request({
    url: '/v1/edit-user',
    method: 'post',
    data
  })
}

/**
 * 创建队伍
 * @param {Object} data 创建队伍数据 { groupname, profile }
 * @returns {Promise} 返回创建结果
 */
export function createGroup(data) {
  return request({
    url: '/v1/create-group',
    method: 'post',
    data
  })
}

/**
 * 获取我的邀请列表
 * @returns {Promise} 返回邀请列表
 */
export function getMyInvites() {
  return request({
    url: '/v1/list-my-invite',
    method: 'post',
    data: {}
  })
}

/**
 * 拒绝邀请
 * @param {Object} data 拒绝邀请数据 { iid }
 * @returns {Promise} 返回拒绝结果
 */
export function declineInvite(data) {
  return request({
    url: '/v1/decline-invite',
    method: 'post',
    data
  })
}

/**
 * 接受邀请
 * @param {Object} data 接受邀请数据 { iid }
 * @returns {Promise} 返回接受结果
 */
export function acceptInvite(data) {
  return request({
    url: '/v1/accept-invite',
    method: 'post',
    data
  })
}

/**
 * 移除队员
 * @param {Object} data 移除队员数据 { uid }
 * @returns {Promise} 返回移除结果
 */
export function removeGroupMember(data) {
  return request({
    url: '/v1/remove-group-member',
    method: 'post',
    data
  })
}

/**
 * 编辑队伍信息
 * @param {Object} data 编辑队伍数据 { groupname, profile }
 * @returns {Promise} 返回编辑结果
 */
export function editGroup(data) {
  return request({
    url: '/v1/edit-group',
    method: 'post',
    data
  })
}

/**
 * 解散队伍
 * @returns {Promise} 返回解散结果
 */
export function deleteGroup() {
  return request({
    url: '/v1/delete-group',
    method: 'post',
    data: {}
  })
}

/**
 * 退出组队
 * @returns {Promise} 返回退出结果
 */
export function exitGroup() {
  return request({
    url: '/v1/exit-group',
    method: 'post',
    data: {}
  })
}

/**
 * 搜索无组队用户
 * @param {Object} data 搜索数据 { kw_uname }
 * @returns {Promise} 返回搜索结果
 */
export function searchNoGroupUser(data) {
  return request({
    url: '/v1/search-no-group-user',
    method: 'post',
    data
  })
}

/**
 * 发送邀请
 * @param {Object} data 发送邀请数据 { username }
 * @returns {Promise} 返回发送结果
 */
export function sendInvite(data) {
  return request({
    url: '/v1/send-invite',
    method: 'post',
    data
  })
}

/**
 * 获取已发出的邀请列表
 * @returns {Promise} 返回已发出的邀请列表
 */
export function getSentInvites() {
  return request({
    url: '/v1/list-sent-invites',
    method: 'post',
    data: {}
  })
}

/**
 * 取消邀请
 * @param {Object} data 取消邀请数据 { iid }
 * @returns {Promise} 返回取消结果
 */
export function invalidateInvite(data) {
  return request({
    url: '/v1/invalidate-invite',
    method: 'post',
    data
  })
}

/**
 * SSO检查
 * @param {Object} data SSO检查数据 { token, callback_url }
 * @returns {Promise} 返回SSO检查结果
 */
export function ssoCheck(data) {
  return request({
    url: '/v1/sso-check',
    method: 'post',
    data
  })
}

/**
 * SSO登录
 * @param {Object} data SSO登录数据 { userid }
 * @returns {Promise} 返回SSO登录结果
 */
export function ssoLogin(data) {
  return request({
    url: '/v1/sso-login',
    method: 'post',
    data
  })
}

/**
 * 获取排行榜信息
 * @returns {Promise} 返回排行榜数据
 */
export function getScoreboardInfo() {
  return request({
    url: '/v1/get-scoreboard-info',
    method: 'post',
    data: {}
  })
}

/**
 * 获取公告列表
 * @returns {Promise} 返回公告列表数据
 */
export function getAnnouncements() {
  return request({
    url: '/v1/get-announcement',
    method: 'post',
    data: {}
  })
}

/**
 * 获取文章内容
 * @param {string} path 文章路径
 * @returns {Promise} 返回文章内容和文章列表
 */
export function getArticle(path) {
  return request({
    url: '/v1/get-article',
    method: 'post',
    data: {
      path: path
    }
  })
} 