import os

path = os.path.dirname(os.path.dirname(__file__))


def join(*args):
    return os.path.join(path, *args)
