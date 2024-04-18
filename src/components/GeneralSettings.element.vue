<template>
  <header>
    <div
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <span style="font-size: 20px; color: rgba(30, 30, 30, 0.5)"
        >Time to mint</span
      >
      <wallet-multi-button></wallet-multi-button>
    </div>
    <span style="font-size: 40px">What would you like to create?</span>
    <span style="font-size: 14px">Create a cNFT</span>
    <div class="section-line" />
  </header>
  <body>
    <div class="details-container">
      <span style="font-size: 24px; width: 100%">Details</span>
      <FileUploader
        style="width: 100%"
        v-model:value="value.file"
        :error="hasFile ? false : true"
        :error_cover="hasCover ? false : true"
      />
      <div class="input-container">
        <label>Name of your NFT<span style="color: #f23d4f">*</span></label>
        <InputBox
          v-model:value="value.name"
          class="input-item"
          placeholder="Artwork title"
          @update:value="inputValue($event, 'name')"
          :error="missing.name ? false : true"
        />
      </div>
      <div class="input-container">
        <label>Description<span style="color: #f23d4f">*</span></label>
        <InputBox
          v-model:value="value.description"
          type="textarea"
          class="input-item"
          placeholder="Description for your art"
          @update:value="inputValue($event, 'description')"
          :error="missing.description ? false : true"
        />
      </div>
      <div class="general-royalty-container">
        <label>Secondary royalty %</label>
        <span style="font-size: 14px; color: rgba(30, 30, 30, 0.5)"
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
        <div v-if="showTraits" class="list-container">
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
              :error="missing.traits[index]?.name ? false : true"
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
                :error="missing.traits[index]?.value ? false : true"
              />
              <ButtonBox
                v-if="index > 0"
                icon="/src/assets/royaltiesDeleteButton.svg"
                color="rgba(30, 30, 30, 0.1)"
                @click="removeTrait(index)"
                style="
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
        <span style="position: absolute; right: 55px">Royalty Percentage</span>
      </div>
      <div class="list-container">
        <div
          class="traits-container"
          v-for="(item, index) in getWallets"
          :key="index"
        >
          <InputBox
            :value="index < 1 ? getPublicKey : item.address"
            class="input-item"
            placeholder="Wallet Address"
            style="width: 45%"
            @update:value="handleCreator($event, index, 'address')"
            :error="missing.wallets[index]?.address ? false : true"
          />
          <div
            style="
              display: flex;
              width: 45%;
              justify-content: space-between;
              align-self: baseline;
            "
          >
            <InputBox
              class="input-item"
              type="number"
              :style="{ width: index > 0 ? '65%' : '100%' }"
              :step="5"
              :value="item.royalty"
              @update:value="handleCreator($event, index, 'royalty')"
              :error="calculateTotalRoyalty"
            />
            <ButtonBox
              v-if="index > 0"
              icon="/src/assets/royaltiesDeleteButton.svg"
              color="rgba(30, 30, 30, 0.1)"
              @click="removeCreator(index)"
              style="
                height: 43px;
                width: 25%;
                border: 1px solid rgba(30, 30, 30, 0.5);
              "
            />
          </div>
        </div>
      </div>
      <h5 v-if="calculateTotalRoyalty" style="color: red; margin-top: 12px">
        Total royalties should add to 100%
      </h5>
      <ButtonBox
        class="action-button"
        label="Add creator"
        @click="addCreator()"
      />
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
  <!-- <div>
    {{ value }}
  </div> -->
</template>
<script>
import { useWallet } from "solana-wallets-vue";

export default {
  mixins: [],
  data() {
    return {
      showTraits: true,
      defaultPercentage: 5,
      isReady: null,
      value: {
        file: null,
        name: null,
        description: null,
        royalties: 5,
        traits: [],
        wallets: [],
      },
      missing: {
        file: { file: "empty", cover: "empty" },
        name: "empty",
        description: "empty",
        royalties: "empty",
        traits: [{ name: "empty", value: "empty" }],
        wallets: [{ address: "empty", royalty: "empty" }],
      },
    };
  },
  props: {},
  computed: {
    getPublicKey() {
      const { publicKey } = useWallet();
      return publicKey.value;
    },
    hasFile() {
      if (this.value?.file?.file != null || this.missing?.file?.file != null) {
        return true;
      }
      return false;
    },
    hasCover() {
      if (this.value?.file?.file != null || this.missing?.file?.file != null) {
        if (
          this.value?.file?.cover != "" &&
          this.missing?.file.cover == "empty"
        ) {
          return true;
        }
      }
      return false;
    },
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
        this.value?.wallets?.push({ address: "", royalty: 100 });
        return [{ address: "", royalty: 100 }];
      }
    },
    calculateTotalRoyalty() {
      const total_royalties = this.value?.wallets.reduce(
        (obj, value) => obj + Number(value.royalty),
        0
      );
      return total_royalties == 100 ? false : true;
    },
  },
  methods: {
    inputValue(e, type) {
      this.missing[type] = e;
    },
    updateShowTraits(value) {
      if (typeof value === "boolean") {
        this.showTraits = value;
        this.value.traits = [];
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
      this.missing.traits[index][key] = event;
    },
    addTrait(name, value) {
      this.value?.traits?.push({ name: "", value: "" });
      this.missing?.traits?.push({ name: "empty", value: "empty" });
    },
    removeTrait(position) {
      this.value?.traits?.splice(position, 1);
      this.missing?.traits?.splice(position, 1);
    },
    addCreator(address, royalty) {
      this.value?.wallets?.push({ address: "", royalty: 5 });
      this.missing?.wallets?.push({ address: "empty", royalty: "empty" });
      this.adjustRoyalties();
    },
    removeCreator(position) {
      this.value?.wallets?.splice(position, 1);
      this.missing?.wallets?.splice(position, 1);
      this.adjustRoyalties();
    },
    handleCreator(event, index, key) {
      this.value.wallets[index][key] = event;
      this.missing.wallets[index][key] = event;
    },
    adjustRoyalties() {
      const totalCreators = this.value.wallets.length;
      let remainingRoyalty = 100;

      this.value.wallets = this.value.wallets.map((wallet, index) => {
        let royalty;
        if (index === totalCreators - 1) {
          royalty = remainingRoyalty;
        } else {
          royalty = Math.ceil(remainingRoyalty / (totalCreators - index));
          remainingRoyalty -= royalty;
        }
        return { ...wallet, royalty };
      });
    },
    goToReview() {
      //Checks if there is any missing fields
      for (const _value in this.value) {
        if (_value == "traits") {
          for (const _key in this.value.traits) {
            if (!this.value.traits[_key].name) {
              this.missing.traits[_key].name = "";
            }
            if (!this.value.traits[_key].value) {
              this.missing.traits[_key].value = "";
            }
          }
        }
        if (_value == "wallets") {
          for (const _key in this.value.wallets) {
            if (!this.value.wallets[_key].address) {
              this.missing.wallets[_key].address = "";
            }
            if (!this.value.wallets[_key].royalty) {
              this.missing.wallets[_key].royalty = "";
            }
          }
        }
        if (_value == "file") {
          if (!this.value?.file?.file) {
            this.missing.file.file = "";
          }
          if (!this.value?.file?.cover) {
            this.missing.file.cover = "";
          }
        }
        if (!this.value[_value]) {
          this.missing[_value] = "";
        }
      }
    },
  },
};
</script>
<style>
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

  --gap: 12px;
  gap: var(--gap);
  display: flex;
  flex-wrap: wrap;
}
.general-royalty-container {
  --gap: 12px;
  gap: var(--gap);
  display: flex;
  flex-wrap: wrap;
}
.add-traits-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.input-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  --gap: 12px;
  width: 100%;
}
.input-item {
  display: block;
}
.collaboration-container {
  padding: 24px;
  width: 100%;
}
.traits-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.collaboration-titles {
  display: flex;
  justify-content: space-between;
  margin: 24px 0px;
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
.list-container {
  --gap: 12px;
  gap: var(--gap);
  display: flex;
  flex-wrap: wrap;
}
</style>
