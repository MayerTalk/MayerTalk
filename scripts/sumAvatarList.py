"""
生成avatar列表
"""

import os
import json

path = os.path.dirname(os.path.dirname(__file__))

avatars = os.listdir(os.path.join(path, 'public', 'avatar'))
avatars = ['.'.join(avatar.split('.')[:-1]) for avatar in avatars]

js = f'export default {json.dumps(avatars, indent=4, ensure_ascii=False)}'
with open(os.path.join(path, 'src', 'avatars.js'), mode='wt', encoding='utf-8') as f:
    f.write(js)
