import {RouteNames} from "../../src/common/types";

describe("Validate settings view", () => {
  it("validate user data is shown", () => {
    cy.mockLoggedIn();
    cy.visit(RouteNames.Settings);

    cy.hasBaseStructure(true);
    cy.getBySelLike("breadcrumb-")
      .should("have.length", 2)
      .within(() => {
        cy.contains("Startseite");
        cy.contains("Einstellungen");
      });
    cy.getBySel("text-email").should("be.visible");

    cy.getBySel("link-change-password").should("be.visible");
    cy.getBySel("btn-open-delete-account").should("be.visible");
    cy.getBySel("modal-delete-account")
      .should("exist")
      .should("not.be.visible");

    // Check opening and closing of delete account modal
    cy.getBySel("btn-open-delete-account").click();
    cy.getBySel("modal-delete-account").should("be.visible");
    cy.get("body").click(0,0);  // click outside of modal to close it again
    cy.getBySel("modal-delete-account")
      .should("not.be.visible");

    cy.getBySel("link-change-password").click();
    cy.url().should("include", RouteNames.ChangePassword);
  });

  it("redirect if not logged in", () => {
    cy.mockLoggedOut();
    cy.visit("/settings");
    cy.url().should("include", RouteNames.Login);
  });
});

describe("Validate delete account", () => {
  before(() => {
    // Username and password of user in customuser.json
    cy.wrap("test@test.at").as("username");
    cy.wrap("test").as("password");
  });

  beforeEach(function() {
    cy.resetDB(["customuser.json", "emailaddress.json"]);
    cy.login(this.username, this.password);
  });

  it("delete success", function() {
    cy.intercept("DELETE", "/api/v1/users/account/delete/")
      .as("deleteRequest");

    cy.visit(RouteNames.Settings);

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
      body: { email: this.username, password: this.password },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    }).then((response) => {
      expect(response.status).to.equal(400);
    });
  });
});
