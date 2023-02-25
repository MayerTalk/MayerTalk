const DataBase = class DataBase {
    constructor(dbname, table) {
        this.db = dbname;
        this.table = table;
        this.conn = null
    }

    open(onupgradeneeded, callback) {
        const request = window.indexedDB.open(this.db);
        request.onupgradeneeded = onupgradeneeded;
        request.onsuccess = (event) => {
            this.conn = request.result;
            callback && callback()
        }
    }

    transaction(table = this.table, mode = 'readonly') {
        return this.conn.transaction(table, mode).objectStore(table)
    }

    add(data, table = this.table) {
        return this.transaction(table, 'readwrite').add(data)
    }

    put(data, table = this.table) {
        return this.transaction(table, 'readwrite').put(data)
    }

    get(key, table = this.table) {
        return this.transaction(table).get(key)
    }

    delete(key, table = this.table) {
        return this.transaction(table, 'readwrite').delete(key)
    }

    clear(success, table = this.table) {
        this.transaction(table, 'readwrite').clear().onsuccess = success
    }
};

export default DataBase