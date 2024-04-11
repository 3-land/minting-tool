<template>
  <img
    class="close-button"
    v-touch:tap="clicked"
    :src="thin ? '/web/thin_close.svg' : '/web/close.svg'"
  />
</template>

<script>
// import { mix } from "@/components/mixin";

export default {
  mixins: [],
  props: {
    thin: {
      default: false,
    },
  },
  methods: {
    clicked(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.galatic05?.app?.native?.haptics?.impact?.weak?.();
      this.$emit("clicked", e);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.close-button:hover {
  transform: translateY(-1px);
}
.close-button.themed {
  filter: invert(var(--theme-primary-invert));
}
.close-button {
  --ancho: 22px;
  min-width: var(--ancho);
  min-height: var(--ancho);
  width: var(--ancho);
  /* cursor: #{$clickCursor}; */
  height: var(--ancho);
  z-index: 1;
  user-select: none;
}
</style>
