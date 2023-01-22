import Request from '@/lib/request'
import {StaticUrl} from "@/constance";

const request = new Request({host: StaticUrl});

const CharDict = {};
const loaded = [];

function loadChar(series) {
    if (loaded.indexOf(series) !== -1) {
        return
    }
    request.get({
        url: 'version/' + series + '.txt?t=' + Date.now(),
        success: (resp) => {
            request.get({
                url: 'char/' + series + '.json?v=' + resp.data,
                success: (resp) => {
                    loaded.push(series);
                    for (let charId in resp.data) {
                        if (resp.data.hasOwnProperty(charId)) {
                            CharDict[charId] = resp.data[charId]
                        }
                    }
                }
            })
        }
    })
}

export {
    CharDict,
    loadChar
}