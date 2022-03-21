import {RouteNames} from "../../src/common/types";

describe("Validate settings view", () => {
  it("validate content", () => {
    cy.mockLoggedIn();
    cy.mockSettings();
    cy.visitWithLocale(RouteNames.Settings);

    cy.hasBaseStructure(true);
    cy.getBySelLike("breadcrumb-")
      .should("have.length", 2)
      .within(() => {
        cy.contains("Startseite");
        cy.contains("Einstellungen");
      });
    cy.getBySel("text-email").should("be.visible");
    cy.getBySel("link-change-password").should("be.visible");
    cy.getBySel("settings-switch-intro").should("be.visible");
    cy.getBySel("settings-switch-notifications").should("be.visible");
    cy.getBySel("btn-open-delete-account").should("be.visible");
    cy.getBySel("modal-delete-account")
      .should("exist")
      .should("not.be.visible");

    // Check opening and closing of delete account modal
    cy.getBySel("btn-open-delete-account").click();
    cy.getBySel("modal-delete-account").should("be.visible");
    cy.get("body").click(0, 0);  // click outside of modal to close it again
    cy.getBySel("modal-delete-account")
      .should("not.be.visible");

    cy.getBySel("link-change-password").click();
    cy.url().should("include", RouteNames.ChangePassword);
  });

  it("redirect if not logged in", () => {
    cy.mockLoggedOut();
    cy.visitWithLocale("/settings");
    cy.url().should("include", RouteNames.Login);
  });
});

describe("Validate settings change", () => {
  before(() => {
    // Username and password of user in customuser.json
    cy.wrap("test@test.at").as("username");
    cy.wrap("test").as("password");
  });

  beforeEach(function () {
    cy.resetDB(["user.json", "settings.json"]);
    cy.login(this.username, this.password);
    cy.intercept("GET", "/api/v1/sprit/settings/").as("settings");
  });

  it("set intro settings", () => {
    cy.visitWithLocale(RouteNames.Settings);

    // Make sure that we have the correct state before we begin.
    // The bulma-switch component consists of two parts: the checkbox and the
    //  label. The checkbox isn't visible and can't be clicked, so we need to
    //  do that using the label.
    cy.getBySel("settings-switch-checkbox-intro")
      .as("switch")
      .should("be.checked");
    cy.getBySel("settings-switch-intro").click();
    cy.wait("@settings");
    cy.get("@switch").should("not.be.checked");
  });

  it("set notification settings", () => {
    cy.visitWithLocale(RouteNames.Settings);

    // Make sure that we have the correct state before we begin.
    // The bulma-switch component consists of two parts: the checkbox and the
    //  label. The checkbox isn't visible and can't be clicked, so we need to
    //  do that using the label.
    cy.getBySel("settings-switch-checkbox-notifications")
      .as("switch")
      .should("be.checked");
    cy.getBySel("settings-switch-notifications").click();
    cy.wait("@settings");
    cy.get("@switch").should("not.be.checked");
  });
});

describe("Validate delete account", () => {
  before(() => {
    // Username and password of user in customuser.json
    cy.wrap("test@test.at").as("username");
    cy.wrap("test").as("password");
    cy.mockSettings();
  });

  beforeEach(function () {
    cy.resetDB(["user.json"]);
    cy.login(this.username, this.password);
  });

  it("delete success", function () {
    cy.intercept("DELETE", "/api/v1/users/account/delete/")
      .as("deleteRequest");

    cy.visitWithLocale(RouteNames.Settings);

    cy.getBySel("btn-open-delete-account").click();
    cy.getBySel("btn-close").click();
    cy.getBySel("modal-delete-account")
      .should("not.be.visible");

    cy.getBySel("btn-open-delete-account").click();
    cy.getBySel("btn-delete").click();

    cy.wait("@deleteRequest");
    cy.url().should("include", RouteNames.AccountDeleted);

    // Try to login with user again, which should fail
    cy.request({
      method: "POST",
      url: "/api/v1/users/auth/login/",
      failOnStatusCode: false,
      body: {email: this.username, password: this.password},
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    }).then((response) => {
      expect(response.status).to.equal(400);
    });
  });
});
