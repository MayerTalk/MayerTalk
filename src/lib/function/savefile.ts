import { uuid } from '@/lib/utils/tool'

import DataBase from '@/lib/utils/db'
import { DataControl } from '@/lib/data/data'
import type * as DT from '@/lib/data/dataTypes'
import { getDataJson, switchVersion } from '@/lib/data/versionControl'

interface InfoRecord {
    id: string
    size: number
    time: number
    name: string
}

interface DataRecord {
    id: string
    data: DT.DataType
}

const Save = class Save {
    // TODO 优化多库类型提示
    db: DataBase
    saved: boolean

    constructor(db = 'savefile') {
        this.db = new DataBase(db, '')
        this.db.open((db) => {
            if (!db.objectStoreNames.contains('info')) {
                db.createObjectStore('info', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('data')) {
                db.createObjectStore('data', { keyPath: 'id' })
            }
        })
        this.saved = false
        DataControl.hook.switch.on(() => {
            this.saved = false
        })
        DataControl.hook.update.on(() => {
            this.saved = false
        })
    }

    new(name: string, callback?: () => void) {
        const data = getDataJson()
        const id = uuid()
        const time = Date.now()
        this.db.add({ id, size: JSON.stringify(data).length, time, name }, 'info').onsuccess = () => {
            if (callback) {
                callback()
            }
            this.saved = true
        }
        this.db.add({ id, data }, 'data')
        return id
    }

    save(id: string, callback?: () => void) {
        const data = getDataJson()
        const time = Date.now()
        const infoRequest = this.db.get<InfoRecord>(id, 'info')
        infoRequest.onsuccess = () => {
            const name = infoRequest.result.name
            this.db.put({ id, size: JSON.stringify(data).length, time, name }, 'info').onsuccess = () => {
                if (callback) {
                    callback()
                }
                this.saved = true
            }
        }
        this.db.put({ id, data }, 'data')
    }

    load(id: string, callback?: () => void) {
        const dataRequest = this.db.get<DataRecord>(id, 'data')
        dataRequest.onsuccess = () => {
            const data = dataRequest.result.data
            switchVersion(data)
            DataControl.set(data, true)
            DataControl.save()
            this.saved = true
            DataControl.hook.changeSavefile.call(undefined)
            if (callback) {
                callback()
            }
        }
    }

    delete(id: string, callback?: () => void) {
        this.db.delete(id, 'data')
        this.db.delete(id, 'info').onsuccess = () => {
            if (callback) {
                callback()
            }
        }
    }

    getInfo(callback: (data: Record<string, InfoRecord>) => void) {
        const data: Record<string, InfoRecord> = {}
        const request = this.db.transaction('info').openCursor()
        request.onsuccess = () => {
            const cursor = request.result
            if (cursor) {
                data[cursor.value.id] = cursor.value
                cursor.continue()
            } else {
                callback(data)
            }
        }
    }
}

export default new Save()
