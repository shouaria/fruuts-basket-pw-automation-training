# fruuts-basket-pw-automation-training

A small training repository for people to learn playwright while using a custom Gherkin solution

## Installation

To run this project you will need to have a minimum of `node v20` installed on your system (as configured in `.nvmrc`). A minimum of `npm v8` is also required.
`nvm`is recommended to retain compatibility between node versions.

From the terminal in the root directory of this project run the following commands.

1. Install dependencies

```sh
npm install
```

2. Install browsers

```sh
npx playwright install
```

## Usage

To run tests headlessly, run:

```sh
npm run test:all
```

## Scenarios

Please complete the following scenarios to the best of your ability:

1. View details for Exotic Pineapple, return to the home page -- Done as an example
2. Verify that the fruit Blueberry Burst is on the home page -- Done as an example
3. Verify that the fruit Watermelon Explosion is not on the home page
4. View the details for the Strawberry Bliss fruit, and verify that the price is $4.00
5. View the details for the Strawberry Bliss fruit, click the Buy Now button, and then click the Got it button on the Can't Accept Orders popup, verify the popup disappeared and that the user is on the Strawberry Bliss product page
6. View the details for Blueberry Burst, click the Add to Cart button, verify that it's in the cart, and verify that the subtotal is $5.00
7. Add 1 Blueberry Burst to the cart and add 1 Strawberry Bliss, and verify that the subtotal has increased by the price of the Strawberry Bliss
8. Add 2 Exotic Pineappple to the cart, and verify that the subtotal is $10.00
9. Add 1 Blueberry Burst to the cart and add 1 Strawberry Bliss, remove the Strawberry Bliss and verify that is is gone from the cart and the subtotal equals the cost of Blueberry burst
