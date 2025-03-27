// For more information, see https://crawlee.dev/
import { CheerioCrawler, ProxyConfiguration } from "crawlee";
import { PrismaClient } from "@prisma/client";

import { router } from "./routes.js";

const startUrls = ["https://www.education.com/common-core/"];
const prisma = new PrismaClient();

const crawler = new CheerioCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  requestHandler: router,
  // Comment this option to scrape the full website.
  maxRequestsPerCrawl: 20,
});

try {
  await crawler.run(startUrls);
} finally {
  await prisma.$disconnect();
}
