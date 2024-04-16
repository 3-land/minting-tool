<template>
  <div class="input-main-container">
    <input
      v-if="input_type != 'number'"
      :placeholder="placeholder || ''"
      :value="value"
      @input="updateValue"
      style="
        width: 100%;
        height: 100%;
        border: 1px solid rgba(30, 30, 30, 0.5);
        border-radius: 4px;
        background-color: rgba(30, 30, 30, 0.1);
      "
    />
    <div class="number-input" v-else>
      <div class="input-container">
        <input
          type="number"
          :min="min"
          :max="max"
          v-model="data_value"
          style="
            text-align: center;
            width: 100%;
            height: 39px;
            border: 1px solid rgba(30, 30, 30, 0.5);
            background-color: rgba(30, 30, 30, 0.1);
            border-radius: 4px;
          "
          @input="updateValue"
        />
        <span class="percent-sign">%</span>
      </div>
      <div class="arrows">
        <button style="cursor: pointer" @click="increment">▲</button>
        <button style="cursor: pointer" @click="decrement">▼</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mixins: [],
  data() {
    return {
      data_value: this.defaultValue,
      N: this.step,
      input_type: this.type,
    };
  },
  props: {
    placeholder: { default: false },
    value: { default: null },
    type: { default: null },
    defaultValue: { default: null },
    min: { default: null },
    max: { default: null },
    step: { default: null },
  },
  computed: {},
  methods: {
    increment() {
      if (this.data_value < 100) {
        this.data_value += this.N;
        this.$emit("update:value", this.data_value);
      }
    },
    decrement() {
      if (this.data_value - this.N >= 0) {
        this.data_value -= this.N;
        this.$emit("update:value", this.data_value);
      }
    },
    updateValue($event) {
      this.$emit("update:value", $event.target.value);
    },
  },
};
</script>

<style>
.input-main-container {
  width: 100%;
  border-color: rgba(30, 30, 30, 1);
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
.number-input {
  display: flex;
}
.input-container {
  position: relative;
  width: 100%;
}
.input-container .percent-sign {
  position: absolute;
  left: 65%;
  top: 50%;
  transform: translateY(-50%);
}
.arrows {
  display: flex;
  flex-direction: column;
  background-color: rgba(30, 30, 30, 1);
  border-radius: 4px;
}
.arrows button {
  z-index: 1;
  background-color: rgba(30, 30, 30, 1);
  color: white;
  border-radius: 0 4px 4px 0;
}
</style>
