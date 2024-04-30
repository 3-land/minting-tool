<template>
  <div class="main-config-container" @click="closeConfig">
    <div class="config-container" @click.stop.propagation>
      <div class="config-item-container">
        <!-- <label for="rpc">RPC:</label> -->
        <InputBox
          id="rpc"
          :value="config?.rpc"
          @update:value="inputChange($event, 'rpc')"
          ref="rpc"
          type="text"
          placeholder="Input your RPC"
          text_color="white"
        />
        <ButtonBox
          @click="updateConfig('rpc')"
          label="Update RPC"
          style="height: 41px"
        />
      </div>
      <div class="config-item-container">
        <!-- <label for="tree_address">Tree Address:</label> -->
        <InputBox
          id="tree_address"
          :value="config?.tree_address"
          @update:value="inputChange($event, 'tree_address')"
          ref="tree_address"
          type="text"
          placeholder="Input your Tree Address"
          text_color="white"
        />
        <ButtonBox
          @click="updateConfig('tree_address')"
          label="Update Tree"
          style="height: 41px"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { config as defaultConfig } from "../../config";

export default {
  data() {
    return {
      config: this.getLocalConfig(),
    };
  },
  methods: {
    inputChange(valor, name) {
      this.config[name] = valor;
    },
    closeConfig() {
      this.$emit("closeConfig");
    },
    getLocalConfig() {
      let localConfig = localStorage.getItem("config");
      if (localConfig) {
        return JSON.parse(localConfig);
      } else {
        localStorage.setItem("config", JSON.stringify(defaultConfig));
        return defaultConfig;
      }
    },
    updateConfig(key) {
      let current = JSON.parse(localStorage.getItem("config"));
      if (key == "rpc") {
        localStorage.setItem(
          "config",
          JSON.stringify({
            tree_address: current.tree_address,
            rpc: this.config[key],
          })
        );
      }

      if (key == "tree_address") {
        localStorage.setItem(
          "config",
          JSON.stringify({
            tree_address: this.config[key],
            rpc: current.rpc,
          })
        );
      }
    },
  },
};
</script>

<style>
.main-config-container {
  position: fixed;
  left: 0px;
  right: 0px;
  bottom: 0px;
  top: 0px;
  background: rgb(30, 30, 30, 0.5);
  z-index: 2;
  backdrop-filter: blur(5px);
  width: 100dvw;
}
.config-container {
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 25%;
}
.config-item-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
