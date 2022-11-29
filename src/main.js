import {createApp} from 'vue'
import App from './App.vue'

import {
    Plus,
    Crop,
    HelpFilled,
    Notification,
    Promotion,
    Picture,
    ChatDotSquare,
    Delete,
    Upload,
    Download
} from "@element-plus/icons";

const app = createApp(App);

app.component('Plus', Plus);
app.component('Crop', Crop);
app.component('HelpFilled', HelpFilled);
app.component('Notification', Notification);
app.component('Promotion', Promotion);
app.component('Picture', Picture);
app.component('ChatDotSquare', ChatDotSquare);
app.component('Delete', Delete);
app.component('Upload', Upload);
app.component('Download', Download);

app.mount('#app');