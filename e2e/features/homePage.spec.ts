import { Scenario } from "e2e/support/steps";

Scenario.describe(
    "Fruuts Basket Home Page",
    {
        annotation: {
            type: "Feature",
            description: "As a user, I want to be able to do things on the home page",
        },
    },
    () => {
        Scenario("User is able to see details for the fruit 'Exotic Pineapple'", async ({ steps }) => {
            await steps.GIVEN["I am on the Fruuts Basket home page"]();
            await steps.WHEN["I proceed to the product page for the fruit <fruitName>"]("Exotic Pineapple");
            await steps.THEN["I can see the fruit's name and details"]("Exotic Pineapple");
        });

        Scenario("User is able to see a 'Blueberry Burst' on the first page", async ({ steps }) => {
            await steps.GIVEN["I am on the Fruuts Basket home page"]();
            await steps.THEN["I can see the fruit <fruitName>"]("Blueberry Burst");
        });
    }
);
