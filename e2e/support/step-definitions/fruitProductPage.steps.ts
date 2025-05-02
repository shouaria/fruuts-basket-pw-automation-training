import { Page } from "@playwright/test";
import { Step, GivenPrefix, GIVEN_PREFIX, WhenPrefix, WHEN_PREFIX, ThenPrefix, THEN_PREFIX } from "e2e/support/step-definitions/steps";
import { FruitProductPage } from "../page-objects/fruitProduct.page";
import { AllFruits } from "../types/fruits";

export const fruitProductPageSteps = (page: Page) => {
    const fruitProductPage = new FruitProductPage(page);

    return {
        GIVEN: (prefix: GivenPrefix = GIVEN_PREFIX) => {
            return {
                "I am on the <fruitName> product page": async (fruitName: AllFruits) => {
                    await Step(prefix, `I am on the ${fruitName} product page`, async () => {
                        await fruitProductPage.goTo(fruitName);
                    });
                },
            };
        },

        WHEN: (prefix: WhenPrefix = WHEN_PREFIX) => {
            return {
                "I return to the Fruuts Basket home page": async () => {
                    await Step(prefix, "I return to the Fruuts Basket home page", async () => {
                        await fruitProductPage.elements.HOME_LINK.click();
                    });
                },
            };
        },

        THEN: (prefix: ThenPrefix = THEN_PREFIX) => {
            return {
                "I can see the <fruitName>'s name and details": async (fruitName: AllFruits) => {
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
