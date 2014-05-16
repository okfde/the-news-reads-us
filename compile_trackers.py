import json
import csv

from collections import defaultdict

FILE_NAMES = 'data/ghostery.json'
FILE_DOMAINS = 'data/tracker_domains.csv'


def parse_trackers():
    domains_info = {}
    with open(FILE_DOMAINS, 'rb') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        for row in reader:
            name = row[0].strip().split('.', 1)[0]
            domains_info[name] = {}
            domains_info[name]['domain']=row[0].strip()
            domains_info[name]['count']=row[1]

    with open(FILE_NAMES, 'rb') as fh:
        ghostery_data = json.load(fh)

        keys = ['company_description', 'company_in_their_own_words', 'affiliation_groups','company_website_url']

        for item in ghostery_data:
            if item in domains_info:
                for key in keys:
                    domains_info[item][key] = ghostery_data[item][key]

    with open('tracker_sites.json', 'wb') as fh:
        json.dump(domains_info, fh, indent=2)


if __name__ == '__main__':
    parse_trackers()
