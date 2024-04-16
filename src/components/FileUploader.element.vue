<template>
  <div
    class="file-container"
    @click="openFileExplorer(false)"
    @dragover.prevent
    @drop="onDrop($event, false)"
  >
    <div class="thumbnail">
      <span v-if="fileType == null">Upload Your File</span>
      <img
        v-if="fileType == 'image'"
        :src="fileSrc"
        alt="Uploaded file thumbnail"
      />
      <video v-if="fileType == 'video'" :src="fileSrc" ref="video" controls />
      <audio v-if="fileType == 'audio'" :src="fileSrc" ref="audio" controls />
      <TresCanvas v-if="fileType == '3d'" clear-color="#82DBC5">
        <TresPerspectiveCamera :args="[45, 120, 0.1, 1000]" />
        <OrbitControls />
        <Suspense>
          <GLTFModel :path="fileSrc" draco />
        </Suspense>
        <TresDirectionalLight
          :position="[-4, 8, 4]"
          :intensity="1.5"
          cast-shadow
        />
      </TresCanvas>
    </div>
    <input
      type="file"
      ref="fileInput"
      @change="onFileChange($event, false)"
      style="display: none"
    />
  </div>
  <div v-if="fileType == 'video' || fileType == 'audio'">
    <span>Cover</span>
    <div
      class="file-container"
      @click="openFileExplorer(true)"
      @dragover.prevent
      @drop="onDrop($event, true)"
    >
      <div class="thumbnail">
        <span v-if="!coverFileSrc">Upload the cover</span>
        <img :src="coverFileSrc" />
      </div>
      <input
        type="file"
        ref="fileCoverInput"
        @change="onFileChange($event, true)"
        style="display: none"
      />
    </div>
  </div>
</template>

<script>
import { OrbitControls } from "@tresjs/cientos";

export default {
  data() {
    return {
      fileSrc: null,
      coverFileSrc: null,
      fileType: null,
    };
  },
  methods: {
    openFileExplorer(cover) {
      if (!cover) {
        this.$refs.fileInput.click();
      }

      if (cover) {
        this.$refs.fileCoverInput.click();
      }
    },
    onFileChange(e, cover) {
      const file = e.target.files[0];
      console.log(file);
      if (file && !cover) {
        this.checkFileType(file);
        this.fileSrc = URL.createObjectURL(file);
        this.coverFileSrc = "";
      }
      if (file && cover) {
        this.coverFileSrc = URL.createObjectURL(file);
      }
    },
    onDrop(e, cover) {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && !cover) {
        this.checkFileType(file);
        this.fileSrc = URL.createObjectURL(file);
        this.coverFileSrc = "";
      }
      if (file && cover) {
        this.coverFileSrc = URL.createObjectURL(file);
      }
    },
    checkFileType(file) {
      this.fileType = file.type.includes("image")
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

<style>
.file-container {
  height: 325px;
  padding: 16px 16px 24px;
  cursor: pointer;
}
.thumbnail {
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
}
.thumbnail img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.thumbnail video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}
</style>
