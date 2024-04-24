<template>
  <div style="width: 100%; height: 200px; background-color: white">
    <wallet-multi-button></wallet-multi-button>
    <input :value="getAddress" />
    <ButtonBox label="test mint" @click="test_mint" />
  </div>
</template>
<script>
import { useWallet } from "solana-wallets-vue";
import { createTree, compressNFT } from "@/../library/mint";

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
    async test_mint() {
      const { publicKey, sendTransaction } = useWallet();
      const payer = publicKey.value;
      //const tree = createTree({ payer: publicKey.value, public_tree: true });
      const tree = "4k7xBH9oZhXn3Y1pvB6bdubTpbRkmg3S8XhfgvLf7NNN";
      const metadata_url = "https://arweave.net/SGhjoFOdsoLqSb8w8L2Ut552sZbP1rvlIkpMggFzXRQ";
      const creators = [
        {
          address: "77DqG6ve3yqc9THEapataFE9sPA7TftH7Mg7D3dmT2C3",
          royalty: 25,
        },
        {
          address: "7uWeETdYvLaBZDJ4fjSdk2Z8tgC3VSuMw9izUbnSXtGj",
          royalty: 25,
        },
        {
          address: "H7PFamuYUpzCRjns7aJbVepCDKkmuAqADa5drWFTNEVN",
          royalty: 25,
        },
        {
          address: "5Vqb6yAnM7gC1UzCEmLugVheuVa9Mfs4VfoowTf2JToa",
          royalty: 25,
        },
      ];
      // console.log(tree);
      // console.log(payer);

      const compressed = await compressNFT({
        payer: payer,
        tree: tree,
        treeDelegate: payer,
        metadataUrl: metadata_url,
        creatorWallets: creators,
      });

      console.log("-- compressed --");
      console.log(compressed);
    },
  },
};
</script>

<style scoped></style>
