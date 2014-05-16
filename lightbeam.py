import json
from collections import defaultdict

FILE_NAMES = 'data/lightbeamData.json'


def parse_stats():
    with open(FILE_NAMES, 'rb') as fh:
        data = json.load(fh)
        for conn in data.get('connections'):
            source, target, timestamp, contentType, cookie, sourceVisited, \
                secure, sourcePathDepth, sourceQueryDepth, sourceSub, \
                targetSub, method, status, cacheable, xx = conn
            print source


if __name__ == '__main__':
    parse_stats()
