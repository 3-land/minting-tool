<template>
  <div class="main-config-container" @click="closeConfig">
    <div class="config-container" @click.stop.propagation>
      <div class="options-container">
        <label class="pill" :class="{ selected: picked === 'Mainnet' }">
          <input
            type="radio"
            id="mainnet"
            value="Mainnet"
            v-model="picked"
            @change="networkChange"
          />
          <span>Mainnet</span>
        </label>
        <label class="pill" :class="{ selected: picked === 'Devnet' }">
          <input
            type="radio"
            id="devnet"
            value="Devnet"
            v-model="picked"
            @change="networkChange"
          />
          <span>Devnet</span>
        </label>
        <label class="pill" :class="{ selected: picked === 'Custom' }">
          <input
            type="radio"
            id="custom"
            value="Custom"
            v-model="picked"
            @change="networkChange"
          />
          <span>Custom</span>
        </label>
      </div>

      <div class="config-item-container">
        <div style="color: white">Solana RPC</div>
        <InputBox
          id="rpc"
          :value="config?.data?.rpc"
          @update:value="inputChange($event, 'rpc')"
          ref="rpc"
          type="text"
          placeholder="Input your RPC"
          text_color="white"
          :disabled="picked !== 'Custom'"
        />
      </div>
      <div class="config-item-container">
        <div style="color: white">Arweave RPC</div>
        <InputBox
          id="arweave"
          :value="config.data?.arweave_rpc"
          @update:value="inputChange($event, 'arweave_rpc')"
          ref="arweave"
          type="text"
          placeholder="Input your Arweave RPC"
          text_color="white"
          :disabled="picked !== 'Custom'"
        />
      </div>
      <div class="config-item-container">
        <div style="color: white">Merkle Tree</div>
        <InputBox
          id="tree_address"
          :value="config.data?.tree_address"
          @update:value="inputChange($event, 'tree_address')"
          ref="tree_address"
          type="text"
          placeholder="Input your Tree Address"
          text_color="white"
        />
      </div>
      <div class="config-item-container">
        <ButtonBox
          @click="updateAllConfigs"
          label="Save All"
          style="height: 41px"
          :disabled="!isChanged"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  arweave_devnet_rpc,
  arweave_mainnet_rpc,
  devnet_tree,
  mainnet_tree,
  config as defaultConfig,
  solana_devnet_rpc,
  solana_mainnet_rpc,
} from "../../config";

export default {
  data() {
    return {
      config: this.getLocalConfig(),
      picked: this.getLocalConfig("network"),
      isChanged: false,
    };
  },
  methods: {
    inputChange(valor, name) {
      this.config.data[name] = valor;
      this.isChanged = true;
    },
    closeConfig() {
      this.$emit("closeConfig");
    },
    getLocalConfig(network) {
      let localConfig = localStorage.getItem("config");
      let config = JSON.parse(localConfig);
      if (network == "network") {
        return config.network;
      }
      if (localConfig) {
        return JSON.parse(localConfig);
      } else {
        localStorage.setItem("config", JSON.stringify(defaultConfig));
        return defaultConfig;
      }
    },
    updateAllConfigs() {
      const new_config = {
        data: {
          tree_address: this.config.data.tree_address,
          rpc: this.config.data.rpc,
          arweave_rpc: this.config.data.arweave_rpc,
        },
        network: this.picked,
      };
      localStorage.setItem("config", JSON.stringify(new_config));
      this.isChanged = false;
    },
    networkChange() {
      if (this.picked === "Mainnet") {
        this.config.data.rpc = solana_mainnet_rpc;
        this.config.data.tree_address = mainnet_tree;
        this.config.data.arweave_rpc = arweave_mainnet_rpc;
        this.$refs.rpc.$el.querySelector("input").disabled = true;
        this.$refs.arweave.$el.querySelector("input").disabled = true;
      } else if (this.picked === "Devnet") {
        this.config.data.rpc = solana_devnet_rpc;
        this.config.data.tree_address = devnet_tree;
        this.config.data.arweave_rpc = arweave_devnet_rpc;
        this.$refs.rpc.$el.querySelector("input").disabled = true;
        this.$refs.arweave.$el.querySelector("input").disabled = true;
      } else if (this.picked === "Custom") {
        this.config.data.rpc = defaultConfig.data.rpc;
        this.config.data.arweave_rpc = defaultConfig.data.arweave_rpc;
        this.$refs.rpc.$el.querySelector("input").disabled = false;
        this.$refs.arweave.$el.querySelector("input").disabled = false;
      }
      this.isChanged = true;
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
  display: flex;
  height: 100dvh;
  justify-content: center;
  align-items: center;
}
.config-container {
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.config-item-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pill {
  display: inline-block;
  padding: 10px 20px;
  margin: 5px;
  width: fit-content;
  border-radius: 4px;
  background-color: black;
  color: white;
  cursor: pointer;
}

.pill.selected {
  background-color: white;
  color: black;
}
.options-container {
  display: flex;
  flex-direction: column;
}

input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

@media (min-width: 620px) {
  .options-container {
    flex-direction: row;
  }
}
</style>
