<template>
  <footer class="footer">
    <div class="footer-content">
      <p class="footer-text">
        Copyright ©2020-2025 密码菌 All rights reserved. &nbsp;&nbsp;&nbsp;
        Powered by 
        <a 
          href="http://github.com/cipherpuzzles/ccxc-engine" 
          target="_blank" 
          class="footer-link"
        >
          CCXC Engine
        </a>
        &nbsp;&nbsp;&nbsp;
        <a 
          href="https://beian.miit.gov.cn/" 
          target="_blank" 
          class="footer-link"
        >
          京ICP备2021017804号-1
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid rgba(100, 255, 218, 0.2);
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.footer-text {
  color: #888888;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.footer-link {
  color: #64ffda;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #4dd0e1;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .footer-text {
    font-size: 0.8rem;
    line-height: 1.8;
  }
}
</style> 