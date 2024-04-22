<template>
  <router-view />
  <GeneralSettings v-if="!isReady" @nft_data="manageNft" :data="nft" />
  <Review
    v-if="isReady && !minted && edit"
    :nft_data="nft"
    @mint="uploadAsset"
    @edit="handleEdit"
  />
  <Congratulations v-if="minted" :file="minted" />
</template>
<script>
export default {
  mixins: [],
  data() {
    return { nft: null, minted: null, edit: false };
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
      this.nft = data;
      this.edit = true;
    },
    handleEdit(data) {
      this.nft = data.data;
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
