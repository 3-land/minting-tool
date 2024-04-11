import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import ButtonBox from "./components/ButtonBox.element.vue";
import InputBox from "./components/InputBox.element.vue";
import FileUploader from "./components/FileUploader.element.vue";
import Toggle from "./components/Toggle.element.vue";
import Flex from "./components/Flex.element.vue";
import Exit from "./components/Exit.element.vue";

const app = createApp(App);

app
    .component('ButtonBox', ButtonBox)
    .component('InputBox', InputBox)
    .component('Toggle', Toggle)
    // .component('Flex', Flex)
    // .component('Exit', Exit)
    .component('FileUploader', FileUploader);

app.mount('#app');
