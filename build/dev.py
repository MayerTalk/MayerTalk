"""
生成dev版本
(https://dev.mayertalk.top/)
"""

import os
import time
import json
import shutil
import hashlib

time.timezone = -28800


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
expire = 7 * 86400

version = hashlib.sha256(get_hashes(os.path.join(os.getcwd(), 'src')).encode('utf-8')).hexdigest()[:8]

with open(os.path.join('.github', 'publish.txt'), mode='rt', encoding='utf-8') as f:
    tag = f.read().strip() + ' ' + version

info = {
    'expire': expire,
    'expireString': time.strftime('%Y-%m-%d %H:%M', time.localtime(expire)),
    'message': 'git action auto build',
    'version': version,
    'tag': tag
}

with open(os.path.join('src', 'Announce.git.vue'), mode='rt', encoding='utf-8') as f:
    announce_git = f.read()
with open(os.path.join('src', 'Announce.vue'), mode='rt', encoding='utf-8') as f:
    announce = f.read()

with open(os.path.join('src', 'info.dev.js'), mode='wt', encoding='utf-8') as f:
    f.write(f'export default {json.dumps(info)}')

os.system(f'npm run build -- --base=/{version}/')

with open(os.path.join('dist', 'info.json'), mode='wt', encoding='utf-8') as f:
    json.dump(info, f)

print(f'''\033[1;32m✓ build
\033[0;36mexpire: {time.strftime("%Y-%m-%d %X", time.localtime(info["expire"]))}
\033[0;33mversion: {version}\033[0m''')

os.mkdir(os.path.join('dist', version))

path = 'dist'
for file in os.listdir(path):
    if file != version:
        shutil.move(os.path.join(path, file), os.path.join(path, version, file))
