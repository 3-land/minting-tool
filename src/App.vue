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
      console.log("upload");
      console.log(data);
      this.minted = data.file.file.blob;
    },
  },
};
</script>

<style scoped></style>
