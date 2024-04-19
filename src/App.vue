<template>
  <GeneralSettings v-if="!isReady" @nft_data="manageNft" />
  <Review v-if="isReady" :nft_data="nft" />
  <Congratulations v-if="isMinted" />
</template>
<script>
export default {
  mixins: [],
  data() {
    return { nft: null, isMinted: false };
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
      console.log(data);
      this.nft = data;
    },
  },
};
</script>

<style scoped></style>
