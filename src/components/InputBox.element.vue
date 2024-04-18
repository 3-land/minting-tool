<template>
  <div
    class="input-main-container"
    :style="{ paddingBottom: error ? '12px' : '' }"
  >
    <input
      v-if="input_type != 'number'"
      :placeholder="placeholder || ''"
      :value="value"
      @input="updateValue"
      style="
        width: 100%;
        height: 100%;
        border-radius: 4px;
        background-color: rgba(30, 30, 30, 0.1);
        padding-left: 12px;
        box-sizing: border-box;
        outline: none;
      "
      :style="{
        border:
          error && input_type != 'number'
            ? '2px solid red'
            : '1px solid rgba(30, 30, 30, 0.5)',
      }"
    />
    <div v-if="error && input_type != 'number'" style="color: red;"
      >Missing Field</div
    >
    <div class="number-input" v-if="input_type == 'number'">
      <div class="input-container">
        <input
          type="number"
          :min="min"
          :max="max"
          :value="value"
          style="
            text-align: center;
            width: 100%;
            height: 39px;
            border: 1px solid rgba(30, 30, 30, 0.5);
            background-color: rgba(30, 30, 30, 0.1);
            border-radius: 4px;
          "
          :style="{
            border:
              error && input_type == 'number'
                ? '2px solid red'
                : '1px solid rgba(30, 30, 30, 0.5)',
          }"
          @input="updateValue"
        />
        <span class="percent-sign">%</span>
      </div>
      <div class="arrows">
        <button style="cursor: pointer;" @click="increment">▲</button>
        <button style="cursor: pointer" @click="decrement">▼</button>
      </div>
    </div>
  </div
  height: fit-contentv>
</template>

<script>
export default {
  mixins: [],
  data() {
    return {
      N: this.step,
      input_type: this.type,
      localValue: this.value, // Add this line
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
    error: { default: null },
  },
  computed: {},
  methods: {
    increment() {
      if (this.localValue < 100) {
        this.localValue += this.N;
        this.$emit("update:value", this.localValue);
      }
    },
    decrement() {
      if (this.localValue - this.N >= 0) {
        this.localValue -= this.N;
        this.$emit("update:value", this.localValue);
      }
    },
    updateValue($event) {
      this.localValue = $event.target.value;
      this.$emit("update:value", this.localValue);
    },
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
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
  height: fit-content
}
.arrows button {
  z-index: 1;
  background-color: rgba(30, 30, 30, 1);
  color: white;
  border-radius: 0 4px 4px 0;
}
</style>
