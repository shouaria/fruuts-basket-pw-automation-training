import { expect, Page } from "@playwright/test";
import { HomePage } from "e2e/support/page-objects/home.page";
import { Step } from "e2e/support/steps";
import { AllFruits } from "../types/fruits";

export const homePageSteps = (page: Page) => {
    const homePage = new HomePage(page);

    return {
        GIVEN: (prefix = "GIVEN") => {
            return {
                "I am on the Fruuts Basket home page": async () => {
                    await Step(prefix, "I am on the Fruuts Basket home page", async () => {
                        await homePage.goTo();
                    });
                },
            };
        },

        WHEN: (prefix: "WHEN" | "AND" = "WHEN") => {
            return {
                "I proceed to the product page for the fruit <fruitName>": async (fruitName: AllFruits) => {
                    await Step(prefix, `I proceed to the product page for the fruit ${fruitName}`, async () => {
                        await homePage.proceedToViewDetailsForFruit(fruitName);
                    });
                },
            };
        },

        THEN: (prefix: "THEN" | "AND" = "THEN") => {
            return {
                "I am on the home page": async () => {
                    await Step(prefix, "I am on the home page", async () => {
                        await homePage.expectToBeOpen();
                        await homePage.expectToHaveCorrectURL();
                    });
                },

                "I can see the fruit <fruitName>": async (fruitName: AllFruits) => {
                    await Step(prefix, `I can see the fruit ${fruitName}`, async () => {
                        await expect(homePage.sections.FRUIT_SLIDER_SECTION.getByRole("heading", { name: fruitName })).toBeVisible();
                    });
                },
            };
        },
    };
};
