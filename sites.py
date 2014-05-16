import os
import json
import csv
from collections import defaultdict

DIR_NAME = 'data/sites/'


def parse_stats():
    #fhw = open('lightbeam.csv', 'wb')
    #writer = csv.writer(fhw)
    #writer.writerow(['source', 'target', 'contentType', 'sourceSub',
    #                 'targetSub', 'method', 'status'])
    #combos = set()
    news2sites = defaultdict(set)
    sites2news = defaultdict(set)
    for site_name in os.listdir(DIR_NAME):
        path = os.path.join(DIR_NAME, site_name)
        with open(path, 'rb') as fh:
            data = json.load(fh)
            for conn in data.get('connections'):
                source, target, timestamp, contentType, cookie, sourceVisited, \
                    secure, sourcePathDepth, sourceQueryDepth, sourceSub, \
                    targetSub, method, status, cacheable, xx = conn
                #print site_name, target
                if target != site_name:
                    news2sites[site_name].add(target)
                    sites2news[target].add(site_name)
    #fhw.close()
    def conv(s):
        data = {}
        for e, n in s.items():
            data[e] = {'num': len(n), 'links': list(n)}
        return data

    with open('links.json', 'wb') as fh:
        data = {'sites': conv(news2sites), 'networks': conv(sites2news)}
        json.dump(data, fh, indent=2)


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
