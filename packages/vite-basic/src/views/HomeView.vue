<template>
  <div class="home">
    <h1>Welcome to Vite Basic</h1>
    <HelloWorld msg="Hello Vue 3 + Vite" />
    <div class="counter-section">
      <h2>Counter Example</h2>
      <p>Count: {{ count }}</p>
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
      <button @click="reset">Reset</button>
    </div>
    <div class="theme-section">
      <h2>Theme Example</h2>
      <p>Current theme: {{ theme }}</p>
      <button @click="toggleTheme">Toggle Theme</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue'
import { useCounter, useTheme } from '@/composables'

const { count, increment, decrement, reset } = useCounter(0)
const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.home {
  padding: 20px;
}

.counter-section,
.theme-section {
  margin-top: 40px;
}

button {
  margin: 0 5px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
