<template>
  <div
    style="display: flex; flex-wrap: wrap; text-align: center; margin-top: 45px"
  >
    <span style="width: 100%; font-size: 24px">Congratulations your</span>
    <span style="width: 100%; font-size: 60px">EDITIONS</span>
    <span style="width: 100%; font-size: 24px">has been created!</span>
  </div>
  <div style="display: flex; justify-content: center; margin-top: 95px">
    <div
      style="
        background-color: white;
        padding: 8px;
        border-radius: 16px;
        box-shadow: 0px 4px 8.6px 0px rgba(0, 0, 0, 0.15);
      "
    >
      <img
        v-if="getType == 'image'"
        style="
          background-color: black;
          width: 100%;
          height: 100%;
          border-radius: 16px;
        "
        :src="data.file.blob"
      />
      <video
        v-if="getType == 'video'"
        :src="data.file.blob"
        style="max-height: 100%; max-width: 100%"
        ref="video"
        controls
      />
      <audio
        v-if="getType == 'audio'"
        :src="data.file.blob"
        ref="audio"
        controls
      />
      <TresCanvas v-if="getType == '3d'" clear-color="#82DBC5">
        <TresPerspectiveCamera :args="[45, 120, 0.1, 1000]" />
        <OrbitControls />
        <Suspense>
          <GLTFModel :path="data.file.blob" draco />
        </Suspense>
        <TresDirectionalLight
          :position="[-4, 8, 4]"
          :intensity="1.5"
          cast-shadow
        />
      </TresCanvas>
    </div>
  </div>
</template>
<script>
export default {
  mixins: [],
  data() {
    return { data: this.file };
  },
  props: {
    file: {
      default: null,
    },
  },
  computed: {
    getType() {
      const type = this.checkFileType(this.data.file);
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
  },
};
</script>
<style></style>
