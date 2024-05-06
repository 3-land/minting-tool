<template>
  <header>
    <div
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <span style="font-size: 20px; color: rgba(30, 30, 30, 0.5)"
        >Time to mint</span
      >
      <div style="display: flex; gap: 12px; align-items: center">
        <ButtonBox
          style="height: 41px; width: 41px"
          @click="openWindow"
          icon="./assets/github.svg"
        />
        <div>
          <ButtonBox
            style="height: 41px; width: 41px"
            @click="openConfig"
            icon="./assets/settings.svg"
          />
          <ConfigValues v-if="openConfiguration" @closeConfig="openConfig" />
        </div>
        <wallet-multi-button></wallet-multi-button>
      </div>
    </div>
    <span style="font-size: 40px">What would you like to create?</span>
    <span style="font-size: 14px">Create a cNFT</span>
    <div class="section-line" />
  </header>
  <div class="body_container">
    <div class="file-container">
      <span style="font-size: 24px; padding: 24px 0px 16px 24px">Details</span>
      <FileUploader
        :value="data.file"
        @update:value="inputChange($event, 'file')"
        :error="hasFile ? false : true"
        :error_cover="data.file?.cover ? false : true"
      />
    </div>
    <div class="general-container">
      <div class="details-container">
        <!-- <span style="font-size: 24px; width: 100%">Details</span>
        <FileUploader
          style="width: 100%"
          v-model:value="value.file"
          :error="hasFile ? false : true"
          :error_cover="hasCover ? false : true"
        /> -->
        <div class="input-container">
          <label>Name of your NFT<span style="color: #f23d4f">*</span></label>
          <InputBox
            :value="data?.name"
            @update:value="inputChange($event, 'name')"
            class="input-item"
            placeholder="Artwork title"
            :error="missing.name ? false : true"
          />
        </div>
        <div class="input-container">
          <label>Description<span style="color: #f23d4f">*</span></label>
          <InputBox
            :value="data?.description"
            type="textarea"
            class="input-item"
            placeholder="Description for your art"
            @update:value="inputChange($event, 'description')"
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
            :value="data?.royalties"
            @update:value="inputChange($event, 'royalties')"
            :step="5"
          />
        </div>
        <div class="input-container">
          <div class="add-traits-title">
            <span>Traits</span>
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
                style="
                  display: flex;
                  width: 45%;
                  justify-content: space-between;
                "
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
                  icon="/assets/royaltiesDeleteButton.svg"
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
              label="Add Trait"
              @click="addTrait()"
            />
          </div>
        </div>
        <div class="section-line" />
      </div>
      <div class="collaboration-container">
        <span style="font-size: 24px">Collaboration</span>
        <div class="collaboration-titles">
          <div>
            <span>Wallet</span>
          </div>
          <div style="width: 45%; position: relative">
            <span style="position: absolute; left: 0px"
              >Royalty Percentage</span
            >
          </div>
        </div>
        <div class="list-container">
          <div
            class="traits-container"
            v-for="(item, index) in getWallets"
            :key="index"
          >
            <InputBox
              :value="index < 1 ? item.address || getPublicKey : item.address"
              class="input-item"
              placeholder="Wallet Address"
              style="width: 45%"
              @update:value="handleCreator($event, index, 'address')"
              :error="missing.wallets[index]?.address ? false : true"
              :address_error="validateAddress(index) && item.address != ''"
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
                icon="/assets/royaltiesDeleteButton.svg"
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
          @click="goToReview()"
        />
      </div>
    </div>
  </div>
  <!-- <div>
    {{ missing }}
  </div>
  <div>
    {{ value }}
  </div> -->
</template>
<script>
import { useWallet } from "solana-wallets-vue";
import { validateSolAddress } from "../../library/src/utils";

export default {
  mixins: [],
  emits: ["nft_data"],
  data() {
    return {
      showTraits: false,
      openConfiguration: false,
      wrongAddress: [],

      defaultPercentage: 5,
      isReady: null,
      value: {
        file: { file: this.data?.file, cover: this.data?.cover } || null,
        name: this.data?.name || null,
        description: this.data?.description || null,
        royalties: this.data?.royalties ? this.data?.royalties : 5,
        traits: this.data?.traits || [],
        wallets: this.data?.wallets || [],
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
  props: {
    data: { default: null },
  },
  computed: {
    validateAddress() {
      this.value.wallets.map((wallet, index) => {
        if (!validateSolAddress(wallet.address)) {
          this.wrongAddress[index] = true;
        } else {
          this.wrongAddress[index] = false;
        }
      });

      return (index) => {
        return this.wrongAddress[index];
      };
    },
    getPublicKey() {
      const { publicKey } = useWallet();
      if (this.value.wallets[0].address != publicKey.value) {
        this.value.wallets[0].address = publicKey.value;
      }
      return publicKey.value;
    },
    hasFile() {
      if (this.value?.file?.file != null || this.missing?.file?.file != "") {
        console.log("tru");

        return true;
      }
      console.log("fols");
      return false;
    },
    hasCover() {
      if (this.value?.file?.file != null || this.missing?.file?.file != null) {
        if (
          this.data?.file?.cover != "" &&
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
    openConfig() {
      this.openConfiguration = !this.openConfiguration;
    },
    openWindow() {
      window.open("https://github.com/3-land/minting-tool", "_blank");
    },
    inputChange(valor, name) {
      this.missing[name] = valor;
      this.value[name] = valor;
      const v = { ...(this.data || {}), [name]: valor };
      this.$emit("update:data", v);
    },
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
      let canGo = true;

      this.value.wallets.map((wallet, index) => {
        if (!validateSolAddress(wallet.address)) {
          this.wrongAddress[index] = true;
          canGo = false;
        } else {
          this.wrongAddress[index] = false;
        }
      });

      for (const _value in this.value) {
        if (_value == "traits") {
          for (const _key in this.value.traits) {
            if (!this.value.traits[_key].name) {
              this.missing.traits[_key].name = "";
              canGo = false;
            }
            if (!this.value.traits[_key].value) {
              this.missing.traits[_key].value = "";
              canGo = false;
            }
          }
        }
        if (_value == "wallets") {
          for (const _key in this.value.wallets) {
            if (!this.value.wallets[_key].address) {
              this.missing.wallets[_key].address = "";
              canGo = false;
            }
            if (!this.value.wallets[_key].royalty) {
              this.missing.wallets[_key].royalty = "";
              canGo = false;
            }
          }
        }
        if (_value == "file") {
          if (!this.value?.file?.file) {
            this.missing.file.file = "";
            canGo = false;
          }
          if (this.value?.file?.cover == "") {
            this.missing.file.cover = "";
            canGo = false;
          }
        }
        if (!this.value[_value]) {
          this.missing[_value] = "";
          canGo = false;
        }
      }
      if (canGo) {
        this.$emit("nft_data", this.value);
      } else {
        console.log("something happened");
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
  /* display: flex !important; */
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

  --gap: 20px;
  gap: var(--gap);
  display: flex;
  flex-wrap: wrap;
}
.general-royalty-container {
  --gap: 12px;
  gap: var(--gap);
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
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
.file-container {
  /*height: fit-content;*/
}
.collaboration-container {
  padding: 24px 24px 0px 24px;
  /* width: 100%; */
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
  /* width: 100%; */
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
  flex-direction: column;
}
.general-container {
  width: 100%;
}

@media (min-width: 769px) {
  .body_container {
    display: flex;
    flex-wrap: nowrap;
  }
  .file-container {
    padding-left: 10%;
    display: block;
    padding: 24px;
  }
}
</style>
