"""
生成dev版本
(https://dev.mayertalk.top/)
"""

import os
import re
import sys
import time
import json
import shutil
import hashlib

from common import join


def get_hashes(path: str) -> str:
    files = os.listdir(path)
    res = ''
    for file in files:
        if '.dev.' in file:
            continue
        fpath = os.path.join(path, file)
        if os.path.isdir(fpath):
            res += get_hashes(fpath)
        else:
            with open(fpath, mode='rb') as f:
                res += hashlib.sha256(f.read()).hexdigest()
    return res


now = int(time.time())
now4 = now - (now + 8 * 3600) % 86400 + 4 * 3600

if '-t' in sys.argv:
    expire = int(sys.argv[sys.argv.index('-t') + 1])
elif '-d' in sys.argv:
    expire = int(sys.argv[sys.argv.index('-d') + 1]) * 86400
else:
    expire = 7 * 86400

expire += now if '-n' in sys.argv else now4

version = hashlib.sha256(get_hashes(join('src')).encode('utf-8')).hexdigest()[:8]

if '-m' in sys.argv:
    message = sys.argv[sys.argv.index('-m') + 1]
else:
    message = ''

if '-tag' in sys.argv:
    tag = sys.argv[sys.argv.index('-tag') + 1]
else:
    tag = version

info = {
    'expire': expire,
    'expireString': time.strftime('%Y-%m-%d %H:%M', time.localtime(expire)),
    'message': message,
    'version': version,
    'tag': tag
}

with open(join('src', 'AnnounceDialog.dev.vue'), mode='rt', encoding='utf-8') as f:
    announce_dev = f.read()
with open(join('src', 'AnnounceDialog.vue'), mode='rt', encoding='utf-8') as f:
    announce = f.read()
with open(join('src', 'AnnounceDialog.vue'), mode='wt', encoding='utf-8') as f:
    f.write(announce_dev)

with open(join('src', 'info.dev.ts'), mode='wt', encoding='utf-8') as f:
    f.write(f'export default {json.dumps(info)}')

os.system('')
os.system(f'npm run build -- --base=/{version}/')

with open(join('src', 'AnnounceDialog.vue'), mode='wt', encoding='utf-8') as f:
    f.write(announce)

shutil.rmtree(join('dist', 'avatar'))
os.remove(join('dist', 'avatar.js'))

with open(join('dist', 'info.json'), mode='wt', encoding='utf-8') as f:
    json.dump(info, f)

print(f'''\033[1;32m✓ build
\033[0;36mexpire: {time.strftime("%Y-%m-%d %X", time.localtime(info["expire"]))}
\033[0;33mversion: {version}\033[0m''')

os.mkdir(join('dist', version))

path = join('dist')
for file in os.listdir(path):
    if file != version:
        shutil.move(os.path.join(path, file), os.path.join(path, version, file))
