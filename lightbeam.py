import json
import csv
from collections import defaultdict

FILE_NAMES = 'data/lightbeamData.json'


def parse_stats():
    fhw = open('lightbeam.csv', 'wb')
    writer = csv.writer(fhw)
    writer.writerow(['source', 'target', 'contentType', 'sourceSub',
                     'targetSub', 'method', 'status'])
    combos = set()
    with open(FILE_NAMES, 'rb') as fh:
        data = json.load(fh)
        for conn in data.get('connections'):
            source, target, timestamp, contentType, cookie, sourceVisited, \
                secure, sourcePathDepth, sourceQueryDepth, sourceSub, \
                targetSub, method, status, cacheable, xx = conn
            print source
            writer.writerow([source, target, contentType, sourceSub, targetSub,
                             method, status])
            if source != target:
                combos.add((source, target))
    fhw.close()
    recursive_hits(combos)


def recursive_hits(combos):
    counts = defaultdict(int)
    for src, tgt in combos:
        counts[src] += 1
    for src, tgt in combos:
        counts[src] = counts[src] + counts[tgt]

    with open('lightbeam_counts.csv', 'wb') as fhw:
        writer = csv.writer(fhw)
        writer.writerow(['source', 'count'])
        for src, count in counts.items():
            writer.writerow([src, count])

if __name__ == '__main__':
    parse_stats()
