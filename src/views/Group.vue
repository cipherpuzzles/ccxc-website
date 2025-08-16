<template>
  <div class="page-container">
    <div class="group-container">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 未组队状态 -->
      <div v-else-if="!groupInfo" class="group-content">
        <!-- 提示信息 -->
        <div class="notice">
          <h2>请注意，您现在还未完成报名。</h2>
          <p>单人参赛也<strong>必须</strong>建立一个队伍！</p>
          <p>你可以选择建立队伍，或联系其他队伍的队长向你发送邀请。</p>
          <p>当你成为一个队伍的队长或队员时，表示你已经完成报名。</p>
        </div>
        
        <!-- 双栏布局 -->
        <div class="two-column">
          <!-- 左侧：建立新队伍 -->
          <div class="column">
            <h3>建立新队伍</h3>
            <form @submit.prevent="createNewGroup" class="create-form">
              <div class="form-group">
                <label for="groupname">队名</label>
                <input 
                  type="text" 
                  id="groupname"
                  v-model="newGroup.groupname"
                  placeholder="请输入队伍名称"
                  required
                />
              </div>
              <div class="form-group">
                <label for="profile">队伍简介</label>
                <textarea 
                  id="profile"
                  v-model="newGroup.profile"
                  placeholder="请输入队伍简介"
                  rows="4"
                ></textarea>
              </div>
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="creating"
              >
                {{ creating ? '创建中...' : '创建队伍' }}
              </button>
            </form>
          </div>
          
          <!-- 右侧：接受邀请 -->
          <div class="column">
            <h3>接受邀请</h3>
            <div class="invites-container">
              <div v-if="loadingInvites" class="loading-invites">
                加载邀请列表中...
              </div>
              <div v-else-if="invites.length === 0" class="no-invites">
                暂无邀请
              </div>
              <div v-else class="invites-list">
                <div 
                  v-for="invite in invites" 
                  :key="invite.iid"
                  class="invite-item"
                >
                  <div class="invite-info">
                    <p class="invite-text">
                      {{ invite.from_groupname }} （GID: {{ invite.from_gid }}）邀请了你
                    </p>
                    <p class="invite-time">
                      {{ formatTime(invite.create_time) }}
                    </p>
                  </div>
                  <div class="invite-actions">
                    <button 
                      @click="acceptInvitation(invite.iid)"
                      class="accept-btn"
                      :disabled="processingInvite"
                    >
                      接受
                    </button>
                    <button 
                      @click="declineInvitation(invite.iid)"
                      class="decline-btn"
                      :disabled="processingInvite"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 已组队状态 -->
      <div v-else class="group-content">
        <div class="group-info-section">
          <!-- 队伍基本信息 -->
          <div class="group-header">
            <h2>{{ groupInfo.groupname }}</h2>
            <p class="group-profile">{{ groupInfo.profile }}</p>
            <p class="member-count">队伍人数：{{ groupInfo.member_list.length }}</p>
          </div>
          
          <!-- 队员列表 -->
          <div class="members-section">
            <h3>队员列表</h3>
            <div class="members-list">
              <div 
                v-for="member in groupInfo.member_list" 
                :key="member.uid"
                class="member-card"
              >
                <div class="member-main">
                  <div 
                    class="member-avatar-wrapper"
                    :style="{ backgroundColor: member.theme_color }"
                  >
                    <img 
                      :src="`https://cn.cravatar.com/avatar/${member.avatar_hash}.png?d=identicon`"
                      :alt="member.username"
                      class="member-avatar"
                    />
                  </div>
                  <div class="member-info">
                    <div class="member-name-row">
                      <span class="member-name">{{ member.username }}</span>
                      <RoleBadge :roleid="member.roleid" />
                    </div>
                    <p class="member-profile">{{ member.profile || '暂无个人简介' }}</p>
                  </div>
                </div>
                                  <!-- 队长可以移除队员 -->
                  <div v-if="isCurrentUserCaptain && member.uid !== userStore.uid" class="member-actions">
                    <button 
                      @click="removeMember(member.uid, member.username)"
                      class="remove-btn"
                      :disabled="processingMember"
                    >
                      移除
                    </button>
                  </div>
              </div>
            </div>
          </div>
          
          <!-- 已发出的邀请列表 (仅队长可见) -->
          <div v-if="isCurrentUserCaptain && sentInvites.length > 0" class="sent-invites-section">
            <h3>已发出的邀请</h3>
            <div v-if="loadingSentInvites" class="loading-sent-invites">
              加载中...
            </div>
            <div v-else class="sent-invites-list">
              <div 
                v-for="invite in sentInvites" 
                :key="invite.iid"
                class="sent-invite-item"
              >
                <div class="sent-invite-info">
                  <p class="sent-invite-text">
                    已邀请 <strong>{{ invite.to_username }}</strong>
                  </p>
                  <p class="sent-invite-time">
                    {{ formatTime(invite.create_time) }}
                  </p>
                </div>
                <div class="sent-invite-actions">
                  <button 
                    @click="cancelInvitation(invite.iid)"
                    class="cancel-invite-btn"
                    :disabled="cancelingInvite"
                  >
                    取消邀请
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="group-actions">
            <!-- 队长操作 -->
            <div v-if="isCurrentUserCaptain" class="captain-actions">
              <button @click="showEditGroup" class="action-btn primary">
                编辑队伍信息
              </button>
              <button @click="showInviteMemberModal = true" class="action-btn primary">
                邀请队员
              </button>
              <button @click="showDisbandModal = true" class="action-btn danger">
                解散队伍
              </button>
            </div>
            <!-- 队员操作 -->
            <div v-else class="member-actions-row">
              <button @click="showExitModal = true" class="action-btn danger">
                退出组队
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 编辑队伍信息模态框 -->
      <Modal v-model="showEditGroupModal" title="编辑队伍信息" width="500px" :hide-footer="true">
        <form @submit.prevent="saveGroupInfo" class="edit-group-form">
          <div class="form-group">
            <label for="edit-groupname">队名</label>
            <input 
              type="text" 
              id="edit-groupname"
              v-model="editGroupForm.groupname"
              placeholder="请输入队伍名称"
              required
            />
          </div>
          <div class="form-group">
            <label for="edit-profile">队伍简介</label>
            <textarea 
              id="edit-profile"
              v-model="editGroupForm.profile"
              placeholder="请输入队伍简介"
              rows="4"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="showEditGroupModal = false" class="cancel-btn">
              取消
            </button>
            <button type="submit" class="save-btn" :disabled="savingGroup">
              {{ savingGroup ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </Modal>
      
      <!-- 邀请队员模态框 -->
      <Modal v-model="showInviteMemberModal" title="邀请队员" width="600px" :hide-footer="true">
        <div class="invite-member-content">
          <!-- 搜索区域 -->
          <div class="search-section">
            <div class="search-input-group">
              <input 
                type="text" 
                v-model="searchKeyword"
                placeholder="请输入用户名关键字"
                class="search-input"
                @keyup.enter="searchUsers"
              />
              <button 
                @click="searchUsers"
                class="search-btn"
                :disabled="searching || !searchKeyword.trim()"
              >
                {{ searching ? '搜索中...' : '搜索' }}
              </button>
            </div>
          </div>
          
          <!-- 搜索结果 -->
          <div class="search-results" v-if="searchResults.length > 0">
            <h4>搜索结果</h4>
            <div class="user-list">
              <div 
                v-for="user in searchResults" 
                :key="user.uid"
                class="user-item"
              >
                <div class="user-info">
                  <div 
                    class="user-avatar-wrapper"
                    :style="{ backgroundColor: user.theme_color }"
                  >
                    <img 
                      :src="`https://cn.cravatar.com/avatar/${user.avatar_hash}.png?d=identicon`"
                      :alt="user.username"
                      class="user-avatar"
                    />
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.username }}</div>
                    <div class="user-profile">{{ user.profile || '暂无个人简介' }}</div>
                  </div>
                </div>
                <button 
                  @click="sendInvitation(user.username)"
                  class="invite-btn"
                  :disabled="sendingInvite"
                >
                  {{ sendingInvite ? '发送中...' : '发送邀请' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- 无搜索结果 -->
          <div v-else-if="searchKeyword && !searching" class="no-results">
            <p>未找到匹配的用户</p>
          </div>
          
          <!-- 关闭按钮 -->
          <div class="modal-actions">
            <button @click="closeInviteModal" class="cancel-btn">
              关闭
            </button>
          </div>
        </div>
      </Modal>
      
      <!-- 解散队伍确认模态框 -->
      <Modal v-model="showDisbandModal" title="解散队伍" width="400px" :hide-footer="true">
        <div class="confirm-content">
          <p>确定要解散队伍吗？</p>
          <p class="confirm-warning">此操作不可恢复，所有队员将被移出队伍。</p>
          <div class="confirm-actions">
            <button @click="showDisbandModal = false" class="cancel-btn">
              取消
            </button>
            <button @click="disbandGroup" class="confirm-btn" :disabled="disbanding">
              {{ disbanding ? '解散中...' : '确定解散' }}
            </button>
          </div>
        </div>
      </Modal>
      
      <!-- 退出组队确认模态框 -->
      <Modal v-model="showExitModal" title="退出组队" width="400px" :hide-footer="true">
        <div class="confirm-content">
          <p>确定要退出当前队伍吗？</p>
          <p class="confirm-warning">退出后将无法参与比赛，除非重新组队。</p>
          <div class="confirm-actions">
            <button @click="showExitModal = false" class="cancel-btn">
              取消
            </button>
            <button @click="exitCurrentGroup" class="confirm-btn" :disabled="exiting">
              {{ exiting ? '退出中...' : '确定退出' }}
            </button>
          </div>
        </div>
      </Modal>
      
      <!-- 移除队员确认模态框 -->
      <Modal v-model="showRemoveMemberModal" title="移除队员" width="400px" :hide-footer="true">
        <div class="confirm-content">
          <p>确定要移除队员 <strong>{{ memberToRemove.username }}</strong> 吗？</p>
          <p class="confirm-warning">移除后该队员将无法参与比赛，除非重新组队。</p>
          <div class="confirm-actions">
            <button @click="showRemoveMemberModal = false" class="cancel-btn">
              取消
            </button>
            <button @click="confirmRemoveMember" class="confirm-btn" :disabled="processingMember">
              {{ processingMember ? '移除中...' : '确定移除' }}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message } from '@/utils/message'
import Modal from '@/components/Modal.vue'
import RoleBadge from '@/components/RoleBadge.vue'
import { 
  getProfileInfo, 
  createGroup, 
  getMyInvites, 
  declineInvite, 
  acceptInvite,
  removeGroupMember,
  editGroup,
  deleteGroup,
  exitGroup,
  searchNoGroupUser,
  sendInvite,
  getSentInvites,
  invalidateInvite
} from '@/api'

const router = useRouter()
const userStore = useUserStore()

// 检查登录状态
if (!userStore.isLoggedIn()) {
  message.error('请先登录')
  router.push('/login')
}

// 响应式数据
const loading = ref(true)
const groupInfo = ref({
  gid: 0,
  groupname: '',
  profile: '',
  member_list: []
});
const invites = ref([])
const loadingInvites = ref(false)
const creating = ref(false)
const processingInvite = ref(false)
const processingMember = ref(false)
const savingGroup = ref(false)
const disbanding = ref(false)
const exiting = ref(false)

// 模态框状态
const showEditGroupModal = ref(false)
const showInviteMemberModal = ref(false)
const showDisbandModal = ref(false)
const showExitModal = ref(false)
const showRemoveMemberModal = ref(false)

// 邀请功能相关
const searchKeyword = ref('')
const searchResults = ref([])
const searching = ref(false)
const sendingInvite = ref(false)
const sentInvites = ref([])
const loadingSentInvites = ref(false)
const cancelingInvite = ref(false)

// 移除队员相关
const memberToRemove = ref({ uid: null, username: '' })

// 创建队伍表单数据
const newGroup = ref({
  groupname: '',
  profile: ''
})

// 编辑队伍表单数据
const editGroupForm = ref({
  groupname: '',
  profile: ''
})

// 计算属性：判断当前用户是否为队长
const isCurrentUserCaptain = computed(() => {
  if (!groupInfo.value || !groupInfo.value.member_list || !userStore.uid) return false
  const currentUser = groupInfo.value.member_list.find(member => 
    member.uid === userStore.uid
  )
  return currentUser && currentUser.roleid === 3
})

// 获取用户信息和组队状态
async function fetchProfileInfo() {
  try {
    loading.value = true
    const response = await getProfileInfo()

    groupInfo.value = response.group_info
    // 如果没有组队，则获取邀请列表
    if (!groupInfo.value) {
      await fetchInvites()
    } else {
      // 如果已组队且是队长，获取已发出的邀请列表
      const currentUser = groupInfo.value.member_list?.find(member => 
        member.uid === userStore.uid
      )
      if (currentUser && currentUser.roleid === 3) {
        await fetchSentInvites()
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取邀请列表
async function fetchInvites() {
  try {
    loadingInvites.value = true
    const response = await getMyInvites()
    invites.value = response.result || []
  } catch (error) {
    console.error('获取邀请列表失败:', error)
  } finally {
    loadingInvites.value = false
  }
}

// 创建新队伍
async function createNewGroup() {
  if (!newGroup.value.groupname.trim()) {
    message.error('请输入队伍名称')
    return
  }
  
  try {
    creating.value = true
    const response = await createGroup({
      groupname: newGroup.value.groupname.trim(),
      profile: newGroup.value.profile.trim()
    })
    message.success('队伍创建成功！')
    // 重新获取用户信息
    await fetchProfileInfo()
  } catch (error) {
    console.error('创建队伍失败:', error)
  } finally {
    creating.value = false
  }
}

// 接受邀请
async function acceptInvitation(iid) {
  try {
    processingInvite.value = true
    const response = await acceptInvite({ iid })
    
    message.success('已成功接受组队邀请！')
    // 立即刷新页面以显示最新的组队状态
    window.location.reload()

  } catch (error) {
    console.error('接受邀请失败:', error)
  } finally {
    processingInvite.value = false
  }
}

// 拒绝邀请
async function declineInvitation(iid) {
  try {
    processingInvite.value = true
    const response = await declineInvite({ iid })

    message.success('已拒绝邀请')
    // 重新获取邀请列表
    await fetchInvites()

  } catch (error) {
    console.error('拒绝邀请失败:', error)
  } finally {
    processingInvite.value = false
  }
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

// 移除队员
function removeMember(uid, username) {
  memberToRemove.value = { uid, username }
  showRemoveMemberModal.value = true
}

// 确认移除队员
async function confirmRemoveMember() {
  try {
    processingMember.value = true
    await removeGroupMember({ uid: memberToRemove.value.uid })
    message.success(`已移除队员 ${memberToRemove.value.username}`)
    showRemoveMemberModal.value = false
    // 重新获取用户信息
    await fetchProfileInfo()
  } catch (error) {
    console.error('移除队员失败:', error)
  } finally {
    processingMember.value = false
  }
}

// 显示编辑队伍信息对话框
function showEditGroup() {
  editGroupForm.value = {
    groupname: groupInfo.value.groupname,
    profile: groupInfo.value.profile || ''
  }
  showEditGroupModal.value = true
}

// 保存队伍信息
async function saveGroupInfo() {
  if (!editGroupForm.value.groupname.trim()) {
    message.error('请输入队伍名称')
    return
  }
  
  try {
    savingGroup.value = true
    await editGroup({
      groupname: editGroupForm.value.groupname.trim(),
      profile: editGroupForm.value.profile.trim()
    })
    message.success('队伍信息保存成功')
    showEditGroupModal.value = false
    // 重新获取用户信息
    await fetchProfileInfo()
  } catch (error) {
    console.error('保存队伍信息失败:', error)
  } finally {
    savingGroup.value = false
  }
}

// 解散队伍
async function disbandGroup() {
  try {
    disbanding.value = true
    await deleteGroup()
    message.success('队伍已解散')
    showDisbandModal.value = false
    // 重新获取用户信息
    await fetchProfileInfo()
  } catch (error) {
    console.error('解散队伍失败:', error)
  } finally {
    disbanding.value = false
  }
}

// 退出组队
async function exitCurrentGroup() {
  try {
    exiting.value = true
    await exitGroup()
    message.success('已退出队伍')
    showExitModal.value = false
    // 重新获取用户信息
    await fetchProfileInfo()
  } catch (error) {
    console.error('退出队伍失败:', error)
  } finally {
    exiting.value = false
  }
}

// 搜索用户
async function searchUsers() {
  if (!searchKeyword.value.trim()) {
    message.error('请输入搜索关键字')
    return
  }
  
  try {
    searching.value = true
    const response = await searchNoGroupUser({ kw_uname: searchKeyword.value.trim() })
    searchResults.value = response.result || []
  } catch (error) {
    console.error('搜索用户失败:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// 发送邀请
async function sendInvitation(username) {
  try {
    sendingInvite.value = true
    await sendInvite({ username })
    message.success(`已向 ${username} 发送邀请`)
    // 重新获取已发出的邀请列表
    await fetchSentInvites()
    // 清空搜索结果
    searchResults.value = []
    searchKeyword.value = ''
  } catch (error) {
    console.error('发送邀请失败:', error)
  } finally {
    sendingInvite.value = false
  }
}

// 获取已发出的邀请列表
async function fetchSentInvites() {
  if (!isCurrentUserCaptain.value) return
  
  try {
    loadingSentInvites.value = true
    const response = await getSentInvites()
    sentInvites.value = response.result || []
  } catch (error) {
    console.error('获取已发出邀请列表失败:', error)
    sentInvites.value = []
  } finally {
    loadingSentInvites.value = false
  }
}

// 取消邀请
async function cancelInvitation(iid) {
  try {
    cancelingInvite.value = true
    await invalidateInvite({ iid })
    message.success('已取消邀请')
    // 重新获取已发出的邀请列表
    await fetchSentInvites()
  } catch (error) {
    console.error('取消邀请失败:', error)
  } finally {
    cancelingInvite.value = false
  }
}

// 关闭邀请模态框
function closeInviteModal() {
  showInviteMemberModal.value = false
  searchKeyword.value = ''
  searchResults.value = []
}

// 组件挂载时获取数据
onMounted(() => {
  fetchProfileInfo()
})
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
}

.group-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  width: 100%;
  max-width: 1200px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

h1 {
  color: #64ffda;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #ffffff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(100, 255, 218, 0.3);
  border-top: 4px solid #64ffda;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.group-content {
  min-height: 400px;
}

.notice {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.notice h2 {
  color: #ffc107;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.notice p {
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.column {
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 10px;
  border: 1px solid rgba(100, 255, 218, 0.1);
}

.column h3 {
  color: #64ffda;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  text-align: center;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #ffffff;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #64ffda;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #cccccc;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #64ffda, #00bcd4);
  color: #000000;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(100, 255, 218, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.invites-container {
  min-height: 300px;
}

.loading-invites,
.no-invites {
  text-align: center;
  color: #cccccc;
  padding: 2rem;
}

.invites-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.invite-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invite-info {
  flex: 1;
}

.invite-text {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.invite-time {
  color: #999999;
  font-size: 0.9rem;
  margin: 0;
}

.invite-actions {
  display: flex;
  gap: 0.5rem;
}

.accept-btn,
.decline-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.accept-btn {
  background: #4caf50;
  color: #ffffff;
}

.accept-btn:hover:not(:disabled) {
  background: #45a049;
}

.decline-btn {
  background: #f44336;
  color: #ffffff;
}

.decline-btn:hover:not(:disabled) {
  background: #da190b;
}

.accept-btn:disabled,
.decline-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.group-info-section {
  padding: 2rem;
}

.group-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
}

.group-header h2 {
  color: #64ffda;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.group-profile {
  color: #cccccc;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.member-count {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
}

.members-section {
  margin-bottom: 3rem;
}

.members-section h3 {
  color: #64ffda;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.member-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.member-card:hover {
  border-color: rgba(100, 255, 218, 0.4);
  box-shadow: 0 5px 15px rgba(100, 255, 218, 0.1);
}

.member-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.member-avatar-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
}

.member-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
}

.member-info {
  flex: 1;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.member-name {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
}

.member-profile {
  color: #cccccc;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.member-actions .remove-btn {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.member-actions .remove-btn:hover:not(:disabled) {
  background: #da190b;
  transform: translateY(-1px);
}

.member-actions .remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.group-actions {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(100, 255, 218, 0.2);
}

.captain-actions,
.member-actions-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #64ffda, #00bcd4);
  color: #000000;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(100, 255, 218, 0.4);
}

.action-btn.danger {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: #ffffff;
}

.action-btn.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(244, 67, 54, 0.4);
}

.edit-group-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: #666666;
  color: #ffffff;
}

.cancel-btn:hover {
  background: #555555;
}

.save-btn {
  background: linear-gradient(135deg, #64ffda, #00bcd4);
  color: #000000;
  font-weight: 600;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(100, 255, 218, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.invite-member-content {
  padding: 1.5rem;
  color: #ffffff;
}

.search-section {
  margin-bottom: 2rem;
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #64ffda;
}

.search-input::placeholder {
  color: #cccccc;
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #64ffda, #00bcd4);
  color: #000000;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(100, 255, 218, 0.3);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-results {
  margin-bottom: 2rem;
}

.search-results h4 {
  color: #64ffda;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.user-item:hover {
  border-color: rgba(100, 255, 218, 0.4);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.user-avatar-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.user-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-profile {
  color: #cccccc;
  font-size: 0.9rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.invite-btn {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.invite-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-1px);
}

.invite-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #cccccc;
}

.modal-actions {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(100, 255, 218, 0.2);
}

.sent-invites-section {
  margin-bottom: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(100, 255, 218, 0.2);
}

.sent-invites-section h3 {
  color: #64ffda;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-sent-invites {
  text-align: center;
  color: #cccccc;
  padding: 1rem;
}

.sent-invites-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sent-invite-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sent-invite-info {
  flex: 1;
}

.sent-invite-text {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.sent-invite-time {
  color: #999999;
  font-size: 0.9rem;
  margin: 0;
}

.sent-invite-actions {
  display: flex;
  gap: 0.5rem;
}

.cancel-invite-btn {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-invite-btn:hover:not(:disabled) {
  background: #da190b;
}

.cancel-invite-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-content {
  text-align: center;
  padding: 1rem;
}

.confirm-content p {
  color: #ffffff;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.confirm-warning {
  color: #ffc107;
  font-size: 0.95rem !important;
  margin-bottom: 2rem !important;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.confirm-btn {
  padding: 0.75rem 1.5rem;
  background: #f44336;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-btn:hover:not(:disabled) {
  background: #da190b;
  transform: translateY(-1px);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .group-container {
    padding: 2rem;
    margin: 1rem;
  }
  
  .two-column {
    grid-template-columns: 1fr;
  }
  
  .invite-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .invite-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .group-header h2 {
    font-size: 1.5rem;
  }
  
  .member-card {
    padding: 1rem;
  }
  
  .member-main {
    gap: 1rem;
  }
  
  .member-avatar-wrapper {
    width: 50px;
    height: 50px;
  }
  
  .member-avatar {
    width: 44px;
    height: 44px;
  }
  
  .member-name {
    font-size: 1rem;
  }
  
  .captain-actions,
  .member-actions-row {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .search-input-group {
    flex-direction: column;
  }
  
  .search-btn {
    width: 100%;
  }
  
  .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .user-info {
    width: 100%;
  }
  
  .user-profile {
    max-width: 100%;
  }
  
  .invite-btn {
    width: 100%;
  }
  
  .sent-invite-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .sent-invite-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 