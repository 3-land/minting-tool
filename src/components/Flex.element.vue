<template>
  <div
    ref="base"
    v-observer:subtree.childList="scrolled"
    :class="{ vertical, grid }"
    class="box cont"
    :style="{ '--gap': gap }"
  >
    <slot></slot>
  </div>
</template>

<script>
// import { mix } from "@/components/mixin";
export default {
  mixins: [],

  props: {
    grid: {
      default: false,
    },
    vertical: {
      default: false,
    },
    gap: {
      default: "5px",
    },
  },
  mounted() {
    this.$refs.base.addEventListener("scroll", this.scrolled);
    this.scrolled();
  },
  methods: {
    scrolled() {
      if (!this.$refs?.base) return;
      const w = this.$refs.base.scrollWidth;
      const x = this.$refs.base.scrollLeft;
      const count = this.$refs.base.children.length;
      this.steps = count;
      this.selected = Math.round(x / (w / this.steps));
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.grid :deep(> *:not(.expandbox)) {
  width: auto !important;
  display: inline-flex !important;
  flex: 0 0 auto;
}

.grid {
  flex-wrap: wrap;
  overflow: hidden;
  align-items: flex-start;
}
.vertical {
  flex-direction: column;
}
.antivertical {
  flex-direction: column-reverse;
  justify-content: flex-end;
}
.cont:not(.vertical):not(.antivertical) {
  flex-direction: row;
}
.cont.vcenter {
  align-items: center;
}
.cont.vbottom {
  align-items: end;
}
.cont.hbottom {
  justify-content: end;
}
.cont.vtop {
  align-items: start;
}

.cont.spaced {
  justify-content: space-between;
}
.cont.htop {
  justify-content: start;
}
.cont.hcenter {
  justify-content: center;
}
.cont :deep(> *.flex) {
  flex: 1;
}
.cont :deep(> *.flex2) {
  flex: 2;
}
.cont :deep(> *.flex3) {
  flex: 3;
}
.cont {
  width: 100%;
  height: 100%;
  position: relative;

  height: auto;
  gap: var(--gap);
  position: relative;
  width: 100%;
  display: flex;
}
</style>
