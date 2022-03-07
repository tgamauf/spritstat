import {RouteNames} from "../../src/common/types";

describe("Validate initial page load", () => {
  it("verify index redirects", () => {
    cy.visit(RouteNames.Index);
    cy.title().should("eq", "SPRITSTAT");
    cy.url().should("include", RouteNames.Home)

    cy.mockLoggedIn();
    cy.mockSettings();
    cy.visit(RouteNames.Index);
    cy.wait("@isAuthenticated");
    cy.url().should("include", RouteNames.Dashboard);
 });

  it("validate content of homepage if logged out", () => {
    cy.visit(RouteNames.Home);

    cy.hasBaseStructure(false);

    // Check if the text blocks exist
    cy.getBySel("content-text").should("have.length.at.least", 2);

    // Check if the demo graph exists
    cy.getBySel("content-img")
      .should("have.attr", "src")
      .should("include", "home-graph");

    // Check if the register button exists
    cy.getBySel("btn-register")
      .should("be.visible")
      .click()
      .then(() => {
        cy.url().should("include", RouteNames.Signup);
     })
 });

  it("validate content of homepage if logged in", () => {
    cy.mockLoggedIn();
    cy.mockSettings();
    cy.visit(RouteNames.Home);
    cy.wait("@isAuthenticated");
    cy.hasBaseStructure(true);
    cy.getBySel("content-text").should("have.length.at.least", 2);
    cy.getBySel("content-img").should("exist");
 });

  it("validate login button", () => {
    cy.visit(RouteNames.Home);

    cy.getBySel("header-btn-login").click();
    cy.url().should("include", RouteNames.Login);
 });

  it("validate header dropdown buttons", () => {
    cy.mockSettings();
    cy.resetDB(["customuser.json", "emailaddress.json"]);
    cy.login("test@test.at", "test");

    cy.visit(RouteNames.Home);

    cy.wait("@isAuthenticated");
    cy.getBySel("header-dropdown").realHover();
    cy.getBySel("link-settings").click();
    cy.url().should("include", RouteNames.Settings);
    cy.go("back");

    cy.getBySel("header-dropdown").realHover();
    cy.getBySel("link-contact").click();
    cy.url().should("include", RouteNames.Contact);
    cy.go("back");

    cy.getBySel("header-dropdown").realHover();
    cy.getBySel("link-logout").click();
    cy.url().should("include", RouteNames.Login);
 });

  it("validate footer links", () => {
    cy.visit(RouteNames.Home);

    // TODO: "force: true" is a workaround till
    //  https://github.com/cypress-io/cypress/issues/7306 is fixed
    cy.getBySel("link-imprint").click({force: true});
    cy.url().should("include", RouteNames.Imprint);
    cy.go("back");

    cy.getBySel("link-privacy").click();
    cy.url().should("include", RouteNames.PrivacyPolicy);
    cy.go("back");
 });
});
