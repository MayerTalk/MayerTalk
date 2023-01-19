# -*- coding: UTF-8 -*-

import os
import sys
import time
import hashlib
import asyncio

import aiohttp

client = None


def sign(key: str) -> dict:
    ts = str(int(time.time()))
    signature = hashlib.sha256(f'{key}MTS{ts}'.encode('utf-8')).hexdigest()
    return {'signature': signature, 'timestamp': ts}


async def upload(server: str, key: str, path: str, file: bytes, dev: str = 'false'):
    global client
    async with client.put(server, headers=sign(key), params={'path': path, 'dev': dev},
                          data={'file': file}) as r:
        if r.status:
            res = await r.json()
            if res['code'] == 200:
                return True
            else:
                return res['code']
        else:
            return r.status


def scan(path: str = os.path.join(os.getcwd(), 'dist'), web_path=''):
    res = []
    files = os.listdir(path)
    for file in files:
        file_web_path = f'{web_path}/{file}'
        file_path = os.path.join(path, file)
        if os.path.isdir(file_path):
            res.extend(scan(file_path, file_web_path))
        else:
            res.append([file_path, file_web_path])
    return res


async def run():
    global client
    client = aiohttp.ClientSession()

    server = os.environ.get('SERVER')
    key = os.environ.get('KEY')
    dev = '--dev' in sys.argv

    files = scan()
    y = len(files)
    x = 0

    for file in files:
        x += 1
        file[1] = file[1][1:]

        with open(file[0], mode='rb') as f:
            res = await upload(server, key, file[1], f.read(), dev='true' if dev else 'false')
        if res is True:
            print(f'[{x}/{y}] upload {file[1]} successfully')
        else:
            print(f'[{x}/{y}] upload {file[1]} failed \n{res}')

    if dev:
        async with client.post(f'{server}dev_reload') as r:
            if r.ok:
                print('dev reload')
            else:
                print('dev reload failed', r.status)

    await client.close()


if __name__ == '__main__':
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(run())
