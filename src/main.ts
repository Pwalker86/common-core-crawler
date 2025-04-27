// For more information, see https://crawlee.dev/
import { CheerioCrawler } from "crawlee";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

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
