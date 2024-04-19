<template>
  <div class="popup-container">
    <h1>{{ data.title }}</h1>
    <h3>{{ data.content }}</h3>
    <ButtonBox :label="data.button_msg" style="height: 41px" @click="action" />
  </div>
</template>
<script>
export default {
  mixins: [],
  data() {
    return {
      data: {
        title: this.title,
        content: this.content,
        button_msg: this.button_msg,
      },
    };
  },
  props: {
    title: {
      default: null,
    },
    content: {
      default: null,
    },
    button_msg: {
      default: null,
    },
  },
  computed: {},
  methods: {
    action() {
      this.$emit("action");
    },
  },
};
</script>
<style>
.popup-container {
  position: absolute;
  top: 40%;
  background-color: white;
  width: 350px;
  border-radius: 4px;
  padding: 12px;
  border: 1px solid rgb(30, 30, 30, 0.5);
}
</style>
