import { ref } from 'vue'

const translate = ref({
    notify: {
        cannotDeleteLastOption: '你不能删除最后一个选项',
        pleaseEnterTextInTheInputBox: '请在输入框内输入文本',
        pleaseEnterTextHere: '请在此输入文本',
        pleaseSelectAtLeastOneCharacter: '请选择至少一个角色',
        pleaseSelectTheCharToRepeat: '请选择要复读的角色',
        aboutToClearAllChats: '即将清空所有对话',
        aboutToClearAllCharactersAndChats: '即将清空所有角色、对话',
        pleaseSelectTheTypeToClear: '请选择要清空的类型',
        pleaseEnterSavefileName: '请输入存档名',
        savedSuccessfully: '保存成功',
        synchronizedSuccessfully: '同步成功',
        whetherToSynchronizeSavefile: '是否同步当前数据至存档',
        importedSuccessfully: '导入成功',
        whetherToImportSavefile: '是否导入存档',
        deletedSuccessfully: '删除成功',
        whetherToDeleteSavefile: '是否删除存档',
        whetherToDeleteChat: '是否删除对话',
        whetherToDeleteCharacter: '是否删除角色',
        pleaseSelectCharacter: '请选择角色',
        pleaseSelectType: '请选择类型',
        insertedSuccessfully: '插入成功',
        pleaseEnterValidNumber: '请输入合法的数字',
        enterNumberOfLinesHere: '在此输入行数',
        wantToAtWhichCharacter: '想@哪个角色?',
        nameIsRequired: '名字是必须的',
        createdSuccessfully: '创建成功',
        calculating: '计算中',
        clearedSuccessfullyAndReloading: '清空成功，正在重载',
        pleaseSelectTypeOfCharacterToShow: '请选择要显示角色名的类型',
        whetherQuitEditing: '是否退出编辑',
        screenshotExceeds10: '截图数量超过10张，是否继续截屏',
        screenshottedCompletely: '截图完成，正在恢复，请耐心等待',
        startToScreenshot: '正在开始截图，长截图初始化时间较长，请耐心等待',
        screenshottedSuccessfully: '截图成功',
        recoveredSuccessfully: '回复成功'
    },
    action: {
        add: '添加',
        create: '创建',
        createOption: '创建选项',
        repeat: '复读',
        cancel: '取消',
        confirm: '确认',
        screenshot: '截屏',
        empty: '清空',
        withdraw: '撤回',
        redo: '重做',
        goto: '转到',
        save: '保存',
        editChat: '编辑对话',
        insertChat: '插入对话',
        insert: '插入',
        insertUp: '向上插入',
        return: '返回',
        selectCharacter: '选择角色',
        selectMoreCharacter: '选择更多角色',
        selectAvatar: '选择头像',
        createCharacter: '创建角色',
        editCharacter: '编辑角色',
        chooseCharacterFromLibrary: '从素材库中选择角色',
        import: '导入',
        export: '导出'
    },
    noun: {
        character: '角色',
        type: '类型',
        hint: '提示',
        announcement: '公告',
        guide: '指南',
        chat: '对话',
        all: '全部',
        settings: '设置',
        about: '关于',
        narration: '旁白',
        savefile: '存档',
        savefileName: '存档名',
        name: '名称',
        lastEdit: '最后编辑',
        size: '体积',
        operate: '操作',
        avatarPosition: '头像位置',
        left: '左',
        right: '右',
        common: '通用',
        editor: '编辑器',
        renderer: '渲染器',
        language: '语言',
        render: '渲染',
        background: '背景色',
        dialogWidth: '对话框宽度',
        imageQuality: '图片质量',
        screenshotMaxHeight: '截图最大高度',
        showCharacterName: '显示角色名',
        storage: '储存',
        local: '本地',
        warning: '警告'
    },
    tip: {
        pool: [
            '素材库里除了有干员头像，还有召唤物/敌人/装置的',
            '上传的头像会自动剪裁成正方形',
            '博士，剿灭打了吗？',
            '点击对话框可以编辑/插入对话',
            '不选中任何角色时，将以旁白视角发送对话',
            'Ctrl+Enter可以快捷发送',
            'Ctrl+Z/ctrl+Y可以撤回/重做',
            'Ctrl+1~9可以快捷切换角色'
        ],
        selectCharDialog: '素材库仅包含干员/敌人/召唤物/装置',
        cutScreenshot: '请注意，最大高度的单位是px，一般而言1000px能容纳10条对话',
        settings: {
            dialogWidth: '不包含头像'
        },
        emptyData: '即将清空所有数据（对话、角色、存档），且无法恢复',
        importFailed: '导入失败，请确认文件名为 mayertalk-data-xxx.json',
        errorGuide: '，如果可以，请截图此页面，并加入交流群反馈',
        error: '工口发生',
        unsafeImage: '导入的文件有不安全图片，请核实来源（图片ID：'
    },
    character: {
        doctor: '博士',
        kalts: '凯尔希'
    },
    name: {
        editor: {
            Default: '默认'
        },
        renderer: {
            Siracusa: '叙拉古人'
        },
        typeDict: {
            chat: '对话',
            monologue: '独白',
            image: '图片',
            option: '选项',
            select: '选择',
            title: '标题'
        }
    }
})

export {
    translate as t
}
