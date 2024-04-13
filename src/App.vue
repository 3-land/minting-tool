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
          v-model:value="value.name"
          class="input-item"
          placeholder="Artwork title"
        />
      </div>
      <div class="input-container">
        <label>Description<span style="color: #f23d4f">*</span></label>
        <InputBox
          v-model:value="value.description"
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
          style="width: 45%"
          :defaultValue="defaultPercentage"
          :step="5"
          v-model:value="value.royalties"
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
            v-for="(item, index) in getTraits"
            :key="index"
          >
            <InputBox
              :value="item.name"
              class="input-item"
              placeholder="e.g. Size"
              style="width: 45%"
              @update:value="handleTrait($event, index, 'name')"
            />
            <div
              style="display: flex; width: 45%; justify-content: space-between"
            >
              <InputBox
                :value="item.value"
                class="input-item"
                :style="{ width: index > 0 ? '65%' : '100%' }"
                placeholder="e.g. Medium"
                @update:value="handleTrait($event, index, 'value')"
              />
              <ButtonBox
                v-if="index > 0"
                icon="/src/assets/royaltiesDeleteButton.svg"
                color="rgba(30, 30, 30, 0.1)"
                @click="removeTrait(key)"
                style="
                  margin-top: 12px;
                  height: 43px;
                  width: 25%;
                  border: 1px solid rgba(30, 30, 30, 0.5);
                "
              />
            </div>
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
      <div
        class="traits-container"
        v-for="(item, index) in getWallets"
        :key="index"
      >
        <InputBox
          :value="item.address"
          class="input-item"
          placeholder="Wallet Address"
          style="width: 45%"
          @update:value="handleCreator($event, index, 'address')"
        />
        <div style="display: flex; width: 45%; justify-content: space-between">
          <InputBox
            class="input-item"
            type="number"
            :style="{ width: index > 0 ? '65%' : '100%' }"
            :defaultValue="defaultPercentage"
            :step="5"
            :value="value?.wallets[index]?.royalty"
            @update:value="handleCreator($event, index, 'royalty')"
          />
          <ButtonBox
            v-if="index > 0"
            icon="/src/assets/royaltiesDeleteButton.svg"
            color="rgba(30, 30, 30, 0.1)"
            @click="removeCreator(key)"
            style="
              margin-top: 12px;
              height: 43px;
              width: 25%;
              border: 1px solid rgba(30, 30, 30, 0.5);
            "
          />
        </div>
      </div>
      <ButtonBox
        class="action-button"
        label="Add creator"
        @click="addCreator()"
      />
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
    getWallets() {
      if (this.value?.wallets?.length > 0) {
        return this.value?.wallets;
      } else {
        this.value?.wallets?.push({ address: "", royalty: "" });
        return [{ address: "", royalty: "" }];
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
    handleTrait(event, index, key) {
      this.value.traits[index][key] = event;
    },
    addTrait(name, value) {
      this.value?.traits?.push({ name: "", value: "" });
    },
    removeTrait(position) {
      this.value?.traits?.splice(position, 1);
    },
    addCreator(address, royalty) {
      this.value?.wallets?.push({ address: "", royalty: "" });
    },
    removeCreator(position) {
      this.value?.wallets?.splice(position, 1);
    },
    handleCreator(event, index, key) {
      this.value.wallets[index][key] = event;
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
