<template>
  <GeneralSettings v-if="isReady" />
  <Review v-if="!isReady" />
  <Congratulations v-if="!isReady" />
</template>
<script>
export default {
  mixins: [],
  data() {
    return { isReady: true };
  },
  props: {},
  computed: {},
  methods: {},
};
</script>

<style scoped></style>
