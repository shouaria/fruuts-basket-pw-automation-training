Feature: See a fruit's details

  As a user, I want to be able to see details about a fruit before I buy it

  Scenario: User is able to return to the home page after viewing a fruit's details
    Given I am on the Blueberry Burst product page
    When I return to the Fruuts Basket home page
    Then I am on the home page

