"""
Copyright (c) 2020-present SMC Treviso s.r.l. All rights reserved.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
"""

from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors.lxmlhtml import LxmlLinkExtractor
import json
import requests
from datetime import datetime
from bs4 import BeautifulSoup
import ast
import re

from .util import get_favicon, str_to_bool


class WebSpider(CrawlSpider):

    name = "SimpleWebCrawler"

    def __init__(self, timestamp, datasource_id, ingestion_url, allowed_domains, start_urls, allowed_paths,
                 excluded_paths, follow, max_length, *args, **kwargs):
        super(WebSpider, self).__init__(*args, **kwargs)
        self.allowed_domains = ast.literal_eval(allowed_domains)
        self.start_urls = ast.literal_eval(start_urls)
        self.allowed_paths = ast.literal_eval(allowed_paths)
        self.excluded_paths = ast.literal_eval(excluded_paths)
        self.ingestion_url = ingestion_url
        self.datasource_id = datasource_id
        self.timestamp = int(timestamp)
        self.follow = str_to_bool(follow)
        self.max_length = int(max_length)

        WebSpider.rules = (
            Rule(
                LxmlLinkExtractor(allow=(self.allowed_paths)),
                callback="parse"),)
        super(WebSpider, self)._compile_rules()

        start_datetime = datetime.fromtimestamp(self.timestamp/1000)
        start_date = datetime.strftime(start_datetime, "%d-%b-%Y")

        self.logger.info("Getting pages from " + start_date)

        self.end_timestamp = datetime.utcnow().timestamp()*1000

    def post_message(self, url, payload, timeout):

        try:
            r = requests.post(url, data=payload, timeout=timeout)
            if r.status_code == 200:
                return
            else:
                r.raise_for_status()
        except requests.RequestException as e:
            self.logger.error(str(e) + " during request at url: " + str(url))
            raise e

    def exclude_url(self, url):

        for path in self.excluded_paths:
            if re.search(path, url) is not None:
                return True
        return False


    def parse(self, response, **kwargs):

        self.logger.info('Crawling of page with url: ' + str(response.url))

        if not self.exclude_url(response.url):

            title = response.css('title::text').get()
            if title is not None:
                title = title.strip()
            else:
                title = "Unknown title"
            body = response.body
            soup = BeautifulSoup(body, 'lxml')
            content = ''
            for p in soup.find_all("p"):
                content = content + p.get_text()
            content = content.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ').strip()
            content = re.sub(' +', ' ', content)

            datasource_payload = {
                "web": {
                    "url": response.url,
                    "title": title,
                    "content": content[:self.max_length],
                    "favicon": get_favicon(response.url),
                }
            }

            payload = {
                "datasourceId": self.datasource_id,
                "contentId": hash(str(response.url)),
                "parsingDate": int(self.end_timestamp),
                "rawContent": content[:self.max_length],
                "datasourcePayload": json.dumps(datasource_payload)
            }

            self.post_message(self.ingestion_url, payload, 10)
            self.logger.info('Page with url: ' + str(response.url) + ' ingestioned')
            if self.follow:
                for href in response.css('a::attr(href)'):
                    try:
                        yield response.follow(href, callback=self.parse)
                    except ValueError:
                        self.logger.info("Filtered url " + str(href))
        else:
            self.logger.info(str(response.url) + " excluded")