class DataBase {
    db: string
    table: string
    conn: IDBDatabase | null

    constructor(dbname: string, table: string) {
        this.db = dbname
        this.table = table
        this.conn = null
    }

    open(onupgradeneeded?: (db: IDBDatabase) => void, callback?: () => void) {
        const request = window.indexedDB.open(this.db)
        request.onupgradeneeded = () => {
            if (onupgradeneeded) {
                onupgradeneeded(request.result as IDBDatabase)
            }
        }
        request.onsuccess = () => {
            this.conn = request.result
            if (callback) {
                callback()
            }
        }
    }

    transaction(table = this.table, mode: IDBTransactionMode = 'readonly') {
        const conn = this.conn
        if (!conn) {
            throw new Error(`DataBase ${this.db} is not opened`)
        }
        return conn.transaction(table, mode).objectStore(table)
    }

    add<T>(data: T, table = this.table) {
        return this.transaction(table, 'readwrite').add(data)
    }

    put<T>(data: T, table = this.table) {
        return this.transaction(table, 'readwrite').put(data)
    }

    get<T>(key: IDBValidKey, table = this.table): IDBRequest<T> {
        return this.transaction(table).get(key)
    }

    delete(key: IDBValidKey, table = this.table) {
        return this.transaction(table, 'readwrite').delete(key)
    }

    clear(success?: () => void, table = this.table) {
        if (success) {
            this.transaction(table, 'readwrite').clear().onsuccess = success
        }
    }
}

export default DataBase
