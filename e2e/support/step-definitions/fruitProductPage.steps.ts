import { Page } from "@playwright/test";
import { Step } from "e2e/support/step-definitions/steps";
import { FruitProductPage } from "../page-objects/fruitProduct.page";
import { AllFruits } from "../types/fruits";

export const fruitProductPageSteps = (page: Page) => {
    const fruitProductPage = new FruitProductPage(page);

    return {
        GIVEN: (prefix = "GIVEN") => {
            return {
                "I am on the <fruitName> product page": async (fruitName: AllFruits) => {
                    await Step(prefix, `I am on the ${fruitName} product page`, async () => {
                        await fruitProductPage.goTo(fruitName);
                    });
                },
            };
        },

        WHEN: (prefix: "WHEN" | "AND" = "WHEN") => {
            return {
                "I return to the Fruuts Basket home page": async () => {
                    await Step(prefix, "I return to the Fruuts Basket home page", async () => {
                        await fruitProductPage.elements.HOME_LINK.click();
                    });
                },
            };
        },

        THEN: (prefix: "THEN" | "AND" = "THEN") => {
            return {
                "I can see the fruit's name and details": async (fruitName: AllFruits) => {
                    await Step(prefix, `I can see the ${fruitName}'s name and details`, async () => {
                        await fruitProductPage.expectToBeOpen(fruitName);
                        await fruitProductPage.expectToHaveCorrectURL(fruitName);
                        await fruitProductPage.assertFruitDetails(fruitName);
                    });
                },
            };
        },
    };
};
