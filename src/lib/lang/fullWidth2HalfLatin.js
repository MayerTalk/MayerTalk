// 全宽拉丁转为半款

const dictionary = {}
let preReg = ''

function parse (seq) {
    const f = JSON.parse('"\\u' + (seq + 65296).toString(16) + '"')
    preReg += f + '|'
    dictionary[f] = JSON.parse('"\\u00' + (seq + 48).toString(16) + '"')
}

for (let i = 0; i < 10; i++) {
    // 0~9
    parse(i)
}
for (let i = 17; i < 43; i++) {
    // A-Z
    parse(i)
}
for (let i = 49; i < 75; i++) {
    // a-z
    parse(i)
}

preReg = preReg.slice(0, -1)
const reg = new RegExp(preReg, 'g')

function fullWidth2HalfLatin (text) {
    return text.replaceAll(reg, (i) => {
        return dictionary[i]
    })
}

export {
    fullWidth2HalfLatin
}
