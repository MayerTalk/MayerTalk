# -*- coding: UTF-8 -*-

import os
import sys
import time
import json
import shutil
import hashlib
from datetime import datetime, timezone, timedelta

time.timezone = -28800


def argv(name, formatter=str):
    key = f'--{name}'
    if key in sys.argv:
        index = sys.argv.index(key) + 1

        if index >= len(sys.argv):
            return True

        if sys.argv[index].startswith('--'):
            return True
        else:
            return formatter(sys.argv[index])


def get_hashes(path: str) -> str:
    files = os.listdir(path)
    res = ''
    for file in files:
        if '.dev.' in file:
            continue
        file_path = os.path.join(path, file)
        if os.path.isdir(file_path):
            res += get_hashes(file_path)
        else:
            with open(file_path, mode='rb') as f:
                res += hashlib.sha256(f.read()).hexdigest()
    return res


now = int(time.time())
now4 = now - (now + 8 * 3600) % 86400 + 4 * 3600
expire = now4 + 7 * 86400

version = hashlib.sha256(get_hashes(os.path.join(os.getcwd(), 'src')).encode('utf-8')).hexdigest()[:8]

with open(os.path.join('.github', 'publish.txt'), mode='rt', encoding='utf-8') as f:
    tag = f.read().strip() + ' ' + version

info = {
    'expire': expire,
    'expireString': datetime.utcnow().replace(tzinfo=timezone.utc)
    .astimezone(timezone(timedelta(hours=8)))
    .strftime('%Y-%m-%d %H:%M (UTC+8)'),
    'build': int(time.time()),
    'message': argv('message') or 'Github Action 自动部署',
    'version': version,
    'tag': argv('tag') or tag
}

with open(os.path.join('src', 'AnnounceDialog.git.vue'), mode='rt', encoding='utf-8') as f:
    announce_git = f.read()
with open(os.path.join('src', 'AnnounceDialog.vue'), mode='wt', encoding='utf-8') as f:
    f.write(announce_git)

with open(os.path.join('src', 'info.dev.ts'), mode='wt', encoding='utf-8') as f:
    f.write(f'export default {json.dumps(info)}')

os.system(f'npm run build -- --base=/{version}/')

with open(os.path.join('dist', 'info.json'), mode='wt', encoding='utf-8') as f:
    json.dump(info, f)

print(f'''\033[1;32mbuild
\033[0;36mexpire: {time.strftime("%Y-%m-%d %X", time.localtime(info["expire"]))}
\033[0;33mversion: {version}\033[0m''')

os.mkdir(os.path.join('dist', version))

path = 'dist'
for file in os.listdir(path):
    if file != version:
        shutil.move(os.path.join(path, file), os.path.join(path, version, file))
