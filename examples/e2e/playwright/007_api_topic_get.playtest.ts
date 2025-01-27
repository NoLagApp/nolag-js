import { test, expect } from "@playwright/test";
import { browserInstance, nodeInstance } from "../../constants/globalVars";
import { example_api_tunnel_topic_get } from "../../SDK/API/tunnel_topics/example_api_tunnel_topic_get";
import { editTunnelTopicUsingTopicId } from "../procedures/006_api_topic_edit";
import { getTunnelTopicUsingTopicId } from "../procedures/007_api_topic_get";

test.describe("Playwright Api Get Tunnel Topic", () => {
  test("BROWSER: Get tunnel topic using topicID", async ({ page }) => {
    const args = {
      topicId: browserInstance.topic.topicId ?? "",
      noLagDeveloperTestConfigIgnore: browserInstance.noLagDeveloperTestConfigIgnore,
      yourProjectApiKey: browserInstance.yourProjectApiKey,
      tunnelId: browserInstance.tunnel.tunnelId ?? "",
    };

    await page.goto(browserInstance.viteHostUrl);

    const response = await page.evaluate((args) => {
      return getTunnelTopicUsingTopicId(args);
    }, args);

    if (response) {
      browserInstance.setTopic(response);
    }

    expect(response).toMatchObject(browserInstance.topic as Record<any, any>);
  });

  test("NODE: Get tunnel topic using topicID", async ({ page }) => {
    const args = {
      topicId: browserInstance.topic.topicId ?? "",
      noLagDeveloperTestConfigIgnore: browserInstance.noLagDeveloperTestConfigIgnore,
      yourProjectApiKey: browserInstance.yourProjectApiKey,
      tunnelId: browserInstance.tunnel.tunnelId ?? "",
    };

    await page.goto(browserInstance.viteHostUrl);

    const response = await getTunnelTopicUsingTopicId(args);

    if (response) {
      browserInstance.setTopic(response);
    }

    expect(response).toMatchObject(browserInstance.topic as Record<any, any>);
  });
});
