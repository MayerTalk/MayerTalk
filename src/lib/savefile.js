import { DataControl } from './data'
import DataBase from './db'
import {
    getDataJson,
    switchVersion
} from './versionControl'
import { uuid } from '@/lib/tool'

const Save = class Save {
    constructor (db = 'savefile') {
        this.db = new DataBase(db)
        this.db.open((event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains('info')) {
                db.createObjectStore('info', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('data')) {
                db.createObjectStore('data', { keyPath: 'id' })
            }
        })
        this.saved = false
        DataControl.onUpdate(() => {
            this.saved = false
        })
    }

    new (name, callback) {
        const data = getDataJson()
        const id = uuid()
        const time = Date.now()
        this.db.add({ id, size: JSON.stringify(data).length, time, name }, 'info').onsuccess = (event) => {
            callback && callback(event)
            this.saved = true
        }
        this.db.add({ id, data }, 'data')
        return id
    }

    save (id, callback) {
        const data = getDataJson()
        const time = Date.now()
        this.db.get(id, 'info').onsuccess = (evt) => {
            const name = evt.target.result.name
            this.db.put({ id, size: JSON.stringify(data).length, time, name }, 'info').onsuccess = (event) => {
                callback && callback(event)
                this.saved = true
            }
        }
        this.db.put({ id, data }, 'data')
    }

    load (id, callback) {
        this.db.get(id, 'data').onsuccess = (event) => {
            const data = event.target.result.data
            switchVersion(data)
            DataControl.set(data, true)
            DataControl.save()
            this.saved = true
            callback && (callback(event))
        }
    }

    delete (id, callback) {
        this.db.delete(id, 'data')
        this.db.delete(id, 'info').onsuccess = (event) => {
            callback && callback(event)
        }
    }

    getInfo (callback) {
        const data = {}
        this.db.transaction('info').openCursor().onsuccess = (event) => {
            const cursor = event.target.result
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
