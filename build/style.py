# -*- coding: UTF-8 -*-

import os
import re
from typing import Match

cwd = os.getcwd()


class Render:
    def __init__(self, path: str):
        self.path = path
        self.scoped_cache = {}
        self.global_cache = {}

    def scan(self, path, classes=None):
        classes = classes or []

        for file in os.listdir(path):
            file_path = os.path.join(path, file)
            if os.path.isdir(file_path):
                self.scan(file_path, classes + [file])
                continue

            print(f'build {file_path.replace(cwd,".")}')

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

    def run(self):
        self.scan(os.path.join(self.path, 'style'))

        with open(os.path.join(self.path, '.global.css'), mode='wt', encoding='utf-8') as f:
            f.write('\n\n'.join(self.global_cache.values()))
        with open(os.path.join(self.path, '.scoped.css'), mode='wt', encoding='utf-8') as f:
            f.write('\n\n'.join(self.scoped_cache.values()))


if __name__ == '__main__':
    render_path = os.path.join(cwd, 'src', 'render')
    renders = {r: Render(os.path.join(render_path, r)) for r in os.listdir(render_path) if not r.endswith('.js')}

    for path, render in renders.copy().items():
        render.run()