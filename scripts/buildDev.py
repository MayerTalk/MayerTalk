import os
import sys
import time
import json
import shutil
import hashlib

from common import join

os.system('')
os.system('npm run build')

shutil.rmtree(join('dist', 'avatar'))
os.remove(join('dist', 'avatar.js'))


def get_files(path: str) -> str:
    files = os.listdir(path)
    res = ''
    for file in files:
        fpath = os.path.join(path, file)
        if os.path.isdir(fpath):
            res += get_files(fpath)
        else:
            res += file
    return res


if '-t' in sys.argv:
    expire = int(sys.argv(sys.argv.index('-t') + 1))
elif '-d' in sys.argv:
    expire = int(sys.argv(sys.argv.index('-d') + 1)) * 86400
else:
    expire = 7 * 86400

version = hashlib.sha256(get_files(join('dist')).encode('utf-8')).hexdigest()[:8]

if '-m' in sys.argv:
    message = sys.argv(sys.argv.index('-m') + 1)
else:
    message = ''

info = {
    'expire': int(time.time()) + expire,
    'message': message,
    'version': version
}

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
