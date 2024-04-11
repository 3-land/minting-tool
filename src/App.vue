<template>
  <header>
    <span style="font-size: 20px">Time to mint</span>
    <span style="font-size: 40px">What would you like to create?</span>
    <span style="font-size: 14px">Start Creating your cNFT Editions</span>
    <div class="section-line" />
  </header>
  <body>
    <div class="details-container">
      <span style="font-size: 24px">Details</span>
      <FileUploader />
      <div class="input-container">
        <label>Name of your NFT<span style="color: #f23d4f">*</span></label>
        <InputBox class="input-item" placeholder="Artwork title" />
      </div>
      <div class="input-container">
        <label>Description<span style="color: #f23d4f">*</span></label>
        <InputBox
          class="input-item"
          placeholder="Description for your art"
          style="height: 70px"
        />
      </div>
      <div class="general-royalty-container">
        <label>Secondary royalty %</label>
        <span style="font-size: 14px; margin-top: 12px"
          >The percentage of future sales that will sent to the creators</span
        >
        <InputBox class="input-item" type="" />
      </div>
      <div class="input-container">
        <div class="add-traits-title">
          <span>Add traits</span>
          <Toggle :initialState="true" />
        </div>
        <div class="traits-container">
          <InputBox
            class="input-item"
            placeholder="e.g. Size"
            style="width: 45%"
          />
          <InputBox
            class="input-item"
            placeholder="e.g. Medium"
            style="width: 45%"
          />
        </div>
        <ButtonBox class="action-button" label="Add traits" />
      </div>
      <div class="section-line" />
    </div>
    <div class="collaboration-container">
      <span style="font-size: 24px">Collaboration</span>
      <div class="collaboration-titles">
        <span>Wallet</span>
        <span>Royalty Percentage</span>
      </div>
      <div class="royalty-container">
        <InputBox placeholder="Wallet" class="input-item" style="width: 45%" />
        <InputBox class="input-item" type="" style="width: 45%" />
      </div>
      <ButtonBox class="action-button" label="Add creator" />
    </div>
    <div class="footer-container">
      <ButtonBox class="next-button-container" label="Next" />
    </div>
  </body>
</template>
<script>
// import { InputBox } from "./components/InputBox.element.vue";
// import { ButtonBox } from "./components/ButtonBox.element.vue";
// import { FileUploader } from "./components/FileUploader.element.vue";
export default {
  mixins: [],
  props: {},
  computed: {},
  methods: {},
};
</script>

<style scoped>
header {
  display: flex;
  flex-direction: column;
  padding: 24px 24px 0 24px;
  gap: 16px;
  font-family: "Inter", sans-serif;
}
body {
  display: flex !important;
  flex-wrap: wrap;
  font-family: "Inter", sans-serif;
}
.section-line {
  border-bottom: 1px solid #000000;
  width: 100%;
  margin-top: 8px;
}
.details-container {
  padding: 24px 24px 0px 24px;
}
.general-royalty-container {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.add-traits-title {
  display: flex;
  justify-content: space-between;
}
.input-container {
  margin-bottom: 16px;
}
.input-item {
  margin-top: 12px;
}
.collaboration-container {
  padding: 24px;
  width: 100%;
}
.traits-container {
  display: flex;
  justify-content: space-between;
}
.collaboration-titles {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}
.royalty-container {
  display: flex;
  justify-content: space-between;
}
.action-button {
  margin-top: 24px;
  width: 100px;
  height: 35px;
}
.footer-container {
  margin-top: 24px;
  border-top: 1px solid lightgray;
  width: 100%;
  padding: 24px;
}
.next-button-container {
  height: 35px;
  border-radius: 16px;
}
</style>
