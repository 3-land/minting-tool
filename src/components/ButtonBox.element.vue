<template>
  <div class="main-button-container">
    <span v-if="getLabel" v-html="getLabel" />
  </div>
</template>
<script>
export default {
  mixins: [],
  props: {
    label: {
      default: null,
    },
  },
  computed: {
    getLabel() {
      return this.label;
    },
  },
  methods: {},
};
</script>
<style>
.main-button-container {
  background-color: rgba(30, 30, 30, 1);
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
