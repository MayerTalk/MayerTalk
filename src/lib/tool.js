import {v4 as uuid} from 'uuid'

function copy(obj) {
    return JSON.parse(JSON.stringify(obj
    ))
}

export {
    copy,
    uuid
}