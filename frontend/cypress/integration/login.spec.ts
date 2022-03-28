import {RouteNames} from "../../src/common/types";

describe("Login view", () => {
  it("validate content", () => {
    cy.visitWithLocale(RouteNames.Login);

    cy.hasBaseStructure(false);
    cy.getBySel("field-username").should("be.visible");
    cy.getBySel("field-current-password").should("be.visible");
    cy.getBySel("field-checkbox-remember")
      .should("be.visible")
      .should("not.be.checked");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");
    cy.getBySel("link-register")
      .should("be.visible")
      .click()
      .then(() => {
        cy.url().should("include", RouteNames.Signup);
        cy.go("back");
     })
    cy.getBySel("link-recovery-email")
      .should("be.visible")
      .click()
      .then(() => {
        cy.url().should("include", RouteNames.PasswordRecoveryEmail);
        cy.go("back");
     });
 });
});

describe("Login process", () => {
  before(() => {
    cy.resetDB(["user.json"]);

    // Username and password of user in customuser.json
    cy.wrap("test@test.at").as("username");
    cy.wrap("test").as("password");
 });

  beforeEach(() => {
    cy.mockSettings();
    cy.mockLocale();
    cy.logout();
    cy.intercept("POST", "/api/v1/users/auth/login/").as("login");
    Cypress.Cookies.preserveOnce("csrftoken");
 });

  it("login without remember checked", function() {
    cy.visitWithLocale(RouteNames.Login);

    cy.getBySel("field-username").type(this.username);
    cy.getBySel("btn-submit").should("not.be.enabled");
    cy.getBySel("field-current-password").type(this.password);
    cy.getBySel("btn-submit").should("be.enabled");
    cy.getBySel("btn-submit").click();

    cy.wait("@login");
    cy.getCookie("sessionid")
      .should("exist")
      .should("not.have.property", "expiry");
    cy.getBySel("notification").should("not.exist");
    cy.url().should("include", RouteNames.Dashboard);
 });

  it("login with remember checked", function() {
    cy.visitWithLocale(RouteNames.Login);

    cy.getBySel("field-username").type(this.username);
    cy.getBySel("field-current-password").type(this.password);
    cy.getBySel("field-checkbox-remember")
      .click()
      .should("be.checked");
    cy.getBySel("btn-submit").should("be.enabled");
    cy.getBySel("btn-submit").click();

    cy.wait("@login");
    cy.getCookie("sessionid")
      .should("exist")
      .should("have.property", "expiry")
      .should("be.gt", 0);
    cy.getBySel("notification").should("not.exist");
    cy.url().should("include", RouteNames.Dashboard);
 });

  it("login failed", () => {
    cy.intercept(
      "POST",
      "/api/v1/users/auth/login/",
      {statusCode: 400}
    ).as("login");
    cy.visitWithLocale(RouteNames.Login);

    cy.getBySel("field-username").type("invalid@test.at");
    cy.getBySel("field-current-password").type("invalid");
    cy.getBySel("btn-submit").click();

    cy.wait("@login");
    cy.getCookie("sessionid").should("not.exist");
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
    cy.url().should("include", RouteNames.Login);
 });
});
