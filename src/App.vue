<template>
  <!-- <router-view /> -->
   {{nft}}
  <GeneralSettings v-if="!isReady" v-model:data="nft" />
  <Review
    v-if="isReady && !minted && edit"
    v-model:data="nft"
    @mint="uploadAsset"
    @edit="handleEdit"
  />
  <Congratulations v-if="minted" v-model:data="nft" :file="minted" />
</template>
<script>
export default {
  mixins: [],
  data() {
    return { nft: {name:"Hola"}, minted: null, edit: false };
  },
  props: {},
  computed: {
    isReady() {
      console.log(this.nft);
      if (this.nft != null && this.edit != false) return true;
      return false;
    },
  },
  methods: {
    manageNft(data) {
      this.nft = data;
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
