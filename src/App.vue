<script setup>
    import {ref, computed, watch, provide, nextTick, onMounted} from 'vue'
    import Dialogue from './Dialogue.vue'
    import html2canvas from 'html2canvas'
    import avatars from "./avatars";
    import message from './lib/message'
    import {copy} from "./lib/tool";
    import Announce from './Announce.vue'

    const showAnnouncement = ref(false);

    const characters = ref({});
    const textarea = ref('');
    const scroll = ref();
    const preScreenshot = ref(false);

    const currCharacter = ref('');
    const _showEditCharacter = ref(false);
    const createCharacter = ref(true);
    const showSelectAvatar = ref(false);
    const dialogWidth = Math.ceil(Math.min(document.body.clientWidth, 520) * 0.9);
    const newCharacter = ref({});
    const searchCharacter = ref('');

    const _showEditDialogue = ref(false);
    const currDialogue = ref(-1);
    const currDialogueData = ref({});
    const editDialogue = ref(true);

    provide('characters', characters);

    // characters.value.texas = {
    //     avatar: 'texas.png',
    //     name: '德克萨斯',
    //     right: trueF
    // };
    // characters.value.lappland = {
    //     avatar: 'lappland.png',
    //     name: '拉普兰德'
    // };

    const data = ref(
        [
            //     {
            //         right: true,
            //         thought: true,
            //         text: '叛徒的事莱昂图索自己会解决。',
            //         character: 'texas'
            //     },
            //     {
            //         right: true,
            //         thought: true,
            //         text: '空也已经确认没有遇上问题。',
            //         character: 'texas'
            //     },
            //     {
            //         right: true,
            //         thought: true,
            //         text: '那收音机是谁放的，又是什么意思？',
            //         character: 'texas'
            //     },
            //     {
            //         text: '耳边突然传来有些轻快的脚步声。',
            //     },
            //     {
            //         text: '绕了一大圈，我突然想起自己还要回来说点什么。',
            //         character: 'lappland'
            //     },
            //     {
            //         text: '破晓前最黑暗的时刻，数个小时前横陈在街上的尸体已经消失不见。',
            //     },
            //     {
            //         text: '拉普兰德自顾自的哼起一首小曲。',
            //     },
            //     {
            //         text: '收音机是我放的。',
            //         character: 'lappland'
            //     }
        ]
    );

    // for (let i = 0; i < 10; i++) {
    //     data.value.push({
    //         text: '哈哈哈哈哈哈哈哈哈哈哈',
    //         character: 'lappland'
    //     })
    // }

    for (let i = 0; i < data.value.length; i++) {
        data.value[i].id = Symbol()
    }

    function resize() {
        const el = document.getElementById('tare');
        el.style.height = '20px';
        const height = el.scrollHeight > 20 ? el.scrollHeight : 20;
        el.style.height = height + 'px';
        scrollHeight.value = window.innerHeight - height - 75 + 'px'
    }


    watch(textarea, resize);
    window.onresize = resize;

    const scrollHeight = ref(window.innerHeight - 95 + 'px');

    function createDialogue(thought) {
        if (textarea.value) {
            data.value.push({
                text: textarea.value,
                character: currCharacter.value,
                thought,
                id: Symbol()
            });
            textarea.value = '';
            nextTick(() => {
                resize();
                scroll.value.setScrollTop(10000)
            });
        }
    }

    function createImageDialogue(fileUpload) {
        const url = upload(fileUpload);
        if (url) {
            data.value.push({
                character: currCharacter.value,
                id: Symbol(),
                image: true,
                url
            });
            nextTick(() => {
                scroll.value.setScrollTop(10000)
            })
        }
        return false
    }

    function setCurr(id) {
        if (id === currCharacter.value) {
            currCharacter.value = ''
        } else {
            currCharacter.value = id
        }
    }

    const searchResult = computed(() => {
        if (searchCharacter.value) {
            const search = searchCharacter.value;
            const list = [];
            for (let i = 0; i < avatars.length; i++) {
                if (avatars[i].indexOf(search) !== -1) {
                    list.push(avatars[i])
                }
            }
            return list || false
        }
        return false
    });

    function showEditCharacter(create) {
        createCharacter.value = create;
        if (create) {
            newCharacter.value = {name: ''};
        } else {
            if (currCharacter.value) {
                newCharacter.value = characters.value[currCharacter.value];
            } else {
                message.notify('请选择角色', message.warning);
                return
            }
        }
        searchCharacter.value = '';
        _showEditCharacter.value = true
    }

    function uploadAvatar(uploadFile) {
        const url = upload(uploadFile);
        if (url) {
            newCharacter.value.avatar = url
        }
        return false
    }

    function upload(uploadFile) {
        let url = null;
        if (window.createObjectURL !== undefined) {
            url = window.createObjectURL(uploadFile)
        } else if (window.URL.createObjectURL !== undefined) {
            url = window.URL.createObjectURL(uploadFile)
        } else if (window.webkitURL !== undefined) {
            url = window.webkitURL.createObjectURL(uploadFile)
        }
        return url
    }

    function selectAvatar(src) {
        newCharacter.value.avatar = '/avatar/' + src + '.png';
        showSelectAvatar.value = false
    }

    function editCharacter() {
        if (createCharacter.value) {
            if (characters.value.hasOwnProperty(newCharacter.value.name)) {
                message.notify('角色名重复', message.error);
                return
            }
            if (newCharacter.value.name === '') {
                message.notify('名字是必须的', message.error);
                return
            }
            _showEditCharacter.value = false;
            characters.value[newCharacter.value.name] = copy(newCharacter.value);
            newCharacter.value = {name: ''};
            console.log(characters.value);
            message.notify('创建成功', message.success);
        } else {
            message.confirm(
                '即将删除该角色',
                '提示',
                () => {
                    delete characters.value[currCharacter.value];
                    for (let i = data.value.length - 1; i > -1; i--) {
                        if (data.value[i].character === currCharacter.value) {
                            data.value.splice(i, 1)
                        }
                    }
                    message.notify('删除成功', message.success);
                    _showEditCharacter.value = false;
                }
            )
        }
    }


    function showEditDialogue(index) {
        editDialogue.value = true;
        currDialogue.value = index;
        currDialogueData.value = data.value[currDialogue.value];
        _showEditDialogue.value = true
    }

    function switchEdit(edit) {
        editDialogue.value = edit;
        if (edit) {
            currDialogueData.value = data.value[currDialogue.value];
        } else {
            currDialogueData.value = {}
        }
    }

    function delDialogue() {
        message.confirm(
            '即将删除该对话',
            '提示',
            () => {
                data.value.splice(currDialogue.value, 1);
                message.notify('删除成功', message.success);
                _showEditDialogue.value = false
            }
        );
    }

    function insertDialogue() {
        if (!currDialogueData.value.character) {
            message.notify('请选择角色', message.warning);
            return
        }
        data.value.splice(currDialogue.value, 0, copy(currDialogueData.value));
        message.notify('插入成功', message.success);
        _showEditDialogue.value = false;
    }

    function screenshot() {
        preScreenshot.value = true;
        setTimeout(() => {
            html2canvas(document.getElementById('window')).then(canvas => {
                const el = document.createElement('a');
                el.download = 'screenshot.png';
                el.href = canvas.toDataURL();
                el.click();
                preScreenshot.value = false;
            })
        }, 100)
    }

    const showToolBar = ref(false);
    const toolBarMask = ref(true);
    if (window.innerWidth - 520 > 250) {
        showToolBar.value = true;
        toolBarMask.value = false
    } else {
        showToolBar.value = false;
        toolBarMask.value = true
    }

    const helpStep = ref(0)
    // TODO help
</script>


<template>
    <Announce v-model="showAnnouncement"/>
    <el-dialog v-model="_showEditCharacter" :title="createCharacter?'创建新角色':'编辑角色'" :width="dialogWidth">
        <div style="display: flex; flex-wrap: wrap">
            <div style="width: 100%; display: flex;">
                <el-upload
                        action="#"
                        drag
                        :show-file-list="false"
                        class="avatar-uploader"
                        accept="image/png, image/jpeg, image/gif"
                        :before-upload="uploadAvatar"
                >
                    <div class="container"><img v-if="newCharacter.avatar" :src="newCharacter.avatar"/>
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus/>
                        </el-icon>
                    </div>
                </el-upload>
                <div style="width: calc(100% - 100px); padding: 5px 0 0 10px">
                    名称：
                    <el-input v-model="newCharacter.name" style="margin-top: 10px"></el-input>
                    <div style="margin-top: 5px">
                        头像位置
                        <el-switch
                                v-model="newCharacter.right"
                                active-text="右"
                                inactive-text="左"
                                style="--el-switch-on-color: #a0cfff; --el-switch-off-color: #a0cfff"
                        ></el-switch>
                    </div>
                </div>
            </div>
            <div style="width: 100%; margin-top: 10px">
                <el-button style="width: 60%" @click="showSelectAvatar=true">从素材库中选择头像</el-button>
                <el-button style="width: calc(40% - 12px)" @click="editCharacter">{{createCharacter?'创建':'删除'}}
                </el-button>
            </div>
        </div>
    </el-dialog>
    <el-dialog v-model="showSelectAvatar" title="选择头像" :width="dialogWidth" top="10vh">
        <!--        素材库选择头像-->
        <el-input placeholder="输入角色名" v-model="searchCharacter"></el-input>
        <div v-if="searchResult" class="avatar-bar">
            <el-scrollbar max-height="50vh">
                <img v-for="src in searchResult" :key="src" :src="'/avatar/' + src + '.png'" loading="lazy" :title="src"
                     @click="selectAvatar(src)">
            </el-scrollbar>
        </div>
        <div v-else
             style="height: 150px; display: flex; justify-content: center; align-items: center; flex-flow: column;color: grey">
            <p>No Result</p>
            <p>Tips: 素材库仅包含干员/召唤物/装置头像</p>
        </div>
    </el-dialog>
    <el-dialog v-model="_showEditDialogue" :title="editDialogue?'编辑对话':'插入对话'" :width="dialogWidth">

        <el-input
                v-model="currDialogueData.text"
                :autosize="{minRows: 1, maxRows: 5}"
                resize="none"
                type="textarea"
                style="margin-bottom: 5px"
        ></el-input>
        <div class="edit-bar">
            <div style="width: 50%; margin-right: 2%; display: flex">
                <el-select v-model="currDialogueData.character" style="flex-grow: 1">
                    <el-option
                            v-for="(character, id) in characters"
                            :key="id"
                            :label="id"
                            :value="id"
                    />
                    <el-option
                            key=""
                            label="旁白"
                            value=""
                    />
                </el-select>
            </div>
            <div style="width: 23%; margin-right: 2%;">
                反向
                <el-switch
                        v-model="currDialogueData.opposite"
                ></el-switch>
            </div>
            <div style="width: 23%;">
                {{currDialogueData.character?'内心':'提示'}}
                <el-switch
                        v-model="currDialogueData.thought"
                ></el-switch>
            </div>
            <div v-if="editDialogue" style="width: 100%; margin-top: 5px">
                <el-button style="width: 50%" @click="delDialogue">删除</el-button>
                <el-button style="width: calc(50% - 5px); margin-left: 5px" @click="switchEdit(false)">向上插入</el-button>
            </div>
            <div v-else style="width: 100%; margin-top: 5px">
                <el-button style="width: 50%" @click="insertDialogue">插入</el-button>
                <el-button style="width: calc(50% - 5px); margin-left: 5px" @click="switchEdit(true)">返回</el-button>
            </div>
        </div>

    </el-dialog>
    <div class="drawer" :class="showToolBar?'show':''">
        <div class="bar" @click="screenshot">
            <el-icon color="lightgrey" :size="35">
                <Crop/>
            </el-icon>
            截屏
        </div>
        <div class="bar" @click="showAnnouncement=true">
            <el-icon color="lightgrey" :size="35">
                <Notification/>
            </el-icon>
            公告
        </div>
        <!--        <div class="bar">-->
        <!--            <el-icon color="lightgrey" :size="35">-->
        <!--                <HelpFilled/>-->
        <!--            </el-icon>-->
        <!--            帮助-->
        <!--        </div>-->
    </div>
    <div v-if="showToolBar && toolBarMask" @click="showToolBar=false" class="drawer-mask"></div>
    <el-scrollbar :height="scrollHeight" ref="scroll">
        <div class="body">
            <div class="window" id="window" :style="{width:(preScreenshot?'520px':'min(100vw, 520px)')}">
                <Dialogue v-for="(dialogue, index) in data" @edit="showEditDialogue"
                          :data="data[index]" :index="index" :key="dialogue.id"></Dialogue>
            </div>
            <div v-if="!preScreenshot" class="operateBar"
                 style="background: #B0B0B0"
            >
                <div class="button-bar">
                    <el-icon @click="createDialogue(false)" color="#707070" :size="35"
                             style="margin-right: 5px; position: relative">

                        <Picture/>
                        <el-upload
                                action="#"
                                :show-file-list="false"
                                class="avatar-uploader"
                                accept="image/png, image/jpeg, image/gif"
                                :before-upload="createImageDialogue"
                                style="position: absolute; width: 35px; height: 35px"
                        >
                            <div style="height: 35px; width: 35px; user-select: none">
                            </div>
                        </el-upload>
                    </el-icon>
                    <el-icon @click="createDialogue(true)" color="#707070" :size="35">
                        <ChatDotSquare/>
                    </el-icon>
                </div>
                <textarea class="textarea" id="tare" v-model="textarea"
                          @keydown.ctrl.enter="createDialogue(false)"></textarea>
                <div class="button-bar">

                    <el-icon @click="createDialogue(false)" color="#808080" :size="35">
                        <Promotion/>
                    </el-icon>
                </div>

                <div class="character-bar">
                    <el-scrollbar>
                        <div class="container">
                            <div v-for="(character, id) in characters" :key="id"
                                 :class="[id === currCharacter?'character-curr':'character']"
                                 @click="setCurr(id)">
                                <img :src="character.avatar">
                            </div>
                            <div class="option" style="background: #686868; position:relative;"
                                 @click="showEditCharacter(true)">

                                <svg class="roll" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                                     data-v-029747aa="" style="background: #707070">
                                    <path fill="#858585"
                                          d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-38.4 409.6H326.4a38.4 38.4 0 1 0 0 76.8h147.2v147.2a38.4 38.4 0 0 0 76.8 0V550.4h147.2a38.4 38.4 0 0 0 0-76.8H550.4V326.4a38.4 38.4 0 1 0-76.8 0v147.2z"></path>
                                </svg>
                            </div>
                            <div class="option"></div>

                        </div>
                    </el-scrollbar>
                    <div class="option edit">
                        <div v-if="currCharacter" style="width: 40px; height: 40px" @click="showEditCharacter(false)">
                            <svg class="roll" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                                 data-v-029747aa="">
                                <path fill="#606060"
                                      d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357.12 357.12 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a351.616 351.616 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357.12 357.12 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294.113 294.113 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293.12 293.12 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294.113 294.113 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288.282 288.282 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293.12 293.12 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a287.616 287.616 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256z"></path>
                            </svg>
                        </div>
                        <div v-else class="scale" @click="showToolBar=!showToolBar">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 16 16" focusable="false"
                                 style="stroke: #606060">
                                <path d="M14 3.5H2v1h12v-1zM14 7.5H2v1h12v-1zM14 11.5H2v1h12v-1z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-scrollbar>

</template>

<style scoped>
    .drawer {
        width: 80px;
        height: 100%;
        position: fixed;
        right: -100px;
        background: #404040;
        border-left: grey solid 1px;
        transition: right ease 0.5s;
        z-index: 404;
        padding: 5px;
    }

    .drawer.show {
        right: 0;
    }

    .drawer .bar {
        height: 50px;
        border-bottom: grey solid 1px;
        margin-bottom: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: lightgrey;
    }

    .drawer .bar svg {
        margin-right: 5px;
    }

    .drawer-mask {
        position: absolute;
        width: 100vw;
        height: 100vh;
        background: black;
        opacity: 0.5;
        z-index: 100;
    }
</style>

<style>
    :root {
        --witdh: min(100vw, 520px);
    }

    body {
        background: #353535;
    }

    body, html {
        margin: 0;
    }

    .avatar-uploader .el-upload-dragger {
        padding: 0;
    }

    .el-dialog__body {
        padding-top: 10px;
    }
</style>

<style scoped>
    .avatar-uploader {
        display: flex;
        width: 100px;
        height: 100px;
    }

    .avatar-uploader .el-upload {
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
    }

    .avatar-uploader .el-upload:hover {
        border-color: var(--el-color-primary);
    }

    .avatar-uploader .container {
        width: 98px;
        height: 98px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .avatar-uploader img {
        width: 100%;
        height: 100%;
    }

    .el-icon.avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
    }

    .avatar-bar {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        --witdh: calc(25% - 2px);
    }

    .avatar-bar img {
        width: var(--witdh);
        height: var(--witdh);
        margin: 1px;
    }

    .avatar-bar img:hover {
        width: calc(var(--witdh) - 2px);
        height: calc(var(--witdh) - 2px);;
        border: grey solid 1px;
    }

    .edit-bar {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
    }

    .operateBar {
        width: var(--witdh);
        position: fixed;
        display: flex;
        bottom: 0;
        flex-wrap: wrap;
        align-items: flex-end;
        border-radius: 10px 10px 0 0;
        overflow: hidden;
        border: white solid 1px;
        border-bottom: none;
    }

    .character-bar {
        position: relative;
        display: flex;
        width: 100%;
        height: 55px;
        background: #A0A0A0;
        margin-top: 4px;
        border-top: 1px solid lightgrey;
    }

    .character-bar .container {
        display: flex;
        align-items: center;
        width: calc(100% - 55px);
        height: 55px;
        flex-shrink: 0;
    }

    .character {
        flex-shrink: 0;
        margin: 0 2px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #808080;
        overflow: hidden;
    }

    .character-curr {
        flex-shrink: 0;
        margin: 0 2px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #505050;
        overflow: hidden;
        border: grey solid 1px;
    }

    .character:hover {
        background: #686868;
    }

    .character img {
        width: 50px;
        height: 50px;
    }

    .character-curr img {
        width: 48px;
        height: 48px;
    }

    .option {
        margin: 0 2px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        background: #A0A0A0;
    }

    .roll {
        transition: transform ease 1s;
    }

    .roll:hover {
        transform: rotate(180deg);
    }

    .scale {
        width: 40px;
        height: 40px;
        transition: all ease 5ms;
    }

    .scale:hover {
        width: 35px;
        height: 35px;
    }

    .edit {
        position: absolute;
        margin: 0;
        right: 0;
        align-self: center;
        border-radius: 0;
        border-left: lightgrey solid 1px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .textarea {
        border-radius: 0;
        outline: none;
        border: none;
        border-bottom: white solid 1px;
        color: white;
        font-size: 15px;
        height: 20px;
        width: calc(100% - 140px);
        padding: 0 0 1px 0;
        margin: 15px 0 5px 0;
        background-color: transparent;
        resize: none;
    }

    .button-bar {
        display: flex;
        align-items: center;
        height: 35px;
        flex-grow: 1;
        margin: 0 7px 3px 7px;
        align-self: flex-end;
    }

    .button-bar button {
        height: 100%;
        width: 48%;
        margin-right: 2%;
        background-color: transparent;
        border-radius: 1px;
        border: lightgrey solid 1px;
        box-shadow: 0 0 3px 1px grey;
        /*border: none;*/
    }

    .button-bar button:hover {
        background-color: #B0B0B0;
    }

    .body {
        height: 100%;
        display: flex;
        justify-content: center;
    }

    .window {
        height: 100%;
        position: relative;
        /*width: calc(var(--width));*/
        padding: 20px 10px 10px 10px;
        background: #353535;
    }
</style>
<style src="./font.css"></style>