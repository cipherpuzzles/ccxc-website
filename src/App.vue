<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div id="app">
    <Navbar />
    <main class="main-container">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e);
  background-attachment: fixed;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
