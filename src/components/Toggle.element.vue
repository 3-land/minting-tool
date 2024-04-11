<template>
  <div class="toggle-switch">
    <input type="checkbox" id="toggle" v-model="state" />
    <label for="toggle" :class="{ checked: state }"></label>
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: this.initialState,
    };
  },
  props: {
    initialState: {
      default: false,
    },
  },
};
</script>

<style scoped>
.toggle-switch {
  position: relative;
  width: 60px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 17px;
  width: 17px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + label {
  background-color: #4caf50;
}

input:checked + label:before {
  transform: translateX(35px);
}
</style>
