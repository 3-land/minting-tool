// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import ButtonBox from "./components/ButtonBox.element.vue";
import InputBox from "./components/InputBox.element.vue";
import FileUploader from "./components/FileUploader.element.vue";
import Toggle from "./components/Toggle.element.vue";

const app = createApp(App);

app
    .component('ButtonBox', ButtonBox)
    .component('InputBox', InputBox)
    .component('Toggle', Toggle)
    .component('FileUploader', FileUploader);

app.mount('#app');
