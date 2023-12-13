<script setup>
import { ref, computed } from 'vue'
import { t } from '@/lib/lang/translate'
import { ensure, formatSize } from '@/lib/utils/tool'
import message from '@/lib/utils/message'
import Save from '@/lib/function/savefile'
import { dialogWidth } from '@/lib/data/width'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const ifShowSavefile = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

const tableData = ref([])

const savefileName = ref('')
const ifSave = ref(false)

function loadData () {
    if (!Save.db.conn) {
        setTimeout(() => {
            loadData()
        }, 100)
    } else {
        Save.getInfo((res) => {
            tableData.value = []
            for (const key in res) {
                if (Object.prototype.hasOwnProperty.call(res, key)) {
                    const time = new Date(res[key].time)
                    tableData.value.push({
                        ...res[key],
                        timeString: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate(),
                        sizeString: formatSize(res[key].size)
                    })
                }
            }
            tableData.value.sort((a, b) => {
                return b.time - a.time
            })
        })
    }
}

function newSave () {
    if (savefileName.value.length === 0) {
        message.notify(t.value.notify.pleaseEnterSavefileName, message.warning)
        return
    }
    Save.new(savefileName.value, () => {
        ifSave.value = false
        savefileName.value = ''
        message.notify(t.value.notify.savedSuccessfully, message.success)
        loadData()
    })
}

function syncSave (row) {
    ensure(() => {
        Save.save(row.id, () => {
            message.notify(t.value.notify.savedSuccessfully, message.success)
            loadData()
        })
    }, t.value.notify.whetherToSaveSavefile + '「' + row.name + '」')
}

function loadSave (row) {
    if (Save.saved) {
        Save.load(row.id, () => {
            message.notify(t.value.notify.loadedSuccessfully, message.success)
            loadData()
        })
    } else {
        ensure(() => {
            Save.load(row.id, () => {
                message.notify(t.value.notify.loadedSuccessfully, message.success)
                loadData()
            })
        }, t.value.notify.whetherToLoadSavefile + '「' + row.name + '」')
    }
}

function deleteSave (row) {
    ensure(() => {
        Save.delete(row.id, () => {
            loadData()
            message.notify(t.value.notify.deletedSuccessfully, message.success)
        })
    }, t.value.notify.whetherToDeleteSavefile + '「' + row.name + '」')
}

loadData()
</script>

<template>
    <el-dialog v-model="ifShowSavefile" :width="dialogWidth" :title="t.noun.savefile" @closed="ifSave=false">
        <div style="display: flex; column-gap: 5px">
            <template v-if="ifSave">
                <el-input v-model="savefileName" :placeholder="t.noun.savefileName"></el-input>
                <el-button @click="() => {newSave()}">{{ t.action.save }}</el-button>
            </template>
            <template v-else>
                <el-button style="width: 100%" @click="() => {ifSave=true;savefileName=''}">{{
                        t.action.createSavefile
                    }}
                </el-button>
            </template>
        </div>
        <el-table :data="tableData">
            <el-table-column prop="name" :label="t.noun.name"/>
            <el-table-column prop="timeString" :label="t.noun.lastEdit" :width="90"/>
            <el-table-column prop="sizeString" :label="t.noun.size" :width="80"/>
            <el-table-column :label="t.action.operate" :width="90">
                <template #default="scope">
                    <div style="display: flex; justify-content: right; align-items: center; column-gap: 5px">
                        <el-icon :size="25" style="cursor: pointer" @click="() => {syncSave(scope.row)}"
                                 :title="t.action.save">
                            <IconUpload/>
                        </el-icon>
                        <el-icon :size="25" style="cursor: pointer" @click="() => {loadSave(scope.row)}"
                                 :title="t.action.load">
                            <IconDownload/>
                        </el-icon>
                        <el-icon :size="25" style="cursor: pointer" @click="() => {deleteSave(scope.row)}"
                                 :title="t.action.delete">
                            <IconDelete/>
                        </el-icon>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>
</template>

<style>
.el-table__inner-wrapper .cell {
    padding: 0 5px;
}
</style>
