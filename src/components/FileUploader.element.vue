<template>
  <div class="file-container">
    <div class="thumbnail">
      <span>Upload Your File</span>
    </div>
  </div>
</template>
<script>
export default {
  mixins: [],
  props: {},
  computed: {},
  methods: {},
};
</script>
<style>
.file-container {
  height: 325px;
  padding: 16px 16px 24px;
}
.thumbnail {
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
}
</style>
