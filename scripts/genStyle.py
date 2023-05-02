"""
生成 .scoped.css .global.css 聚合各主题
"""

import os
import re
import time
from typing import Match

from common import join

os.system('')


class Render:
    def __init__(self, path: str):
        self.path = path
        self.scoped_cache = {}
        self.global_cache = {}
        self.files = {}

    def scan(self, path, classes=None) -> bool:
        global cls
        classes = classes or []
        update = False

        for file in os.listdir(path):
            file_path = os.path.join(path, file)
            if os.path.isdir(file_path):
                if self.scan(file_path, classes + [file]):
                    update = True
                continue
            elif file_path in self.files and os.path.getmtime(file_path) == self.files[file_path]:
                continue

            self.files[file_path] = os.path.getmtime(file_path)

            update = True
            if not cls:
                os.system('cls')
                cls = True
            print(f'\033[1;30m{time.strftime("%X")} \033[0;32mupdate\033[1;30m {file_path}\033[0m')

            with open(file_path, mode='rt', encoding='utf-8') as f:
                css = f.read()
            tmp_classes = re.findall(r'/\*class:? (.+?)\*/', css)

            repl = ' '.join(['.' + c for c in classes + tmp_classes])
            if repl:
                repl += ' '

            def sub(match: Match):
                return repl + match.group(0)

            _from = f'/*from {"/".join(classes + [file])}*/\n\n'

            if file.endswith('.global.css'):
                self.global_cache[file_path] = _from + re.sub(r'[^\s{}/](?:[^{}/]|/\*\*/)*\{[^{}]*\}', sub, css)
            else:
                self.scoped_cache[file_path] = _from + re.sub(r'[^\s{}/](?:[^{}/]|/\*\*/)*\{[^{}]*\}', sub, css)

        return update

    def run(self):
        path = os.path.join(self.path, 'style')

        update = self.scan(path)

        for file in self.files:
            if not os.path.exists(file):
                self.files.pop(file)
                if file in self.scoped_cache:
                    self.scoped_cache.pop(file)
                elif file in self.global_cache:
                    self.global_cache.pop(file)
                update = True

        if update:
            with open(os.path.join(self.path, '.global.css'), mode='wt', encoding='utf-8') as f:
                f.write('\n\n'.join(self.global_cache.values()))
            with open(os.path.join(self.path, '.scoped.css'), mode='wt', encoding='utf-8') as f:
                f.write('\n\n'.join(self.scoped_cache.values()))
            return True


if __name__ == '__main__':
    render_path = join('src', 'editor')
    renders = {r: Render(os.path.join(render_path, r)) for r in os.listdir(render_path) if not r.endswith('.js')}
    cls = False

    while True:
        for path, render in renders.copy().items():
            if not os.path.exists(os.path.join(render_path, path)):
                renders.pop(path)
                continue

            try:
                render.run()
            except (RuntimeError, FileNotFoundError):
                pass

        for path in os.listdir(render_path):
            if path not in renders and not path.endswith('.js'):
                render = Render(os.path.join(render_path, path))
                renders[path] = render
                try:
                    render.run()
                except RuntimeError:
                    pass

        cls = False
        time.sleep(0.2)
