import {RouteNames} from "../../src/common/types";

describe("Validate sending of password recovery email", () => {
  before(() => {
    cy.wrap("test@test.at").as("email");
 });

  it("validate success", function() {
    cy.resetDB(["user.json"]);
    cy.logout();

    cy.visitWithLocale(RouteNames.PasswordRecoveryEmail);

    cy.hasBaseStructure(false);
    cy.getBySel("field-username")
      .should("be.visible");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");

    cy.intercept("POST", "/api/v1/users/auth/password/reset/")
      .as("resetRequest");

    cy.getBySel("field-username").type(this.email);
    cy.getBySel("btn-submit")
      .should("be.enabled")
      .click();

    cy.wait("@resetRequest").then((interception) => {
      expect(interception.request.body).to.deep.equal({email: this.email});
   });
    cy.url().should("include", RouteNames.Login);
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-info");
 });

  it("validate error", function() {
    cy.mockLoggedOut();

    cy.visitWithLocale(RouteNames.PasswordRecoveryEmail);

    cy.intercept(
      "POST",
      "/api/v1/users/auth/password/reset/",
      (req) => {
        req.reply({
          forceNetworkError: true
       })
     }
    ).as("resetRequest");

    cy.getBySel("field-username").type(this.email);
    cy.getBySel("btn-submit").click();

    cy.wait("@resetRequest");
    cy.url().should("include", RouteNames.PasswordRecoveryEmail);
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
 });

  it("redirect if logged in", () => {
    cy.mockSettings();
    cy.mockLocale();
    cy.resetDB(["user.json"]);
    cy.login("test@test.at", "test")

    cy.intercept("POST", "/api/v1/users/auth/logout/")
      .as("logout");
    cy.visitWithLocale(RouteNames.PasswordRecoveryEmail);
    cy.wait("@logout");
    cy.url().should("include", RouteNames.PasswordRecoveryEmail);
 });
});


describe("Validate reset password flow", () => {
  // We mock all the API calls as the tests would require receiving emails
  //  and then grepping for the token inside. All of this is tested on the
  //  backend.

  beforeEach(() => {
    cy.intercept("POST", "/api/v1/users/auth/password/validate/")
      .as("validatePassword");
 })

  it("password reset success", () => {
    const uid = "99";
    const token = "token";
    const newPassword = "S7SJp7\"2mxg#*)Qg";

    cy.mockLoggedOut();
    cy.intercept(
      "POST",
      "/api/v1/users/auth/password/reset/confirm/",
      {statusCode: 200, body: {detail: "ok"}}
    ).as("verifyRequest");

    cy.visitWithLocale(`${RouteNames.ResetPassword}/${uid}/${token}/`);

    cy.hasBaseStructure(false);
    cy.getBySel("field-new-password").should("be.visible");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");

    cy.getBySel("field-new-password").type(newPassword);
    cy.wait("@validatePassword");
    cy.getBySel("btn-submit").click();
    cy.wait("@verifyRequest")
      .then((interception) => {
        cy.log(JSON.stringify(interception.request.body))
        expect(interception.request.body).to.deep.equal({
          uid,
          token,
          new_password1: newPassword,
          new_password2: newPassword
       });
     });
    cy.url().should("include", RouteNames.Login);
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-info");
 });

  it("password reset request with invalid URL", () => {
    cy.logout();
    cy.intercept(
      "POST",
      "/api/v1/users/auth/password/reset/confirm/",
    ).as("verifyRequest");

    cy.visitWithLocale(`${RouteNames.ResetPassword}/99/token/`);
    cy.getBySel("field-new-password").type("S7SJp7\"2mxg#*)Qg");
    cy.wait("@validatePassword");
    cy.getBySel("btn-submit").click();

    cy.wait("@verifyRequest");
    cy.url().should("include", RouteNames.ResetPassword);
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
 });

  it("redirect if logged in", () => {
    cy.mockSettings();
    cy.mockLocale();
    cy.resetDB(["user.json"]);
    cy.login("test@test.at", "test")

    cy.intercept("POST", "/api/v1/users/auth/logout/")
      .as("logout");
    const route = `${RouteNames.ResetPassword}/99/token/`;
    cy.visitWithLocale(`${RouteNames.ResetPassword}/99/token/`);
    cy.wait("@logout");
    cy.url().should("include", `${RouteNames.ResetPassword}/99/token/`);
 });
});
