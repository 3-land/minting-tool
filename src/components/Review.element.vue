<template>
  <header style="text-align: center">
    <span style="font-size: 40px">Review</span>
    <span style="font-size: 14px"
      >Review and approve the details of your NFT</span
    >
  </header>
  <body>
    <div
      style="
        border: 1px dashed rgb(30, 30, 30, 0.5);
        border-radius: 4px;
        width: 100%;
        max-height: 344px;
        display: flex;
        justify-content: center;
      "
    >
      <img
        v-if="getType == 'image'"
        height="100%"
        width="100%"
        :src="data.file.file.blob"
        style="border-radius: 4px"
      />
      <video
        v-if="getType == 'video'"
        :src="data.file.file.blob"
        style="max-height: 100%; max-width: 100%"
        ref="video"
        controls
      />
      <audio
        v-if="getType == 'audio'"
        :src="data.file.file.blob"
        ref="audio"
        controls
      />
      <TresCanvas v-if="getType == '3d'" clear-color="#82DBC5">
        <TresPerspectiveCamera :args="[45, 120, 0.1, 1000]" />
        <OrbitControls />
        <Suspense>
          <GLTFModel :path="data.file.file.blob" draco />
        </Suspense>
        <TresDirectionalLight
          :position="[-4, 8, 4]"
          :intensity="1.5"
          cast-shadow
        />
      </TresCanvas>
    </div>
    <div
      v-if="getType == 'video' || getType == 'audio'"
      style="
        border: 1px dashed rgb(30, 30, 30, 0.5);
        border-radius: 4px;
        width: 100%;
        display: flex;
        justify-content: center;
      "
    >
      <img
        :src="data.file.cover.blob"
        style="max-width: 100%; max-height: 100%; border-radius: 4px"
      />
    </div>
    <div style="border: 1px solid lightgray; width: 100%; border-radius: 4px">
      <div class="general-container">
        <span style="width: 100%; padding: 24px; color: rgba(30, 30, 30, 0.5)"
          >Details</span
        >
        <span style="width: 100%; padding-left: 24px; font-size: 20px">{{
          data.name
        }}</span>
        <span style="padding: 24px">{{ data.description }}</span>
      </div>
      <div
        style="border-top: 1px solid lightgray; width: 100%; padding-top: 24px"
      >
        <span style="padding: 24px; color: rgba(30, 30, 30, 0.5)">Traits</span>
        <div style="display: flex; flex-wrap: wrap">
          <div style="padding: 24px" v-for="(item, index) in data.traits">
            <div
              style="
                color: rgb(30, 30, 30, 0.5);
                border: 1px solid black;
                padding: 4px 12px;
                border-radius: 4px;
                margin-right: 8px;
                width: fit-content;
                text-align: center;
              "
            >
              <span style="width: 100%; display: block; color: black">{{
                item.value
              }}</span>

              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
      <div
        style="border-top: 1px solid lightgray; width: 100%; padding-top: 24px"
      >
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
            String(item.address).slice(0, String(item.address).length / 2) +
            "..."
          }}</span>
        </div>
      </div>
    </div>
  </body>
  <div class="footer-container">
    <ButtonBox
      class="next-button-container"
      label="Next"
      @click="mintAsset()"
    />
  </div>
</template>
<script>
import { OrbitControls } from "@tresjs/cientos";

export default {
  mixins: [],
  emit: ["mint"],

  data() {
    return { data: this.nft_data };
  },
  props: {
    nft_data: {
      default: null,
    },
  },
  computed: {
    getType() {
      const type = this.checkFileType(this.data.file.file);
      return type;
    },
  },
  methods: {
    checkFileType(file) {
      return file.type.includes("image")
        ? "image"
        : file.type.includes("audio")
        ? "audio"
        : file.type.includes("video")
        ? "video"
        : file.name.includes(".glb")
        ? "3d"
        : null;
    },
    mintAsset() {
      console.log("mint");
      this.$emit("mint", this.data);
    },
  },
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
  border-radius: 4px;
}
.footer-container {
  margin-top: 24px;
  border-top: 1px solid lightgray;
  width: auto;
  padding: 24px;
}
</style>
