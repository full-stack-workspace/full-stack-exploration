<template>
  <div class="about">
    <h1>About Vite Basic</h1>
    <p class="intro">This is a Vue 3 project setup with Vite to learn the basics of Vite.</p>
    <h2>What you can learn here:</h2>
    <ul class="feature-list">
      <li class="feature-item">
        <span class="icon">⚙️</span>
        <span>Vite configuration</span>
      </li>
      <li class="feature-item">
        <span class="icon">💚</span>
        <span>Vue 3 + TypeScript integration</span>
      </li>
      <li class="feature-item">
        <span class="icon">🛣️</span>
        <span>Vue Router setup</span>
      </li>
      <li class="feature-item">
        <span class="icon">⚡</span>
        <span>Composables pattern</span>
      </li>
      <li class="feature-item">
        <span class="icon">🔥</span>
        <span>Hot Module Replacement (HMR)</span>
      </li>
      <li class="feature-item">
        <span class="icon">🎨</span>
        <span>SCSS preprocessor</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
// SCSS Variables
$primary-color: #42b983;
$bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$card-bg: #ffffff;
$text-primary: #2c3e50;
$text-secondary: #666;

.about {
  padding: 20px;

  h1 {
    background: $bg-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2.5rem;
    margin-bottom: 20px;
  }

  .intro {
    color: $text-secondary;
    font-size: 1.1rem;
    margin-bottom: 30px;
  }

  h2 {
    color: $text-primary;
    margin: 30px 0 20px;
  }
}

.feature-list {
  list-style: none;
  padding: 0;
  text-align: left;
  display: inline-block;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin: 10px 0;
  background: $card-bg;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  .icon {
    font-size: 1.5rem;
    margin-right: 15px;
  }

  span:last-child {
    color: $text-primary;
    font-size: 1.1rem;
  }

  &:hover {
    transform: translateX(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

// 使用 nth-child 改变不同项目的背景色
@each $color, $index in ( (#42b983, 1), (#646cff, 2), (#ff6b6b, 3), (#feca57, 4), (#48dbfb, 5), (#ff9ff3, 6) ) {
  &:nth-child(#{$index}) {
    border-left: 4px solid $color;
  }
}
}
</style>
