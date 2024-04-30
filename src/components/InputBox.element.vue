<template>
  <div class="input-main-container">
    <div class="input-main-item">
      <input
        v-if="input_type != 'number' && input_type != 'textarea'"
        :placeholder="placeholder || ''"
        :value="value"
        @input="updateValue"
        style="
          width: 100% !important;
          height: 41px;
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
          color: getColor,
        }"
      />
      <!-- <div
      v-if="error && input_type != 'number' && input_type != 'textarea'"
      style="color: red; display: flex; align-items: center"
    >
      <div class="alert-container" />
      Missing Field
    </div> -->
      <div v-if="input_type == 'textarea'" style="height: 76px">
        <textarea
          v-if="input_type == 'textarea'"
          :placeholder="placeholder || ''"
          :value="value"
          @input="updateValue"
          style="
            width: 100% !important;
            height: 100%;
            border-radius: 4px;
            background-color: rgba(30, 30, 30, 0.1);
            padding: 12px;
            font-family: 'Inter', sans-serif;
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
        <!-- <div
        v-if="error && input_type == 'textarea'"
        style="color: red; display: flex"
      >
        <span class="alert-container" />Missing Field
      </div> -->
      </div>
      <div class="number-input" v-if="input_type == 'number'">
        <div class="input-item-container">
          <input
            type="number"
            :min="min"
            :max="max"
            :value="value"
            style="
              text-align: center;
              width: 100%;
              height: 40px;
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
          <button
            style="
              cursor: pointer;
              background-image: url('/src/assets/arrow.svg');
              height: 22px;
              width: 33px;
              scale: 0.8;
              border: none;
            "
            @click="increment"
          />
          <button
            style="
              cursor: pointer;
              background-image: url('/src/assets/arrow.svg');
              height: 22px;
              width: 33px;
              transform: rotate(180deg);
              scale: 0.8;
              border: none;
            "
            @click="decrement"
          />
        </div>
      </div>
    </div>
    <div
      v-if="error && input_type != 'number'"
      style="color: red; display: flex; align-items: center"
    >
      <div class="alert-container" />
      Missing Field
    </div>
  </div>
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
    text_color: { default: null },
  },
  computed: {
    getColor() {
      return this.text_color;
    },
  },
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
.alert-container {
  background-image: url("/src/assets/alert.svg");
  display: flex;
  background-position: center;
  background-repeat: no-repeat;
  width: 22px;
  margin-right: 12px;
  height: 22px;
}

.input-main-container {
  width: 100%;
  border-color: rgba(30, 30, 30, 1);
  display: flex !important;
  flex-wrap: wrap;
  gap: var(--gap);
  --gap: 12px;
}

.input-main-item {
  width: 100%;
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
.input-item-container {
  position: relative;
  width: 100%;
}
.input-item-container .percent-sign {
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
  height: fit-content;
}
.arrows button {
  z-index: 1;
  background-color: rgba(30, 30, 30, 1);
  color: white;
  border-radius: 0 4px 4px 0;
}
</style>
