import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Announcements from '../views/Announcements.vue'
import Leaderboard from '../views/Leaderboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import MessagePage from '../views/MessagePage.vue'
import Activate from '../views/Activate.vue'
import EmailVerify from '../views/EmailVerify.vue'
import ChangePassword from '../views/ChangePassword.vue'
import Profile from '../views/Profile.vue'
import Group from '../views/Group.vue'
import ResetPassword from '../views/ResetPassword.vue'
import ResetPasswordConfirm from '../views/ResetPasswordConfirm.vue'
import SSO from '../views/SSO.vue'
import Article from '../views/Article.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: Announcements
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: Leaderboard
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/activate',
    name: 'Activate',
    component: Activate
  },
  {
    path: '/user/emailverify',
    name: 'EmailVerify',
    component: EmailVerify
  },
  {
    path: '/message',
    name: 'MessagePage',
    component: MessagePage
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/group',
    name: 'Group',
    component: Group
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/user/resetpass',
    name: 'ResetPasswordConfirm',
    component: ResetPasswordConfirm
  },
  {
    path: '/user/sso',
    name: 'SSO',
    component: SSO
  },
  {
    path: '/info/:path',
    name: 'Article',
    component: Article
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 