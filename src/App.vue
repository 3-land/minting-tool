<template>
  <GeneralSettings v-if="!isReady" v-model:data="nft" @nft_data="manageNft" />
  <Review
    v-if="isReady && !minted && edit"
    v-model:nft_data="nft"
    @mint="uploadAsset"
    @edit="handleEdit"
  />
  <Congratulations
    v-if="minted"
    v-model:file="nft.file"
    :file="minted.asset.file"
    :cnft="minted.cnft"
  />
</template>
<script>
import {
  arweave_devnet_rpc,
  arweave_mainnet_rpc,
  devnet_tree,
  mainnet_tree,
  solana_devnet_rpc,
  solana_mainnet_rpc,
  config as defaultConfig,
} from "../config";

export default {
  mixins: [],
  data() {
    return {
      nft: {
        file: null,
        name: null,
        description: null,
        royalties: 5,
        traits: [],
        wallets: [],
      },
      minted: null,
      edit: false,
    };
  },
  props: {},
  computed: {
    isReady() {
      if (this.nft != null && this.edit != false) return true;
      return false;
    },
  },
  mounted() {
    let config = JSON.parse(localStorage.getItem("config"));
    if (!config) {
      config = {};
    }
    if (defaultConfig.network === "Mainnet") {
      config.solana_rpc = solana_mainnet_rpc;
      config.arweave_rpc = arweave_mainnet_rpc;
      config.tree = mainnet_tree;
      config.network = "Mainnet";
    } else if (defaultConfig.network === "Devnet") {
      config.solana_rpc = solana_devnet_rpc;
      config.arweave_rpc = arweave_devnet_rpc;
      config.tree = devnet_tree;
      config.network = "Devnet";
    }
    if (config) {
      localStorage.setItem("config", JSON.stringify(config));
    }
  },
  methods: {
    manageNft(data) {
      this.edit = true;
    },
    handleEdit() {
      this.edit = false;
    },
    uploadAsset(data) {
      this.minted = data;
    },
  },
};
</script>

<style scoped>
html,
body,
#app {
  margin: 0;
  padding: 0;
}
</style>
