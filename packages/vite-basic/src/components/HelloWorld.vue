<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,
      <br>
      check out the
      <a href="https://vitejs.dev/guide/" target="_blank" rel="noopener">Vite documentation</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
