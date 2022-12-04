<script setup>
    import {ref, computed, watch, inject, provide, nextTick, onMounted} from 'vue'
    import Dialogue from './Dialogue.vue'
    import Settings from './Setting.vue'
    import message from '@/lib/message'
    import {copy, uuid, downloadImage, download, blob2url, blob2base64, image2square} from "@/lib/tool";

    const TypeDict = {
        chat: '对话',
        monologue: '独白',
        image: '图片'
    };

    const ifShowAnnouncement = inject('ifShowAnnouncement');
    const config = inject('config');
    const chars = inject('chars');
    const chats = inject('chats');
    const images = inject('images');
    const save = inject('save');
    const setData = inject('setData');
    const settings = ref({});
    const width = ref({});
    const windowWidth = Math.min(520, document.body.clientWidth);
    provide('settings', settings);
    provide('width', width);

    const charDirection = computed(() => {
        const dict = chars.value;
        let left = false;
        let right = false;
        for (let char in dict) {
            if (dict.hasOwnProperty(char)) {
                if (dict[char].right) {
                    right = true
                } else {
                    left = true
                }
            }
        }
        return [left, right]
    });
    provide('charDirection', charDirection);

    function resizeWindow() {
        const max = settings.value.width + (charDirection.value[0] && charDirection.value[1] ? 120 : 60);
        if (preScreenshot.value) {
            width.value.window = max;
            width.value.image = settings.value.width - (charDirection.value[0] && charDirection.value[1] ? 20 : 10) - 16 + 'px';
            width.value.avatar = '60px';
            width.value.fontsize = '16px'
        } else {
            const w = Math.min(max, document.body.clientWidth);
            width.value.window = w;
            width.value.avatar = Math.ceil(w / max * 60) + 'px';
            width.value.fontsize = Math.ceil(w / max * 16) + 'px';
        }
    }

    onMounted(() => {
        resizeWindow()
    });
    watch(charDirection, () => {
        resizeWindow()
    });

    const ifShowGuide = ref(false);
    const textarea = ref('');
    const scroll = ref();
    const preScreenshot = ref(false);
    provide('preScreenshot', preScreenshot);

    const currChar = ref('');
    const ifShowEditChar = ref(false);
    const ifShowSelectAvatar = ref(false);
    const createChar = ref(true);
    const dialogWidth = Math.ceil(windowWidth * 0.9);
    const newChar = ref({name: ''});
    const searchChar = ref('');
    let avatars = [];

    const searchResult = computed(() => {
        if (searchChar.value) {
            const search = searchChar.value;
            const list = [];
            for (let i = 0; i < avatars.length; i++) {
                if (avatars[i].indexOf(search) !== -1) {
                    list.push(avatars[i])
                }
            }
            return list.length ? list : false
        } else {
            return [
                '博士',
                'PRTS',
                'mon3tr',
                '凯尔希'
            ]
        }
    });

    const ifShowEditDialogue = ref(false);
    const currDialogue = ref(-1);
    const currDialogueData = ref({});
    const editDialogue = ref(true);

    const showToolBar = ref(false);
    const toolBarMask = ref(true);
    if (window.innerWidth - 520 > 250) {
        showToolBar.value = true;
        toolBarMask.value = false
    } else {
        showToolBar.value = false;
        toolBarMask.value = true
    }

    function resizeScroll() {
        const el = document.getElementById('textarea');
        el.style.height = '20px';
        const height = el.scrollHeight > 20 ? el.scrollHeight : 20;
        el.style.height = height + 'px';
        scrollHeight.value = window.innerHeight - height - 75 + 'px'
    }

    watch(textarea, resizeScroll);
    window.onresize = () => {
        resizeScroll()
    };

    const scrollHeight = ref(window.innerHeight - 95 + 'px');

    const tipControl = {
        tip: ref(''),
        texts: [
            '素材库里除了有干员头像，还有召唤物/敌人/装置的',
            '上传的头像会自动剪裁成正方形',
            '博士，剿灭打了吗？',
            '点击对话框可以编辑/插入对话',
            '不选中任何角色时，将以旁白视角发送对话',
            'Ctrl+Enter可以快捷发送'
        ],
        until: 0,
        index: -1,
        cd: 5000,
        loop() {
            if (Date.now() > this.until) {
                if (++this.index >= this.texts.length) {
                    this.index = 0
                }
                this.tip.value = this.texts[this.index];
                nextTick(() => {
                    resizeScroll()
                })
            }
            setTimeout(() => {
                this.loop()
            }, this.cd)
        },
        setTmpTip(tip, timeout = 5000) {
            this.tip.value = tip;
            this.until = Date.now() + timeout
        }
    };
    tipControl.index = Math.ceil(Math.random() * tipControl.texts.length) - 1;
    onMounted(() => {
        tipControl.loop();
    });

    function createDialogue(monologue) {
        if (textarea.value) {
            chats.value.push({
                char: currChar.value,
                content: textarea.value,
                type: monologue ? 'monologue' : 'chat',
                id: uuid()
            });
            textarea.value = '';
            save();
            nextTick(() => {
                resizeScroll();
                scroll.value.setScrollTop(10000)
            });
        } else {
            message.notify('请在输入框内输入文本', message.info);
            tipControl.setTmpTip('请在此输入文本')
        }
    }

    function createImageDialogue(fileUpload) {
        blob2base64(fileUpload, (b64) => {
            if (b64) {
                const imageId = uuid();
                images.value[imageId] = b64;
                chats.value.push({
                    char: currChar.value,
                    content: imageId,
                    type: 'image',
                    id: uuid(),
                });
                save();
                nextTick(() => {
                    scroll.value.setScrollTop(10000)
                })
            }
        });
        return false
    }

    function setCurr(id) {
        if (id === currChar.value) {
            currChar.value = ''
        } else {
            currChar.value = id
        }
    }

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
        ifShowEditChar.value = true
    }

    function uploadAvatar(uploadFile) {
        const url = blob2url(uploadFile);
        if (url) {
            const image = new Image();
            image.onload = () => {
                const imageId = uuid();
                images.value[imageId] = image2square(image);
                if (images.value.hasOwnProperty(newChar.value.avatar)) {
                    delete images.value[newChar.value.avatar]
                }
                newChar.value.avatar = imageId
            };
            image.src = url;
        }
        return false
    }

    function selectAvatar(src) {
        newChar.value.avatar = '/avatar/' + src + '.png';
        ifShowSelectAvatar.value = false
    }

    function editChar() {
        if (createChar.value) {
            if (newChar.value.name === '') {
                message.notify('名字是必须的', message.error);
                return
            }
            ifShowEditChar.value = false;
            chars.value[uuid()] = copy(newChar.value);
            newChar.value = {name: ''};
            message.notify('创建成功', message.success);
        } else {
            message.confirm(
                '即将删除该角色',
                '提示',
                () => {
                    const avatar = chars.value[currChar.value].avatar;
                    if (images.value.hasOwnProperty(avatar)) {
                        delete images.value[avatar]
                    }

                    delete chars.value[currChar.value];
                    for (let i = chats.value.length - 1; i > -1; i--) {
                        if (chats.value[i].char === currChar.value) {
                            chats.value.splice(i, 1)
                        }
                    }
                    message.notify('删除成功', message.success);
                    ifShowEditChar.value = false;
                }
            )
        }
    }


    function showEditDialogue(index) {
        editDialogue.value = true;
        currDialogue.value = index;
        currDialogueData.value = chats.value[currDialogue.value];
        ifShowEditDialogue.value = true
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
                let chat = chats.value.splice(currDialogue.value, 1)[0];
                if (chat.type === 'image' && images.value.hasOwnProperty(chat.content)) {
                    delete images.value[chat.content];
                }
                message.notify('删除成功', message.success);
                ifShowEditDialogue.value = false;
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
        ifShowEditDialogue.value = false;
    }


    function screenshot() {
        preScreenshot.value = true;
        resizeWindow();
        const node = document.getElementById('window');
        nextTick(() => {
            // 将height定为整数，防止截图下方出现白条
            node.style.height = node.scrollHeight - 30 + 'px';
            setTimeout(() => {
                downloadImage(node, {
                    windowWidth: width.value.window + 20,
                    scale: settings.value.scale
                }, () => {
                    preScreenshot.value = false;
                    node.style.height = null;
                    setTimeout(resizeWindow, 50)
                })
            }, 100)
        })
    }

    function clear() {
        message.confirm(
            '即将清空所有角色、对话',
            '提示',
            () => {
                chars.value = {};
                chats.value = [];
                images.value = {};
                message.notify('清空成功', message.success);
                save()
            }
        )
    }

    function downloadData() {
        const url = blob2url(new Blob([JSON.stringify({
            config: config.value,
            chars: chars.value,
            chats: chats.value,
            images: images.value
        })], {type: 'application/json'}));
        download(url, 'arktalk-data-' + Date.now() + '.json')
    }

    function uploadData(uploadFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            try {
                const data = JSON.parse(reader.result);
                setData(data);
                message.notify('导入成功', message.success);
                resizeScroll();
                save()
            } catch (e) {
                message.notify('导入失败，请确认文件名为 arktalk-data-xxx.json', message.error)
            }
        };
        reader.readAsText(uploadFile);
        return false
    }

    function loadAvatar() {
        import("@/avatars").then(module => {
            avatars = module.default
        })
    }
</script>


<template>
    <Settings/>
    <div :class="settings.style">
        <div class="render">
            <div id="body" :style="{background: settings.background}">
                <el-dialog v-model="ifShowGuide" title="指南" :width="dialogWidth">
                    <h2>编辑栏</h2>
                    <div style="display: flex; align-items: center; margin-bottom: 5px">
                        <el-icon :size="35" style="margin: 0 5px">
                            <Picture/>
                        </el-icon>
                        图片
                        <el-icon :size="35" style="margin: 0 5px">
                            <ChatDotSquare/>
                        </el-icon>
                        独白
                        <el-icon :size="35" style="margin: 0 5px">
                            <Promotion/>
                        </el-icon>
                        对话
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 10px">
                        <svg class="roll" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                             data-v-029747aa="" style="width:35px; background: white; margin: 0 5px">
                            <path fill="#858585"
                                  d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-38.4 409.6H326.4a38.4 38.4 0 1 0 0 76.8h147.2v147.2a38.4 38.4 0 0 0 76.8 0V550.4h147.2a38.4 38.4 0 0 0 0-76.8H550.4V326.4a38.4 38.4 0 1 0-76.8 0v147.2z"></path>
                        </svg>
                        添加角色
                        <svg class="roll" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                             data-v-029747aa="" style="width: 35px; margin: 0 5px">
                            <path fill="#606060"
                                  d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357.12 357.12 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a351.616 351.616 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357.12 357.12 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294.113 294.113 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293.12 293.12 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294.113 294.113 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288.282 288.282 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293.12 293.12 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a287.616 287.616 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256z"></path>
                        </svg>
                        编辑角色
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false"
                             style="width: 35px; margin: 0 5px; stroke: #606060">
                            <path d="M14 3.5H2v1h12v-1zM14 7.5H2v1h12v-1zM14 11.5H2v1h12v-1z"></path>
                        </svg>
                        菜单
                    </div>
                    不选中角色时，将以旁白视角发送对话，隐藏编辑角色选项
                    <h2>Tips</h2>
                    <ol style="margin-bottom:0; padding-left: 30px">
                        <li>点击对话框可以编辑/插入对话</li>
                        <li>上传的头像会自动剪裁成正方形</li>
                        <li>删除角色后会清空该角色的对话</li>
                        <li>Ctrl+Enter可以快捷发送</li>
                    </ol>
                </el-dialog>
                <el-dialog v-model="ifShowEditChar" :title="createChar?'创建新角色':'编辑角色'" :width="dialogWidth"
                           @closed="save">
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
                                <div class="container"><img v-if="newChar.avatar"
                                                            :src="images[newChar.avatar] || newChar.avatar"/>
                                    <el-icon v-else class="avatar-uploader-icon">
                                        <Plus/>
                                    </el-icon>
                                </div>
                            </el-upload>
                            <div style="width: calc(100% - 100px); padding: 5px 0 0 10px">
                                名称：
                                <el-input v-model="newChar.name" style="margin-top: 10px"
                                          @keypress.enter="createChar && editChar()"></el-input>
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
                            <el-button style="width: 60%" @click="ifShowSelectAvatar=true">从素材库中选择头像</el-button>
                            <el-button style="width: calc(40% - 12px)" @click="editChar">{{createChar?'创建':'删除'}}
                            </el-button>
                        </div>
                    </div>
                </el-dialog>
                <el-dialog v-model="ifShowSelectAvatar" title="选择头像" :width="dialogWidth" top="10vh" @open="loadAvatar">
                    <!--        素材库选择头像-->
                    <el-input placeholder="搜索更多角色" v-model="searchChar"></el-input>
                    <div v-if="searchResult" class="avatar-bar">
                        <el-scrollbar max-height="50vh" style="width: 100%">
                            <img v-for="src in searchResult" :key="src" :src="'/avatar/' + src + '.png'" loading="lazy"
                                 :title="src"
                                 @click="selectAvatar(src)">
                        </el-scrollbar>
                    </div>
                    <div v-else
                         style="height: 150px; display: flex; justify-content: center; align-items: center; flex-flow: column;color: grey">
                        <p>No Result</p>
                        <p>Tips: 素材库仅包含干员/敌人/召唤物/装置头像</p>
                    </div>
                </el-dialog>
                <el-dialog v-model="ifShowEditDialogue" :title="editDialogue?'编辑对话':'插入对话'" :width="dialogWidth"
                           @closed="save">
                    <el-input
                            v-model="currDialogueData.content"
                            :autosize="{minRows: 1, maxRows: 5}"
                            resize="none"
                            type="textarea"
                            style="margin-bottom: 5px"
                            :disabled="currDialogueData.type==='image'"
                    ></el-input>
                    <div class="edit-bar">
                        <div style="width: 50%; display: flex">
                            <el-select v-model="currDialogueData.char" style="flex-grow: 1" placeholder="角色">
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
                        <div style="width: calc(50% - 5px); margin-left: 5px; display: flex">
                            <el-select v-model="currDialogueData.type" style="flex-grow: 1"
                                       :disabled="currDialogueData.type==='image'"
                                       placeholder="类型"
                            >
                                <el-option
                                        v-for="(text, type) in TypeDict"
                                        :key="type"
                                        :label="text"
                                        :value="type"
                                        :disabled="type==='image'"
                                />
                            </el-select>
                        </div>
                        <div style="width: 100%;height: 5px; margin: 2px 0; border-bottom: var(--el-border-color) dashed 1px"></div>
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
                    <div class="bar" @click="ifShowAnnouncement=true">
                        <el-icon color="lightgrey" :size="35">
                            <Notification/>
                        </el-icon>
                        公告
                    </div>
                    <div class="bar" @click="ifShowGuide=true">
                        <el-icon :size="35">
                            <Compass/>
                        </el-icon>
                        指南
                    </div>
                    <div class="bar" @click="clear">
                        <el-icon color="lightgrey" :size="35">
                            <Delete/>
                        </el-icon>
                        清空
                    </div>
                    <div class="bar" @click="downloadData">
                        <el-icon color="lightgrey" :size="35">
                            <Download/>
                        </el-icon>
                        导出
                    </div>
                    <div class="bar" style="position: relative">
                        <el-icon color="lightgrey" :size="35">
                            <Upload/>
                        </el-icon>
                        导入
                        <el-upload
                                action="#"
                                :show-file-list="false"
                                class="avatar-uploader"
                                accept="application/json"
                                :before-upload="uploadData"
                                style="position: absolute; width: 100%; height: 50px; overflow: hidden"
                        >
                            <div style=" width: 80px; height: 50px; user-select: none">
                            </div>
                        </el-upload>

                    </div>
                </div>
                <div v-if="showToolBar && toolBarMask" @click="showToolBar=false" class="drawer-mask"></div>
                <el-scrollbar :height="scrollHeight" ref="scroll">
                    <div class="body">
                        <div class="window" id="window"
                             :style="{width: width.window+'px', background: settings.background}"
                        >
                            <Dialogue v-for="(dialogue, index) in chats" @edit="showEditDialogue"
                                      :data="chats[index]" :index="index" :key="dialogue.id"></Dialogue>
                        </div>
                        <div class="operateBar" :style="{width: windowWidth + 'px'}">
                            <div class="button-bar">
                                <el-icon color="#707070" :size="35" style="margin-right: 5px; position: relative">
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
                            <textarea class="textarea" id="textarea" v-model="textarea"
                                      :placeholder="tipControl.tip.value"
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
                                            <img :src="images[char.avatar] || char.avatar">
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