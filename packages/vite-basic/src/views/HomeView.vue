<template>
  <div class="home">
    <h1>Welcome to Vite Basic</h1>
    <HelloWorld msg="Hello Vue 3 + Vite" />
    <div class="counter-section">
      <h2>Counter Example</h2>
      <p>Count: {{ count }}</p>
      <div class="button-group">
        <button class="btn btn-increment" @click="increment">+</button>
        <button class="btn btn-decrement" @click="decrement">-</button>
        <button class="btn btn-reset" @click="reset">Reset</button>
      </div>
    </div>
    <div class="theme-section">
      <h2>Theme Example</h2>
      <p>Current theme: <span class="theme-badge">{{ theme }}</span></p>
      <button class="btn btn-theme" @click="toggleTheme">Toggle Theme</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue'
import { useCounter, useTheme } from '@/composables'

const { count, increment, decrement, reset } = useCounter(0)
const { theme, toggleTheme } = useTheme()
</script>

<style lang="scss" scoped>
@use "sass:color";

$primary-color: #42b983;
$success-color: #4caf50;
$warning-color: #ff9800;
$info-color: #2196f3;
$text-muted: #666;

.home {
  padding: 20px;
}

// Mixins
@mixin button-base {
  margin: 0 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.section-shared {
  margin-top: 40px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.counter-section {
  @extend .section-shared;

  .button-group {
    @include flex-center;
    gap: 10px;
  }

  .btn {
    &.btn-increment {
      @include button-base;
      background-color: $success-color;
      color: white;

      &:hover {
        background-color: color.adjust($success-color, $lightness: -10%);
        transform: translateY(-2px);
      }
    }

    &.btn-decrement {
      @include button-base;
      background-color: $warning-color;
      color: white;

      &:hover {
        background-color: color.adjust($warning-color, $lightness: -10%);
        transform: translateY(-2px);
      }
    }

    &.btn-reset {
      @include button-base;
      background-color: $info-color;
      color: white;

      &:hover {
        background-color: color.adjust($info-color, $lightness: -10%);
        transform: translateY(-2px);
      }
    }
  }
}

.theme-section {
  @extend .section-shared;

  .theme-badge {
    display: inline-block;
    padding: 4px 12px;
    background-color: $primary-color;
    color: white;
    border-radius: 20px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .btn-theme {
    @include button-base;
    background-color: $primary-color;
    color: white;
    margin-top: 10px;

    &:hover {
      background-color: color.adjust($primary-color, $lightness: -10%);
      transform: translateY(-2px);
    }
  }
}
</style>
