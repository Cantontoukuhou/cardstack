# @cardstack/github-auth

This README outlines the details of collaborating on this Ember addon.

## Installation

* `git clone <repository-url>` this repository
* `cd @cardstack/github-auth`
* `npm install`
* `bower install`

## Running

To run the demo app and interact with GitHub, you need to register your app via https://github.com/settings/developers and get a client ID & secret. Set them via the environment variables `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. This allows this plugin to act as an OAuth2 client that speaks to GitHub on behalf of users who authorize it.

For the present, you also need a user token that the Hub can use to represent itself. You can use a [Personal Access Token](https://github.com/settings/tokens). Make sure that this token has `repo` and `user` scope, as well as push permissions on the GitHub repos that you configure to use with the github-auth plugin datasource. This allows the plugin to have sufficient privileges to be able to query the repo for collaborator permissions. Set is via the environment variable `GITHUB_TOKEN`.

Note that in order to get access to a github user's email address, the github user *must* set a public email address in their github profile settings. GitHub allows people to opt-in to having a public email, so that means by default, github users do not have a public email address.

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
