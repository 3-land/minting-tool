<template>
  <router-view />
  <!-- {{ nft }} -->
  <GeneralSettings v-if="!isReady" v-model:data="nft" @nft_data="manageNft" />
  <Review
    v-if="isReady && !minted && edit"
    v-model:nft_data="nft"
    @mint="uploadAsset"
    @edit="handleEdit"
  />
  <Congratulations v-if="minted" v-model:file="nft.file" :file="minted" />
</template>
<script>
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
  methods: {
    manageNft(data) {
      // this.nft = data;
      this.edit = true;
    },
    handleEdit() {
      this.edit = false;
    },
    uploadAsset(data) {
      this.minted = data.file;
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
