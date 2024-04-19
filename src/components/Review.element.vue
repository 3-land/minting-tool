<template>
  <header style="text-align: center">
    <span style="font-size: 40px">Review</span>
    <span style="font-size: 14px"
      >Review and approve the details of your NFT</span
    >
  </header>
  <body>
    <div style="background-color: black; border-radius: 16px; width: 100%">
      <img
        height="100%"
        width="100%"
        :src="data.file.file.blob"
        style="border-radius: 16px; min-height: 335px"
      />
    </div>
    <div style="border: 1px solid lightgray; width: 100%; border-radius: 16px">
      <div class="general-container">
        <span style="width: 100%; padding: 24px; color: rgba(30, 30, 30, 0.5)"
          >Details</span
        >
        <span style="width: 100%; padding-left: 24px; font-size: 20px">{{
          data.name
        }}</span>
        <span style="padding: 24px">{{ data.description }}</span>
      </div>
      <div style="border: 1px solid lightgray; width: 100%; padding-top: 24px">
        <span style="padding: 24px; color: rgba(30, 30, 30, 0.5)">Traits</span>
        <div style="padding: 24px" v-for="(item, index) in data.traits">
          <span
            style="
              background-color: black;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              margin-right: 8px;
            "
            >{{ item.name }}</span
          >
          <span>{{ item.value }}</span>
        </div>
      </div>
      <div style="border: 1px solid lightgray; width: 100%; padding-top: 24px">
        <span style="padding: 24px; color: rgba(30, 30, 30, 0.5)"
          >Collaboration</span
        >
        <div style="padding: 24px" v-for="(item, index) in data.wallets">
          <span
            style="
              background-color: black;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              margin-right: 8px;
            "
            >{{ item.royalty }}%</span
          >
          <span>{{
            String(item.address).slice(0, String(item.address) / 2) + "..."
          }}</span>
        </div>
      </div>
    </div>
  </body>
  <div class="footer-container">
    <ButtonBox
      class="next-button-container"
      label="Next"
      :disabled="isReady"
      @click="goToReview()"
    />
  </div>
</template>
<script>
export default {
  mixins: [],
  data() {
    return { data: this.nft_data };
  },
  props: {
    nft_data: {
      default: null,
    },
  },
  computed: {},
  methods: {},
};
</script>

<style scoped>
body {
  margin: 32px;
  display: flex;
  justify-content: center;

  --gap: 24px;
  gap: var(--gap);
  display: flex;
  flex-wrap: wrap;
}

.general-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  border-radius: 16px;
}
.footer-container {
  margin-top: 24px;
  border-top: 1px solid lightgray;
  width: auto;
  padding: 24px;
}
</style>
