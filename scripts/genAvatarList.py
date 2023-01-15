"""
生成avatar列表
"""

import os
import re
import json
import hashlib

from common import join


def list_avatar(path, dirs=None) -> list:
    dirs = dirs or []
    files = os.listdir(path)
    res = []
    for file in files:
        file: str
        if os.path.isdir(os.path.join(path, file)):
            res.extend(list_avatar(os.path.join(path, file), dirs + [file]))
        else:
            name = file.split('_')
            if name[0] in ['装置', '敌人', '召唤物']:
                name = name[1]
            else:
                name = name[0]
            name = name.replace('.webp', '')

            res.append(['.'.join(file.split('.')[:-1]), '/' + '/'.join(dirs + [file]), name])
    return res


avatars = list_avatar(join('public', 'avatar'), dirs=['avatar'])

js = f'export default {json.dumps(avatars)}'
hash = hashlib.sha256(str(avatars).encode('utf-8')).hexdigest()[:8]

with open(join('public', 'avatar.js'), mode='wt', encoding='utf-8') as f:
    f.write(js)
with open(join('src', 'main.js'), mode='rt', encoding='utf-8') as f:
    main_js = re.sub(r"app\.provide\('avatarsJs',.+", f"app.provide('avatarsJs','avatar.js?v={hash}');", f.read())
with open(join('src', 'main.js'), mode='wt', encoding='utf-8') as f:
    f.write(main_js)
