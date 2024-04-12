<template>
  <header>
    <span style="font-size: 20px; color: rgba(30, 30, 30, 0.5)"
      >Time to mint</span
    >
    <span style="font-size: 40px">What would you like to create?</span>
    <span style="font-size: 14px">Create a cNFT</span>
    <div class="section-line" />
  </header>
  <body>
    <div class="details-container">
      <span style="font-size: 24px">Details</span>
      <FileUploader />
      <div class="input-container">
        <label>Name of your NFT<span style="color: #f23d4f">*</span></label>
        <InputBox
          @input="handleName"
          class="input-item"
          placeholder="Artwork title"
        />
      </div>
      <div class="input-container">
        <label>Description<span style="color: #f23d4f">*</span></label>
        <InputBox
          @input="handleDescription"
          class="input-item"
          placeholder="Description for your art"
          style="height: 70px"
        />
      </div>
      <div class="general-royalty-container">
        <label>Secondary royalty %</label>
        <span style="font-size: 14px; margin-top: 12px"
          >The percentage of future sales that will be sent to the
          creators</span
        >
        <InputBox
          class="input-item"
          type="number"
          style="width: 50%"
          :defaultValue="defaultPercentage"
          :step="5"
          @input="handleRoyalties"
        />
      </div>
      <div class="input-container">
        <div class="add-traits-title">
          <span>Add traits</span>
          <Toggle :value="showTraits" @input="updateShowTraits" />
        </div>
        <div v-if="showTraits">
          <div
            class="traits-container"
            v-for="(item, key) in getTraits"
            :key="key"
          >
            <InputBox
              :value="item.name"
              class="input-item"
              placeholder="e.g. Size"
              style="width: 45%"
              @update:value="handleTraitValue($event, key)"
            />
            <InputBox
              :value="item.value"
              class="input-item"
              placeholder="e.g. Medium"
              style="width: 45%"
              @input="handleTraitValue($event, key)"
            />
          </div>
          <ButtonBox
            class="action-button"
            label="Add traits"
            @click="addTrait()"
          />
        </div>
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
        <InputBox
          class="input-item"
          type="number"
          :defaultValue="defaultPercentage"
          :step="5"
          style="width: 45%"
        />
      </div>
      <ButtonBox class="action-button" label="Add creator" />
    </div>
    <div class="footer-container">
      <ButtonBox class="next-button-container" label="Next" />
    </div>
  </body>
  <div>
    {{ value }}
  </div>
</template>
<script>
export default {
  mixins: [],
  data() {
    return {
      showTraits: true,
      defaultPercentage: 5,
      value: {
        name: "",
        description: "",
        royalties: 5,
        traits: [],
        wallets: [],
      },
    };
  },
  props: {},
  computed: {
    getTraits() {
      if (this.value?.traits?.length > 0) {
        return this.value?.traits;
      } else {
        this.value?.traits?.push({ name: "", value: "" });
        return [{ name: "", value: "" }];
      }
    },
  },
  methods: {
    updateShowTraits(value) {
      if (typeof value === "boolean") {
        this.showTraits = value;
      }
    },
    handleName(event) {
      this.value.name = event?.target?.value;
    },
    handleDescription(event) {
      this.value.description = event?.target?.value;
    },
    handleRoyalties(event) {
      if (event.target) {
        this.value.royalties = Number(event?.target?.value);
      } else {
        this.value.royalties = event;
      }
    },
    handleTraitName(event, key) {
      console.log("traitname");
      console.log(event);
      this.value.traits[key].name = event?.target?.value;
    },
    handleTraitValue(event, key) {
      this.value.traits[key].value = event?.target?.value;
    },
    addTrait(name, value) {
      this.value?.traits?.push({ name: "", value: "" });
    },
  },
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
  align-items: center;
}
.input-container {
  margin-bottom: 16px;
}
.input-item {
  margin-top: 12px;
  height: 41px;
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
