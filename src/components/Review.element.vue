<template>
  <header>
    <span>Review</span>
    <span>Review and approve the details of your NFT</span>
  </header>
  <body>
    <div style="background-color: black; border-radius: 4px">
      <img height="335px" width="325px" style="border-radius: 4px" />
    </div>
    <div style="border: 1px solid lightgray; width: 100%; border-radius: 4px">
      <div
        style="
          border: 1px solid lightgray;
          width: 100%;
          display: flex;
          flex-wrap: wrap;
        "
      >
        <span style="width: 100%; padding: 24px">Details</span>
        <span style="width: 100%; padding: 24px">NFT Name</span>
        <span style="padding: 24px">Description</span>
      </div>
      <div style="border: 1px solid lightgray; width: 100%; padding-top: 24px">
        <span style="padding: 24px">Collaboration</span>
        <div style="padding: 24px">
          <span
            style="
              background-color: black;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              margin-right: 8px;
            "
            >50%</span
          >
          <span>BICCSjls3bfkjhsakjfh93huhie...</span>
        </div>
        <div style="padding: 24px">
          <span
            style="
              background-color: black;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              margin-right: 8px;
            "
            >50%</span
          >
          <span>BICCSjls3bfkjhsakjfh93huhie...</span>
        </div>
      </div>
    </div>
    <div class="footer-container">
      <ButtonBox
        class="next-button-container"
        label="Next"
        :disabled="isReady"
        @click="goToReview()"
      />
    </div>
  </body>
</template>
<script>
export default {
  mixins: [],
  data() {
    return {};
  },
  props: {},
  computed: {},
  methods: {},
};
</script>

<style scoped>
.footer-container {
  margin-top: 24px;
  border-top: 1px solid lightgray;
  width: 100%;
  padding: 24px;
}
</style>
