Feature: ACCESS THE INTERWEBZ AND DO A SEARCH

Scenario: DuckDuckGo Search for [Type]

    Given I visit http://www.duckduckgo.com
    When I type in [Type]
    When I click search
    Then '[Expected]' exists in the page

    Where:
        Type | Expected
        nightwatch | Night Watch
        bower | bower.io/
@wip
Scenario: DuckDuckGo Search for [Type] WIP

    Given I visit http://www.duckduckgo.com
    When I type in [Type]
    When I click search
    Then '[Expected]' exists in the page

    Where:
        Type | Expected
        nightwatch | Night Watch
        bower | bower.io/
