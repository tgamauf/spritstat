import {RouteNames} from "../../src/common/types";

describe("Validate initial page load", () => {
  it("verify index redirects", () => {
    cy.visitWithLocale(RouteNames.Index);
    cy.title().should("include", "SPRITSTAT");
    cy.url().should("include", RouteNames.Home)

    cy.mockLoggedIn();
    cy.mockSettings();
    cy.mockLocale();
    cy.visitWithLocale(RouteNames.Index);
    cy.wait("@isAuthenticated");
    cy.url().should("include", RouteNames.Dashboard);
  });

  it("validate content of homepage if logged out", () => {
    cy.visitWithLocale(RouteNames.Home);

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
    cy.mockLocale();
    cy.visitWithLocale(RouteNames.Home);
    cy.wait("@isAuthenticated");
    cy.hasBaseStructure(true);
    cy.getBySel("content-text").should("have.length.at.least", 2);
    cy.getBySel("content-img").should("exist");
  });

  it("validate login button", () => {
    cy.visitWithLocale(RouteNames.Home);

    cy.getBySel("header-btn-login").click();
    cy.url().should("include", RouteNames.Login);
  });

  it("validate header dropdown buttons", () => {
    cy.mockSettings();
    cy.mockLocale();
    cy.resetDB(["user.json"]);
    cy.login("test@test.at", "test");

    cy.visitWithLocale(RouteNames.Home);

    cy.wait("@isAuthenticated");
    cy.getBySel("header-dropdown").realHover();
    cy.getBySel("link-settings").click({force: true});
    cy.url().should("include", RouteNames.Settings);
    cy.go("back");

    cy.getBySel("header-dropdown").realHover();
    cy.getBySel("link-contact").click({force: true});
    cy.url().should("include", RouteNames.Contact);
    cy.go("back");

    cy.getBySel("header-dropdown").realHover();
    cy.getBySel("link-logout").click({force: true});
    cy.url().should("include", RouteNames.Login);
  });

  it("validate footer links", () => {
    cy.visitWithLocale(RouteNames.Home);

    // TODO: "force: true" is a workaround till
    //  https://github.com/cypress-io/cypress/issues/7306 is fixed
    cy.getBySel("link-imprint").click({force: true});
    cy.url().should("include", RouteNames.Imprint);
    cy.go("back");
    cy.getBySel("link-privacy").click();
    cy.url().should("include", RouteNames.PrivacyPolicy);
    cy.go("back");
    cy.getBySel("dropdown-language").within(() => {
      cy.contains("Deutsch");
    });
    cy.getBySel("dropdown-language-trigger").click();
    cy.getBySel("dropdown-language").within(() => {
      cy.get(".dropdown-item").contains("English").click();
    });
    cy.getBySel("header-btn-login").contains("Login");
  });

  // TODO: skip test as changing of language broke again. Add again after
  //  https://github.com/cypress-io/cypress/issues/7890 has been implemented.
  it.skip("validate English as browser language", () => {
    cy.visitWithLocale(RouteNames.Home, "en");

    // Just check a few items on the page for the english version
    cy.getBySel("header-btn-login").contains("Login");
    cy.getBySel("link-imprint").contains("Imprint");
    cy.getBySel("link-privacy").contains("Privacy");

    // Check if the locale is set correctly if a logged-in user has a locale set.
    cy.mockLocale("en");
    cy.resetDB(["user.json", "settings.json"]);
    cy.login("tom@test.at", "test");
    cy.visit(RouteNames.Home)
    cy.getBySel("link-imprint").contains("Imprint");
  });
});
