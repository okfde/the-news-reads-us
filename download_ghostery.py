import json
from multiprocessing import Pool
import sys

import requests


def get(tracker_id):
    url = 'https://www.ghostery.com/en/apps/%s?format=json' % tracker_id
    sys.stderr.write('%s\n' % tracker_id)
    response = requests.get(url)
    data = {}
    try:
        data = response.json()
    except ValueError:
        sys.stderr.write('Failed: %s\n' % tracker_id)
    data['_source'] = url
    return tracker_id, data


def main():
    trackers = {}
    with file('data/ghostery-index.json') as f:
        tracker_ids = [t[1].split('/')[-1] for t in json.load(f)]
        pool = Pool(processes=10)
        results = pool.map(get, tracker_ids)
        for tracker_id, data in results:
            trackers[tracker_id] = data

    json.dump(trackers, sys.stdout)

if __name__ == '__main__':
    main()
