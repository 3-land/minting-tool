<template>
  <img class="loader" :src="image" />
</template>

<script>
// import { mix } from "@/components/mixin";

export default {
  mixins: [],
  props: {
    image: {
      default: "/assets/connecting.svg",
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loader {
  width: 20px;
  height: 20px;
  animation: girar 2s linear infinite;
}
@keyframes girar {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
</style>
