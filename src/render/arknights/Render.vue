<script setup>
    import {ref, computed, watch, inject, nextTick} from 'vue'
    import Dialogue from './Dialogue.vue'
    import avatars from "@/avatars";
    import message from '@/lib/message'
    import {copy, uuid, downloadImage} from "@/lib/tool";

    const showAnnouncement = inject('showAnnouncement');
    const config = inject('config');
    const chars = inject('chars');
    const chats = inject('chats');

    const textarea = ref('');
    const scroll = ref();
    const preScreenshot = ref(false);

    const currChar = ref('');
    const _showEditChar = ref(false);
    const createChar = ref(true);
    const showSelectAvatar = ref(false);
    const dialogWidth = Math.ceil(Math.min(document.body.clientWidth, 520) * 0.9);
    const newChar = ref({name: ''});
    const searchChar = ref('');

    const _showEditDialogue = ref(false);
    const currDialogue = ref(-1);
    const currDialogueData = ref({});
    const editDialogue = ref(true);

    for (let i = 0; i < chats.value.length; i++) {
        chats.value[i].id = Symbol()
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

    function createDialogue(monologue) {
        if (textarea.value) {
            chats.value.push({
                char: currChar.value,
                content: textarea.value,
                type: monologue ? 'monologue' : 'chat',
                id: uuid()
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
            chats.value.push({
                char: currChar.value,
                content: url,
                type: 'image',
                id: uuid(),
            });
            nextTick(() => {
                scroll.value.setScrollTop(10000)
            })
        }
        return false
    }

    function setCurr(id) {
        if (id === currChar.value) {
            currChar.value = ''
        } else {
            currChar.value = id
        }
    }

    const searchResult = computed(() => {
        if (searchChar.value) {
            const search = searchChar.value;
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

    function showEditChar(create) {
        createChar.value = create;
        if (create) {
            newChar.value = {name: ''};
        } else {
            if (currChar.value) {
                newChar.value = chars.value[currChar.value];
            } else {
                message.notify('请选择角色', message.warning);
                return
            }
        }
        searchChar.value = '';
        _showEditChar.value = true
    }

    function uploadAvatar(uploadFile) {
        const url = upload(uploadFile);
        if (url) {
            newChar.value.avatar = url
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
        newChar.value.avatar = '/avatar/' + src + '.png';
        showSelectAvatar.value = false
    }

    function editChar() {
        if (createChar.value) {
            if (newChar.value.name === '') {
                message.notify('名字是必须的', message.error);
                return
            }
            _showEditChar.value = false;
            chars.value[uuid()] = copy(newChar.value);
            newChar.value = {name: ''};
            message.notify('创建成功', message.success);
        } else {
            message.confirm(
                '即将删除该角色',
                '提示',
                () => {
                    delete chars.value[currChar.value];
                    for (let i = chats.value.length - 1; i > -1; i--) {
                        if (chats.value[i].char === currChar.value) {
                            chats.value.splice(i, 1)
                        }
                    }
                    message.notify('删除成功', message.success);
                    _showEditChar.value = false;
                }
            )
        }
    }


    function showEditDialogue(index) {
        editDialogue.value = true;
        currDialogue.value = index;
        currDialogueData.value = chats.value[currDialogue.value];
        _showEditDialogue.value = true
    }

    function switchEdit(edit) {
        editDialogue.value = edit;
        if (edit) {
            currDialogueData.value = chats.value[currDialogue.value];
        } else {
            currDialogueData.value = {}
        }
    }

    function delDialogue() {
        message.confirm(
            '即将删除该对话',
            '提示',
            () => {
                chats.value.splice(currDialogue.value, 1);
                message.notify('删除成功', message.success);
                _showEditDialogue.value = false
            }
        );
    }

    function insertDialogue() {
        if (!currDialogueData.value.char) {
            message.notify('请选择角色', message.warning);
            return
        }
        chats.value.splice(currDialogue.value, 0, copy(currDialogueData.value));
        message.notify('插入成功', message.success);
        _showEditDialogue.value = false;
    }

    function screenshot() {
        preScreenshot.value = true;
        setTimeout(() => {
            downloadImage(document.getElementById('window'), () => {
                preScreenshot.value = false
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
</script>


<template>
    <div :class="config.style">
        <div class="render">
            <div id="body">
                <el-dialog v-model="_showEditChar" :title="createChar?'创建新角色':'编辑角色'" :width="dialogWidth">
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
                                <div class="container"><img v-if="newChar.avatar" :src="newChar.avatar"/>
                                    <el-icon v-else class="avatar-uploader-icon">
                                        <Plus/>
                                    </el-icon>
                                </div>
                            </el-upload>
                            <div style="width: calc(100% - 100px); padding: 5px 0 0 10px">
                                名称：
                                <el-input v-model="newChar.name" style="margin-top: 10px"></el-input>
                                <div style="margin-top: 5px">
                                    头像位置
                                    <el-switch
                                            v-model="newChar.right"
                                            active-text="右"
                                            inactive-text="左"
                                            style="--el-switch-on-color: #a0cfff; --el-switch-off-color: #a0cfff"
                                    ></el-switch>
                                </div>
                            </div>
                        </div>
                        <div style="width: 100%; margin-top: 10px">
                            <el-button style="width: 60%" @click="showSelectAvatar=true">从素材库中选择头像</el-button>
                            <el-button style="width: calc(40% - 12px)" @click="editChar">{{createChar?'创建':'删除'}}
                            </el-button>
                        </div>
                    </div>
                </el-dialog>
                <el-dialog v-model="showSelectAvatar" title="选择头像" :width="dialogWidth" top="10vh">
                    <!--        素材库选择头像-->
                    <el-input placeholder="输入角色名" v-model="searchChar"></el-input>
                    <div v-if="searchResult" class="avatar-bar">
                        <el-scrollbar max-height="50vh">
                            <img v-for="src in searchResult" :key="src" :src="'/avatar/' + src + '.png'" loading="lazy"
                                 :title="src"
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
                            <el-select v-model="currDialogueData.char" style="flex-grow: 1">
                                <el-option
                                        v-for="(char, id) in chars"
                                        :key="id"
                                        :label="char.name"
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
                            {{currDialogueData.char?'内心':'提示'}}
                            <el-switch
                                    v-model="currDialogueData.monologue"
                            ></el-switch>
                        </div>
                        <div v-if="editDialogue" style="width: 100%; margin-top: 5px">
                            <el-button style="width: 50%" @click="delDialogue">删除</el-button>
                            <el-button style="width: calc(50% - 5px); margin-left: 5px" @click="switchEdit(false)">向上插入
                            </el-button>
                        </div>
                        <div v-else style="width: 100%; margin-top: 5px">
                            <el-button style="width: 50%" @click="insertDialogue">插入</el-button>
                            <el-button style="width: calc(50% - 5px); margin-left: 5px" @click="switchEdit(true)">返回
                            </el-button>
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
                            <Dialogue v-for="(dialogue, index) in chats" @edit="showEditDialogue"
                                      :data="chats[index]" :index="index" :key="dialogue.id"></Dialogue>
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

                            <div class="char-bar">
                                <el-scrollbar>
                                    <div class="container">
                                        <div v-for="(char, id) in chars" :key="id"
                                             :class="[id === currChar?'char-curr':'char']"
                                             @click="setCurr(id)">
                                            <img :src="char.avatar">
                                        </div>
                                        <div class="option" style="background: #686868; position:relative;"
                                             @click="showEditChar(true)">

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
                                    <div v-if="currChar" style="width: 40px; height: 40px"
                                         @click="showEditChar(false)">
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
            </div>
        </div>
    </div>

</template>

<style src=".global.css"></style>
<style src=".scoped.css" scoped></style>
