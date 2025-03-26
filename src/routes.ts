import { createCheerioRouter } from "crawlee";

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  await enqueueLinks({
    globs: ["https://www.education.com/common-core/**/math/"],
    label: "detail",
  });
});

router.addHandler("detail", async ({ request, $, log, pushData }) => {
  const linkDivs = $(".ccss-node-name").toArray();
  const linkDescriptions = $(".ccss-node-description").toArray();

  log.info(`found ${linkDivs.length} links`, { url: request.loadedUrl });

  const data = linkDivs.reduce((acc, el, index) => {
    const link = $(el).text();
    const description = $(linkDescriptions[index]).text();

    log.info(`found link: ${link} with description: ${description}`, {
      url: request.loadedUrl,
    });

    acc[link.trim()] = description;
    return acc;
  }, {});

  await pushData({
    url: request.loadedUrl,
    data,
  });
});
