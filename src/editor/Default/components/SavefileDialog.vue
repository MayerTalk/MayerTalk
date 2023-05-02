<script setup>
import { ref, inject, computed } from 'vue'
import { ensure, formatSize } from '@/lib/tool'
import message from '@/lib/message'
import Save from '@/lib/savefile'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const dialogWidth = inject('dialogWidth')

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
        message.notify('请输入存档名', message.warning)
        return
    }
    Save.new(savefileName.value, () => {
        ifSave.value = false
        savefileName.value = ''
        message.notify('保存成功', message.success)
        loadData()
    })
}

function syncSave (row) {
    ensure(() => {
        Save.save(row.id, () => {
            message.notify('同步成功', message.success)
            loadData()
        })
    }, '是否同步当前数据至存档「' + row.name + '」')
}

function loadSave (row) {
    if (Save.saved) {
        Save.load(row.id, () => {
            message.notify('导入成功', message.success)
            loadData()
        })
    } else {
        ensure(() => {
            Save.load(row.id, () => {
                message.notify('导入成功', message.success)
                loadData()
            })
        }, '是否导入存档 「' + row.name + '」')
    }
}

function deleteSave (row) {
    ensure(() => {
        Save.delete(row.id, () => {
            loadData()
            message.notify('删除成功', message.success)
        })
    }, '是否删除存档 「' + row.name + '」')
}

loadData()
</script>

<template>
    <el-dialog v-model="ifShowSavefile" :width="dialogWidth" title="存档" @closed="ifSave=false">
        <div style="display: flex; column-gap: 5px">
            <template v-if="ifSave">
                <el-input v-model="savefileName" placeholder="存档名"></el-input>
                <el-button @click="() => {newSave()}">保存</el-button>
            </template>
            <template v-else>
                <el-button style="width: 100%" @click="() => {ifSave=true;savefileName=''}">保存</el-button>
            </template>
        </div>
        <el-table :data="tableData">
            <el-table-column prop="name" label="名称"/>
            <el-table-column prop="timeString" label="最后编辑"/>
            <el-table-column prop="sizeString" label="体积" :width="80"/>
            <el-table-column label="操作" :width="90">
                <template #default="scope">
                    <div style="display: flex; justify-content: right; align-items: center; column-gap: 5px">
                        <el-icon :size="25" style="cursor: pointer" @click="() => {syncSave(scope.row)}">
                            <IconRefresh/>
                        </el-icon>
                        <el-icon :size="25" style="cursor: pointer" @click="() => {loadSave(scope.row)}">
                            <IconUpload/>
                        </el-icon>
                        <el-icon :size="25" style="cursor: pointer" @click="() => {deleteSave(scope.row)}">
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
