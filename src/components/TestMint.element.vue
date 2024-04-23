<template>
  <div style="width: 100%; height: 200px; background-color: white">
    <wallet-multi-button></wallet-multi-button>
    <input :value="getAddress" />
    <ButtonBox label="test mint" @click="test_mint" />
  </div>
</template>
<script>
import { useWallet } from "solana-wallets-vue";
import { createTree } from "@/../library/mint";

//4k7xBH9oZhXn3Y1pvB6bdubTpbRkmg3S8XhfgvLf7NNN

export default {
  mixins: [],
  data() {
    return { address: "..." };
  },
  props: {},
  computed: {
    getAddress() {
      const { publicKey } = useWallet();
      this.address = publicKey.value;
      return this.address;
    },
  },
  methods: {
    test_mint() {
      const { publicKey, sendTransaction } = useWallet();
      const payer = publicKey.value;
      const tree = createTree({ payer: publicKey.value, public_tree: true });
      console.log(tree);
      console.log(payer);
    },
  },
};
</script>

<style scoped></style>
