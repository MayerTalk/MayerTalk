class DataBase<Record> {
    db: string
    table: string
    conn: IDBDatabase | null

    constructor(dbname: string, table: string) {
        this.db = dbname
        this.table = table
        this.conn = null
    }

    open(onupgradeneeded?: (ev:IDBVersionChangeEvent) => void, callback?: () => void) {
        const request = window.indexedDB.open(this.db)
        request.onupgradeneeded = onupgradeneeded as ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => void) | null
        request.onsuccess = () => {
            this.conn = request.result
            if (callback) {
                callback()
            }
        }
    }

    transaction(table = this.table, mode: IDBTransactionMode = 'readonly') {
        return this.conn!.transaction(table, mode).objectStore(table)
    }

    add(data: Record, table = this.table) {
        return this.transaction(table, 'readwrite').add(data)
    }

    put(data: Record, table = this.table) {
        return this.transaction(table, 'readwrite').put(data)
    }

    get(key: IDBValidKey, table = this.table):IDBRequest<Record> {
        return this.transaction(table).get(key)
    }

    delete(key: IDBValidKey, table = this.table) {
        return this.transaction(table, 'readwrite').delete(key)
    }

    clear(success: () => void, table = this.table) {
        this.transaction(table, 'readwrite').clear().onsuccess = success
    }
}

export default DataBase
