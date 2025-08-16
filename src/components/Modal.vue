<template>
  <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" :style="{ minWidth: width }" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close" @click="handleClose">×</button>
      </div>
      <div class="modal-body">
        <!-- 如果有插槽内容，显示插槽；否则显示 content -->
        <slot>
          <p v-if="content">{{ content }}</p>
        </slot>
      </div>
      <div v-if="!hideFooter" class="modal-footer">
        <button class="modal-btn modal-btn-cancel" @click="handleClose">取消</button>
        <button class="modal-btn modal-btn-confirm" @click="handleConfirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认'
  },
  content: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '400px'
  },
  hideFooter: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}

const handleOverlayClick = () => {
  handleClose()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: #2a2a2a;
  border-radius: 8px;
  min-width: 400px;
  max-width: 90vw;
  border: 1px solid #444;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #444;
}

.modal-title {
  color: #ffffff;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.modal-close {
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  color: #e0e0e0;
  margin: 0;
  line-height: 1.6;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #444;
}

.modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.modal-btn-cancel {
  background: #444;
  color: #fff;
}

.modal-btn-cancel:hover {
  background: #555;
}

.modal-btn-confirm {
  background: #64ffda;
  color: #1a1a1a;
  font-weight: 500;
}

.modal-btn-confirm:hover {
  background: #4dd0e1;
}

@media (max-width: 480px) {
  .modal-content {
    min-width: auto;
    margin: 20px;
  }
}
</style> 