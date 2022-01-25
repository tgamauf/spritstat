import {RouteNames} from "../../src/utils/types";

describe("Validate change password view", () => {
  it("validate content", () => {
    cy.mockLoggedIn();
    cy.visit(RouteNames.ChangePassword);

    cy.hasBaseStructure(true);
    cy.getBySelLike("breadcrumb-")
      .should("have.length", 3)
      .within(() => {
        cy.contains("Startseite");
        cy.contains("Einstellungen");
        cy.contains("Passwort ändern");
      });
    cy.getBySel("field-current-password").should("be.visible");
    cy.getBySel("field-new-password").should("be.visible");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");
  });
});

describe("Validate password change process", () => {
  before(() => {
    cy.wrap("test@test.at").as("username");
    cy.wrap("test").as("currentPassword");
  });

  beforeEach(function() {
    cy.resetDB(["customuser.json", "emailaddress.json"]);

    cy.intercept("POST", "/api/v1/users/auth/password/validate/")
      .as("validatePassword");
    cy.intercept("POST", "/api/v1/users/auth/password/change/")
      .as("changePassword");
    cy.logout();
    cy.login(this.username, this.currentPassword);
  });

  it("change password success", function() {
    cy.visit(RouteNames.ChangePassword);
    const newPassword = "S7SJp7\"2mxg#*)Qg";

    cy.getBySel("field-current-password").type(this.currentPassword);
    cy.getBySel("btn-submit").should("not.be.enabled");
    cy.getBySel("field-new-password").type(newPassword);
    cy.wait("@validatePassword");
    cy.getBySel("btn-submit").should("be.enabled");
    cy.getBySel("btn-submit").click();

    cy.wait("@changePassword");
    cy.logout();
    cy.url().should("include", RouteNames.Home);
    cy.login(this.username, newPassword);
    cy.visit("/");
    cy.url().should("include", RouteNames.Dashboard);
  });

  it("invalid current password", () => {
    cy.visit(RouteNames.ChangePassword);

    cy.getBySel("field-current-password").type("invalid");
    cy.getBySel("field-new-password").type("S7SJp7\"2mxg#*)Qg");
    cy.getBySel("btn-submit").should("be.enabled");
    cy.getBySel("btn-submit").click();

    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
    cy.url().should("include", RouteNames.ChangePassword);
  });

  it("redirect if not logged in", () => {
    cy.mockLoggedOut();
    cy.visit(RouteNames.ChangePassword);
    cy.url().should("include", RouteNames.Login);
  });
});
