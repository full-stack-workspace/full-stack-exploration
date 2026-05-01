<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style lang="scss">
@use "sass:color";

$primary-color: #42b983;
$text-color: #2c3e50;
$font-stack: Avenir, Helvetica, Arial, sans-serif;

#app {
  font-family: $font-stack;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $text-color;
  margin-top: 60px;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: $text-color;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: color.adjust($text-color, $lightness: -10%);
    }

    &.router-link-exact-active {
      color: $primary-color;
    }
  }
}
</style>
