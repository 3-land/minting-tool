<template>
  <GeneralSettings v-if="!isReady" @nft_data="manageNft" />
  <Review v-if="isReady && !minted" :nft_data="nft" @mint="uploadAsset" />
  <Congratulations v-if="minted" :file="minted" />
</template>
<script>
export default {
  mixins: [],
  data() {
    return { nft: null, minted: null };
  },
  props: {},
  computed: {
    isReady() {
      if (this.nft != null) return true;
      return false;
    },
  },
  methods: {
    manageNft(data) {
      this.nft = data;
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
