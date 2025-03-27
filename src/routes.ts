import { createCheerioRouter } from "crawlee";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  await enqueueLinks({
    globs: ["https://www.education.com/common-core/**/math/"],
    label: "detail",
  });
});

router.addHandler("detail", async ({ request, $, log }) => {
  const linkDivs = $(".ccss-node-name").toArray();
  const linkDescriptions = $(".ccss-node-description").toArray();

  log.info(`found ${linkDivs.length} links`, { url: request.loadedUrl });

  const standards = linkDivs.map((el, index) => {
    const code = $(el).text().trim();
    const description = $(linkDescriptions[index]).text();

    log.info(`found link: ${code} with description: ${description}`, {
      url: request.loadedUrl,
    });

    return {
      code,
      description,
    };
  });

  // Store standards in the database
  for (const standard of standards) {
    await prisma.standard.upsert({
      where: { code: standard.code },
      update: { description: standard.description },
      create: standard,
    });
  }

  // await pushData({
  //   url: request.loadedUrl,
  //   data: standards,
  // });
});
