<template>
  <div class="role-badge" :class="getRoleClass(roleid)">
    {{ getRoleText(roleid) }}
  </div>
</template>

<script setup>
// 定义props
const props = defineProps({
  roleid: {
    type: Number,
    required: true,
    default: 0
  }
})

// 获取角色文本
const getRoleText = (roleid) => {
  const roleTexts = {
    0: '未激活用户',
    1: '未报名',
    2: '队员',
    3: '队长',
    4: 'STAFF',
    5: '管理员'
  }
  
  if (roleid < 0) {
    return '已封禁'
  }
  
  return roleTexts[roleid] || '未知角色'
}

// 获取角色样式类
const getRoleClass = (roleid) => {
  if (roleid < 0) return 'role-banned'
  if (roleid === 0) return 'role-inactive'
  if (roleid === 1) return 'role-unregistered'
  if (roleid === 2) return 'role-member'
  if (roleid === 3) return 'role-leader'
  if (roleid === 4) return 'role-staff'
  if (roleid === 5) return 'role-admin'
  return 'role-unknown'
}
</script>

<style scoped>
.role-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
}

.role-inactive { 
  background: #666; 
  color: #fff; 
}

.role-unregistered { 
  background: #ff9800; 
  color: #fff; 
}

.role-member { 
  background: #4caf50; 
  color: #fff; 
}

.role-leader { 
  background: #2196f3; 
  color: #fff; 
}

.role-staff { 
  background: #9c27b0; 
  color: #fff; 
}

.role-admin { 
  background: #f44336; 
  color: #fff; 
}

.role-banned { 
  background: #424242; 
  color: #fff; 
}

.role-unknown { 
  background: #777; 
  color: #fff; 
}
</style> 