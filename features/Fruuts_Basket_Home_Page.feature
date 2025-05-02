Feature: Fruuts Basket Home Page

  As a user, I want to be able to do things on the home page

  Scenario: User is able to see details for the fruit 'Exotic Pineapple'
    Given I am on the Fruuts Basket home page
    When I proceed to the product page for the fruit Exotic Pineapple
    Then I can see the Exotic Pineapple's name and details

  Scenario: User is able to see a 'Blueberry Burst' on the first page
    Given I am on the Fruuts Basket home page
    Then I can see the fruit Blueberry Burst

