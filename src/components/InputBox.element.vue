<template>
  <div class="input-main-container">
    <input
      :placeholder="placeholder || ''"
      :value="value ?? (type == 'color' ? placeholder : null)"
      style="width: 100%; height: 100%"
    />
  </div>
</template>
<script>
export default {
  mixins: [],
  props: { placeholder: { default: false }, value: { default: null } },
  computed: {},
  methods: {},
};
</script>
<style>
.input-main-container {
  width: 100%;
}
</style>
