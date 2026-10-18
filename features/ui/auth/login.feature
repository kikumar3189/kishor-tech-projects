@ui @auth
Feature: Partner Portal login
  As a partner of Grip Invest
  I want a clear sign-in screen
  So that I can access my client book securely

  @smoke
  Scenario: Unauthenticated partner sees the email input
    Given I am an unauthenticated partner
    When I open the login page
    Then I should see the email input
