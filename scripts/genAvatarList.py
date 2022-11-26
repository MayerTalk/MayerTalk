"""
生成avatar列表
"""

import os
import json

from common import join

avatars = os.listdir(join('public', 'avatar'))
avatars = ['.'.join(avatar.split('.')[:-1]) for avatar in avatars]

js = f'export default {json.dumps(avatars, indent=4, ensure_ascii=False)}'
with open(join('src', 'avatars.js'), mode='wt', encoding='utf-8') as f:
    f.write(js)
