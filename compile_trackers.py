import json
import csv

from collections import defaultdict
from urlparse import urlparse

FILE_NAMES = 'data/ghostery.json'
FILE_DOMAINS = 'data/tracker_domains.csv'


def parse_trackers():
    domainsInfo = {}
    with open(FILE_DOMAINS, 'rb') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        for row in reader:
            domainsInfo[row[0]] = {}
            domainsInfo[row[0]]['count']=row[1]
        print len(domainsInfo)
    with open(FILE_NAMES, 'rb') as fh:
        ghosteryData = json.load(fh)

        keys = ['company_description','company_name', 'company_in_their_own_words', 'affiliation_groups','company_website_url']
        count = 0
        for domainItem in domainsInfo:
            for ghItem in ghosteryData:
                ghUrl = ghosteryData[ghItem].get('company_website_url')
                if ghUrl!=None:
                    ghUrl = urlparse(ghUrl).netloc
                    if domainItem in ghUrl:
                        count = count +1
                        for key in keys:
                            if key in ghosteryData[ghItem]:
                                #print ghItem, ghUrl, domainItem
                                domainsInfo[domainItem][key] = ghosteryData[ghItem][key]
        print count
        with open('tracker_sites.json', 'wb') as fh:
            json.dump(domainsInfo, fh, indent=2)

        with open('tracker_sites.csv', 'wb') as fh:
            writer = csv.writer(fh, delimiter=',')
            writer.writerow(['domain', 'count', 'company_name', 'company_website_url'])
            for domain, data in domainsInfo.items():
                writer.writerow([domain, data.get('count'), data.get('company_name'), data.get('company_website_url')])
                #print domain, data


if __name__ == '__main__':
    parse_trackers()
