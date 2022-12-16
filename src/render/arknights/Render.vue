<script setup>

    import {ref, computed, watch, inject, provide, nextTick, onMounted} from 'vue'
    import Dialogue from './Dialogue.vue'
    import Settings from './Setting.vue'
    import Option from './type/Option.vue'
    import message from '@/lib/message'
    import {
        copy,
        uuid,
        downloadImage,
        download,
        blob2url,
        blob2base64,
        image2square,
        ensureClose,
        clickBySelector
    } from "@/lib/tool";

    const TypeDict = {
        chat: '对话',
        monologue: '独白',
        image: '图片',
        option: '选项',
        select: '选择',
        title: '标题'
    };

    const MAX_SCROLL_TOP = 10000;
    const editor = computed(() => {
        if (['char', 'monologue', 'image'].indexOf(currDialogueData.value.type) !== -1) {
            return false
        } else if (currDialogueData.value.type === 'option') {
            return Option
        }
    });

    const ifShowAnnouncement = inject('ifShowAnnouncement');
    const ifShowSettings = inject('ifShowSettings');
    const ifShowGuide = inject('ifShowGuide');
    const config = inject('config');
    const chars = inject('chars');
    const chats = inject('chats');
    const images = inject('images');
    const staticUrl = inject('staticUrl');
    const DataControl = inject('DataControl');
    const renderSettings = ref({});
    const width = ref({});
    const windowWidth = Math.min(520, document.body.clientWidth);
    const dialogWidth = Math.ceil(windowWidth * 0.9);
    provide('renderSettings', renderSettings);
    provide('width', width);
    provide('dialogWidth', dialogWidth);

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
        const max = renderSettings.value.width + (charDirection.value[0] && charDirection.value[1] ? 120 : 60);
        if (preScreenshot.value) {
            width.value.window = max;
            width.value.image = renderSettings.value.width - (charDirection.value[0] && charDirection.value[1] ? 20 : 10) - 16 + 'px';
            width.value.avatar = '60px';
            width.value.fontsize = '16px'
        } else {
            const w = Math.min(max, document.body.clientWidth);
            width.value.window = w;
            width.value.avatar = Math.ceil(w / max * 60) + 'px';
            width.value.fontsize = Math.ceil(w / max * 16) + 'px';
        }
    }

    function _addDialogue(content, char, type, id) {
        // 通用的增加对话方法
        // content(String): 对话内容，默认为空
        // char(String): 发言角色id，默认为当前角色id
        // type(String): 发言类型，默认为对话
        // id(uuid): 发言id
        // REFA: 应都重构至用这个方法

        chats.value.push({
                char: (typeof char === "string") ? char : currChar.value,
                content: content || "",
                type: type || "chat",
                id: id || uuid()
            });
        nextTick(() => {
            resizeScroll();
            scroll.value.setScrollTop(MAX_SCROLL_TOP)
        });
        DataControl.save("chats");
    }

    onMounted(() => {
        resizeWindow()
    });
    watch(charDirection, () => {
        resizeWindow()
    });
    watch(() => {
        return renderSettings.value.width
    }, () => {
        resizeWindow()
    });

    onMounted(() => {
        const el = document.getElementById('body');
        el.style.height = window.innerHeight + 'px';
        el.style.cssText += 'transition: background-color ease 1s;';
    });

    const textarea = ref('');
    const scroll = ref();
    const preScreenshot = ref(false);
    const ifShowMoreType = ref(false);
    const arrowStyle = ref({});
    const options = ref({});
    const ifShowCreateOption = ref(false);
    provide('preScreenshot', preScreenshot);

    function roll360() {
        if (ifShowMoreType.value) {
            arrowStyle.value = {
                transform: 'rotate(180deg)',
                transition: 'transform ease 0.4s'
            };
            resizeScroll(-100)
        } else {
            arrowStyle.value = {
                transform: 'rotate(360deg)',
                transition: 'transform ease 0.4s'
            };
            setTimeout(() => {
                arrowStyle.value = {}
            }, 500);
            resizeScroll(100)
        }
    }

    const currChar = ref('');
    const ifShowEditChar = ref(false);
    const ifShowSelectAvatar = ref(false);
    const createChar = ref(true);
    const newChar = ref({name: ''});
    const searchChar = ref('');
    let avatars = [];

    const searchResult = computed(() => {
        if (searchChar.value) {
            const search = searchChar.value;
            const list = [];
            for (let i = 0; i < avatars.length; i++) {
                if (avatars[i][0].indexOf(search) !== -1) {
                    list.push(avatars[i])
                }
            }
            return list.length ? list : false
        } else {
            return [
                ['博士', 'avatar/arknights/博士.png'],
                ['PRTS', 'avatar/arknights/PRTS.png'],
                ['mon3tr', 'avatar/arknights/mon3tr.png'],
                ['凯尔希', 'avatar/arknights/凯尔希.png']
            ]
        }
    });

    const ifShowEditDialogue = ref(false);
    const currDialogue = ref(-1);
    const currDialogueData = ref({});
    const editDialogue = ref(true);

    const showToolBar = ref(false);
    const toolBarMask = ref(true);

    // 模板消息
    function renderModelMsg(modelMsg) {
        let name = currChar.value?chars.value[currChar.value].name:"<角色名>";
        // 在此增加局部可见的参数

        return eval("`"+modelMsg+"`");
    }
    const modelMsgList = ref([
        "“${name}”撤回了一条消息",
    ]);
    const modelMsgGateway = ref(null);

    // @列表处理
    const ifAt = ref(false);
    const atWho = ref({});
    const atWhoSelRef = ref(null);
    watch(atWho, () => {
        // 被@角色刷入文本框
        if (!atWho.value) { return }
        textarea.value += atWho.value.name + " ";
        ifAt.value = false;
    });
    watch(ifAt, () => {
        if (!ifAt.value) {
            document.querySelector("#textarea").focus();
        }
    });
    function processKeyDown(e) {
        // 处理单个key按下事件
        if (e.code === "Digit2" && e.shiftKey) { // 输入法适配
            atWho.value = "";
            textarea.value += "@";
            ifAt.value = true;
        } else {
            ifAt.value = false;
        }
    }
    function focusOnSelect() {
        // @提示框显示后聚焦输入
        if (atWhoSelRef.value) {
            atWhoSelRef.value.focus();
        } else {
            setTimeout(focusOnSelect, 1000);
        }
    }

    // +1功能
    const plus1 = ref(-1);
    provide('plus1', plus1);
    watch(chats, () => {
        if (
            chats.value.length > 1 &&
            chats.value[chats.value.length - 1].char &&
            chats.value[chats.value.length - 2].char &&
            chats.value[chats.value.length - 2].content === chats.value[chats.value.length - 1].content
        ) plus1.value = chats.value.length - 1;
    }, { deep: true });
    watch(plus1, () => {
        // 因为输入在Dialogue外，Dialogue内拿不到chats所以传回这里添加信息
        if (plus1.value == -1)
            if (currChar.value) {
                chats.value.push({
                    char: currChar.value,
                    content: chats.value[chats.value.length - 1].content,
                    type: 'chat',
                    id: uuid()
                });
                nextTick(() => {
                    resizeScroll();
                    scroll.value.setScrollTop(MAX_SCROLL_TOP)
                });
                DataControl.save("chats");
            } else {
                message.notify("必须选择一个角色才能复读", message.warning);
                plus1.value = chats.value.length - 1;
            }
    });

    if (window.innerWidth - 520 > 250) {
        showToolBar.value = true;
        toolBarMask.value = false
    } else {
        showToolBar.value = false;
        toolBarMask.value = true
    }

    function resizeScroll(offset = 0) {
        const el = document.getElementById('textarea');
        el.style.height = '20px';
        const height = el.scrollHeight > 20 ? el.scrollHeight : 20;
        el.style.height = height + 'px';
        const bar = document.getElementById('operateBar');
        scrollHeight.value = window.innerHeight - bar.scrollHeight + offset - 1 + 'px'
    }

    watch(textarea, () => {
        resizeScroll()
    });
    window.onresize = () => {
        resizeScroll()
    };

    const scrollHeight = ref(window.innerHeight - 90 + 'px');

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

    function createTextDialogue(type) {
        if (textarea.value) {
            chats.value.push({
                char: currChar.value,
                content: textarea.value,
                type: type,
                id: uuid()
            });
            textarea.value = '';
            DataControl.save('chats');
            nextTick(() => {
                resizeScroll();
                scroll.value.setScrollTop(MAX_SCROLL_TOP)
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
                DataControl.save(['chats', 'images']);
                nextTick(() => {
                    scroll.value.setScrollTop(MAX_SCROLL_TOP)
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
            DataControl.update('images');
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
        newChar.value.avatar = src[1];
        let segments = /^(.*?)_(.*?)$/.exec(src[0]), name = src[0];
        if (!!segments) {
            name = segments[1] === "敌人" ? segments[2] : segments[1];
        }
        newChar.value.name = newChar.value.name.trim() || name;
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
                        delete images.value[avatar];
                        DataControl.update('images')
                    }

                    delete chars.value[currChar.value];
                    for (let i = chats.value.length - 1; i > -1; i--) {
                        if (chats.value[i].char === currChar.value) {
                            chats.value.splice(i, 1);
                            DataControl.update('chats')
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
                    DataControl.update('images')
                }
                message.notify('删除成功', message.success);
                ifShowEditDialogue.value = false;
            }
        );
    }

    function insertDialogue() {
        if (currDialogueData.value.char === undefined) {
            message.notify('请选择角色', message.warning);
            return
        }
        if (!currDialogueData.value.type) {
            message.notify('请选择类型', message.warning);
            return
        }
        chats.value.splice(currDialogue.value, 0, copy(currDialogueData.value));
        message.notify('插入成功', message.success);
        ifShowEditDialogue.value = false;
    }

    function sendModelMsg() {
        // 发送模板消息
        // content(str): 消息内容
        // replace(str): 格式化消息内容时使用的映射表

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
                    scale: renderSettings.value.scale,
                    useCORS: true
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
                currChar.value = "";
                currDialogue.value = 0;
                currDialogueData.value = {};
                message.notify('清空成功', message.success);
                DataControl.save(['chars', 'chats', 'images']);
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
        download(url, 'mayertalk-data-' + Date.now() + '.json')
    }

    function uploadData(uploadFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            try {
                const data = JSON.parse(reader.result);
                DataControl.set(data);
                message.notify('导入成功', message.success);
                resizeScroll();
                DataControl.save();
            } catch (e) {
                message.notify('导入失败，请确认文件名为 mayertalk-data-xxx.json', message.error)
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

    function showCreateOption() {
        const id = uuid();
        options.value = {};
        options.value[id] = '';
        ifShowCreateOption.value = true
    }

    function createOptionDialogue() {
        ifShowCreateOption.value = false;
        chats.value.push({
            char: currChar.value,
            content: copy(options.value),
            id: uuid(),
            type: 'option'
        });
        DataControl.save('chats');
        nextTick(() => {
            resizeScroll();
            scroll.value.setScrollTop(MAX_SCROLL_TOP);
        });
    }
</script>


<template>
    <div :class="renderSettings.style">
        <div class="render">
            <div id="body" :style="{background: renderSettings.background}">
                <Settings/>
                <el-dialog v-model="ifShowGuide" title="指南" :width="dialogWidth">
                    <h2>编辑栏</h2>
                    <div style="display: flex; align-items: center; margin-bottom: 5px">
                        <el-icon :size="35" style="margin: 0 5px">
                            <ArrowUp/>
                        </el-icon>
                        更多类型
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
                           @closed="() => DataControl.save('chars')">
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
                                                            :src="images[newChar.avatar] || staticUrl + newChar.avatar"/>
                                    <el-icon v-else class="avatar-uploader-icon">
                                        <Plus/>
                                    </el-icon>
                                </div>
                            </el-upload>
                            <div style="width: calc(100% - 100px); padding: 5px 0 0 10px">
                                名称：
                                <el-input v-model="newChar.name" style="margin-top: 10px"
                                          @keypress.enter="createChar && editChar()" clearable></el-input>
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
                    <template v-if="ifShowSelectAvatar">
                        <el-input placeholder="搜索更多角色" v-model="searchChar"></el-input>
                        <div v-if="searchResult" class="avatar-bar">
                            <el-scrollbar max-height="50vh" style="width: 100%">
                                <img v-for="avatar in searchResult" :key="avatar[0]" :src="staticUrl + avatar[1]"
                                     loading="lazy"
                                     :title="avatar[0]"
                                     @click="selectAvatar(avatar)">
                            </el-scrollbar>
                        </div>
                        <div v-else
                             style="height: 150px; display: flex; justify-content: center; align-items: center; flex-flow: column;color: grey">
                            <p>No Result</p>
                            <p>Tips: 素材库仅包含干员/敌人/召唤物/装置头像</p>
                        </div>
                    </template>
                </el-dialog>
                <el-dialog v-model="ifShowEditDialogue" :title="editDialogue?'编辑对话':'插入对话'" :width="dialogWidth"
                           @closed="() => DataControl.save('chats')" :before-close="editDialogue?null:ensureClose">
                    <component v-if="editor" :is="editor" v-model="currDialogueData.content"/>
                    <el-input v-else
                              v-model="currDialogueData.content"
                              :autosize="{minRows: 1, maxRows: 5}"
                              resize="none"
                              type="textarea"
                              :disabled="currDialogueData.type==='image'"
                    ></el-input>
                    <div class="edit-bar" style="margin-top: 5px">
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
                                       :disabled="['image','option'].indexOf(currDialogueData.type) !== -1"
                                       placeholder="类型"
                            >
                                <el-option
                                        v-for="(text, type) in TypeDict"
                                        :key="type"
                                        :label="text"
                                        :value="type"
                                        :disabled="['image','option'].indexOf(type) !== -1"
                                />
                            </el-select>
                        </div>
                        <div style="width: 100%;height: 5px; margin: 2px 0; border-bottom: var(--el-border-color) dashed 1px"></div>
                        <div v-if="editDialogue" style="display: flex; width: 100%; margin-top: 5px; column-gap: 5px;">
                            <!-- TODO 应当把column-gap的这个写法应用到所有有并列的el-button的容器上-->
                            <el-button style="width: 100%" @click="delDialogue">删除</el-button>
                            <el-button style="width: 100%; margin-left: 0px" @click="switchEdit(false)">向上插入
                            </el-button>
                        </div>
                        <div v-else style="width: 100%; margin-top: 5px">
                            <el-button style="width: 50%" @click="insertDialogue">插入</el-button>
                            <el-button style="width: calc(50% - 5px); margin-left: 5px" @click="switchEdit(true)">返回
                            </el-button>
                        </div>
                    </div>

                </el-dialog>
                <el-dialog v-model="ifAt" :width="dialogWidth"
                    title="想用@提到哪个角色?"
                    :modal="false"
                    draggable
                    @opened="focusOnSelect">
                    <el-select
                        ref="atWhoSelRef"
                        v-model="atWho"
                        id="atWhoSelect"
                        style="width:100%"
                        placeholder="搜索角色..."
                        clearable
                        filterable
                        default-first-option >
                        <el-option v-for="char in chars"
                            :key="char"
                            :label="char.name"
                            :value="char">
                            <span style="float:left">{{char.name}}</span>
                            <img style="float:right;display:inline-block" :src="char.avatar"/>
                        </el-option>
                    </el-select>
                </el-dialog>
                <el-dialog v-model="ifShowCreateOption" title="创建选项" :width="dialogWidth" :before-close="ensureClose"
                           :show-close="false">
                    <Option v-model="options" extraButton="创建" @done="createOptionDialogue"/>
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
                    <div class="bar" @click="DataControl.withdraw">
                        <el-icon color="lightgrey" :size="35">
                            <Back/>
                        </el-icon>
                        撤回
                    </div>
                    <div class="bar" @click="DataControl.redo">
                        <el-icon color="lightgrey" :size="35">
                            <Right/>
                        </el-icon>
                        重做
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
                    <div class="bar" @click="ifShowSettings=true">
                        <el-icon color="lightgrey" :size="35">
                            <Setting/>
                        </el-icon>
                        设置
                    </div>
                </div>
                <div v-if="showToolBar && toolBarMask" @click="showToolBar=false" class="drawer-mask"></div>
                <el-scrollbar :height="scrollHeight" ref="scroll">
                    <div class="body">
                        <div class="window" id="window"
                             :style="{width: width.window+'px', background: renderSettings.background}"
                        >
                            <Dialogue v-for="(dialogue, index) in chats" @edit="showEditDialogue"
                                      :data="chats[index]" :index="index" :key="dialogue.id" style="position:relative"></Dialogue>
                        </div>
                        <div id="operateBar" class="operateBar" :style="{width: windowWidth + 'px'}">
                            <div class="button-bar">
                                <el-icon color="#707070" :size="35"
                                         style="margin-right: 5px; position: relative" :style="arrowStyle"
                                         @click="() => {ifShowMoreType = !ifShowMoreType; roll360()}">
                                    <ArrowUp/>
                                </el-icon>
                                <el-icon @click="createTextDialogue('monologue')" color="#707070" :size="35">
                                    <ChatDotSquare/>
                                </el-icon>
                            </div>
                            <textarea class="textarea" id="textarea" v-model="textarea"
                                      :placeholder="tipControl.tip.value"
                                      @keydown.ctrl.enter="createTextDialogue('chat')"
                                      @keydown="processKeyDown"></textarea>
                            <div class="button-bar">
                                <el-icon @click="createTextDialogue('chat')" color="#808080" :size="35">
                                    <Promotion/>
                                </el-icon>
                            </div>
                            <div class="moretype-bar" :class="{show: ifShowMoreType}">
                                <div class="block" @click="clickBySelector('#uploadImage > div > input')">
                                    <el-upload id="uploadImage"
                                               action="#"
                                               :show-file-list="false"
                                               class="avatar-uploader"
                                               accept="image/png, image/jpeg, image/gif"
                                               :before-upload="createImageDialogue"
                                               style="position: absolute; width: 0; height: 0"
                                    ></el-upload>
                                    <el-icon color="#707070" :size="35">
                                        <Picture/>
                                    </el-icon>
                                    图片
                                </div>
                                <div class="block" @click="showCreateOption">
                                    <el-icon color="#707070" :size="35">
                                        <Operation/>
                                    </el-icon>
                                    选项
                                </div>
                                <div class="block" @click="createTextDialogue('select')">
                                    <el-icon color="#707070" :size="35">
                                        <Edit/>
                                    </el-icon>
                                    选择
                                </div>
                                <div class="block" @click="createTextDialogue('title')">
                                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                                         data-v-029747aa="" style="width: 35px; height: 35px">
                                        <path d="m199.04 672.64 193.984 112 224-387.968-193.92-112-224 388.032zm-23.872 60.16 32.896 148.288 144.896-45.696L175.168 732.8zM455.04 229.248l193.92 112 56.704-98.112-193.984-112-56.64 98.112zM104.32 708.8l384-665.024 304.768 175.936L409.152 884.8h.064l-248.448 78.336L104.32 708.8zm384 254.272v-64h448v64h-448z"
                                              fill="#707070"></path>
                                    </svg>
                                    标题
                                </div>
                                <div v-if="currChar" ref="modelMsgGateway" class="block">
                                    <svg style="width:35px;height:35px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="#606060" d="M868.119273 190.836364H344.482909V128h516.654546a69.818182 69.818182 0 0 1 69.818181 69.818182v474.763636h-62.836363V190.836364z"></path>
                                        <path fill="#606060" d="M155.927273 316.509091h586.472727v460.8h-247.435636l-62.836364 62.836364h310.272a62.836364 62.836364 0 0 0 62.836364-62.836364V316.509091a62.836364 62.836364 0 0 0-62.836364-62.836364H155.927273A62.836364 62.836364 0 0 0 93.090909 316.509091v460.8c0 34.676364 28.113455 62.836364 62.836364 62.836364h157.742545l62.836364-62.836364H155.927273V316.509091z"></path>
                                        <path fill="#606060" d="M343.505455 923.927273H442.181818l94.487273-94.487273-49.384727-49.338182-143.825455 143.825455z"></path>
                                    </svg>
                                    模板消息
                                </div>
                                <el-popover :virtual-ref="modelMsgGateway" popper-style="width:auto" placement="top-start" title="选择模板信息" trigger="click">
                                    <el-card class="model-msg-list">
                                        <span v-for="modelMsg in modelMsgList" @click="_addDialogue(renderModelMsg(modelMsg), '')">
                                            {{ renderModelMsg(modelMsg) }}
                                        </span>
                                    </el-card>
                                </el-popover>
                            </div>
                            <div class="char-bar">
                                <el-scrollbar>
                                    <div class="container">
                                        <div v-for="(char, id) in chars" :key="id"
                                             :class="[id === currChar?'char-curr':'char']"
                                             @click="setCurr(id)">
                                            <el-tooltip :content="char.name" placement="top">
                                                <img :src="images[char.avatar] || staticUrl + char.avatar">
                                            </el-tooltip>
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
                                        <svg class="roll" viewBox="0 0 1024 1024" xmlns="http://www.w3. org/2000/svg"
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
<style>
/* 设置模板消息弹窗部分的样式 */
.el-card {
    --el-card-padding: 10px;
}
.model-msg-list span {
    cursor: pointer;
}
</style>