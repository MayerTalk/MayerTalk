"""
生成avatar列表
"""

import os
import json

from common import join


def list_avatar(path, dirs=None) -> list:
    dirs = dirs or []
    files = os.listdir(path)
    res = []
    for file in files:
        if os.path.isdir(os.path.join(path, file)):
            res.extend(list_avatar(os.path.join(path, file), dirs + [file]))
        else:
            res.append(['.'.join(file.split('.')[:-1]), '/'.join(dirs + [file])])
    return res


avatars = list_avatar(join('public', 'avatar'), dirs=['avatar'])

js = f'export default {json.dumps(avatars, ensure_ascii=False)}'
with open(join('src', 'avatars.js'), mode='wt', encoding='utf-8') as f:
    f.write(js)
