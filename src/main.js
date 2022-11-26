import {createApp} from 'vue'
import App from './App.vue'

import {Plus, Crop, HelpFilled, Notification, Promotion, Picture, ChatDotSquare} from "@element-plus/icons";

const app = createApp(App);


app.component('Plus', Plus);
app.component('Crop', Crop);
app.component('HelpFilled', HelpFilled);
app.component('Notification', Notification);
app.component('Promotion', Promotion);
app.component('Picture', Picture);
app.component('ChatDotSquare', ChatDotSquare);

app.mount('#app');