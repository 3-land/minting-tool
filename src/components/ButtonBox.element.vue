<template>
  <div
    class="main-button-container"
    :style="{ backgroundColor: color ? color : 'rgba(30, 30, 30, 1)' }"
  >
    <span v-if="getLabel" v-html="getLabel" />
    <img v-if="icon" :src="getIcon" />
  </div>
</template>
<script>
export default {
  mixins: [],
  props: {
    label: {
      default: null,
    },
    icon: {
      default: null,
    },
    color: {
      default: null,
    },
  },
  computed: {
    getLabel() {
      return this.label;
    },
    getIcon() {
      return this.icon;
    },
  },
  methods: {},
};
</script>
<style>
.main-button-container {
  /* background-color: rgba(30, 30, 30, 1); */
  width: 100%;
  display: flex;
  color: rgba(255, 255, 255, 1);
  justify-content: center;
  align-items: center;
  height: 35%;
  border-radius: 4px;
  cursor: pointer;
}
</style>
