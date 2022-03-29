import {RouteNames} from "../../src/common/types";

describe("Validate signup", () => {
  it("validate content of signup view", () => {
    cy.visitWithLocale(RouteNames.Signup);

    cy.hasBaseStructure(false);
    cy.getBySel("field-username").should("be.visible");
    cy.getBySel("field-new-password").should("be.visible");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");
 });

  it("signup success", () => {
    cy.visitWithLocale(RouteNames.Signup);

    cy.resetDB();
    cy.intercept("POST", "/api/v1/users/auth/register/").as("signup");

    const username = "test@test.at"
    cy.getBySel("field-username").type(username);
    cy.getBySel("btn-submit").should("not.be.enabled");
    cy.getBySel("field-new-password").type("S7SJp7\"2mxg#*)Qg");
    cy.getBySel("btn-submit").should("be.enabled");
    cy.getBySel("btn-submit").click();

    cy.wait("@signup");
    cy.url().should(
      "include",
      `${RouteNames.VerifyEmailSent}/${username}`
    );
 });

  it("validate email verification mail sent view", () => {
    cy.logout();
    cy.visitWithLocale(`${RouteNames.VerifyEmailSent}/test@test.at`);

    cy.intercept("POST", "/api/v1/users/auth/resend-email/")
      .as("resendRequest");

    cy.hasBaseStructure(false);
    cy.getBySel("btn-resend")
      .should("be.enabled")
      .click();
    cy.wait("@resendRequest")
      .then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
     });
 });

  it("signup failed", () => {
    cy.visitWithLocale(RouteNames.Signup);

    cy.intercept(
      "POST",
      "/api/v1/users/auth/register/",
      {statusCode: 400}
    ).as("signup");

    cy.getBySel("field-username").type("test@test.at");
    cy.getBySel("field-new-password").type("S7SJp7\"2mxg#*)Qg");
    cy.getBySel("btn-submit").click();
    cy.wait("@signup");
    cy.url().should("include", RouteNames.Signup);
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
 });

  it("redirect on logged-in", () => {
    cy.mockSettings();
    cy.mockLocale();
    cy.resetDB(["user.json"]);
    cy.login("test@test.at", "test")
    cy.intercept("/api/v1/users/auth/logout/").as("logout")
    cy.visitWithLocale(RouteNames.Signup);
    cy.wait("@logout")
    cy.url().should("include", RouteNames.Signup);
 });
});

describe("Validate confirm email address", () => {
  // We mock all the API calls as the tests would require receiving emails
  //  and then grepping for the key inside. All of this is tested on the backend.

  it("validate success logged out", () => {
    let getSessionResponseIdx = 0;
    const getSessionResponse = [
      {isAuthenticated: false},
      {isAuthenticated: true, email: "test@test.at", has_beta_access: false},
    ]

    cy.mockSettings();
    cy.mockLocale();
    cy.intercept(
      "POST",
      "/api/v1/users/auth/verify-email/",
      {statusCode: 200, body: {detail: "Ok"}}
    ).as("verifyRequest");
    cy.intercept(
      "POST",
      "/api/v1/users/account/session/",
      (request) => {
        request.reply(getSessionResponse[getSessionResponseIdx])
        getSessionResponseIdx++;
      }
    ).as("isAuthenticated");

    cy.visitWithLocale(`${RouteNames.ConfirmEmail}/key/`);

    // Ensure that the progress bar is shown while the API request is processed
    cy.getBySel("loading").should("exist");

    cy.wait("@verifyRequest")
      .then((interception) => {
        expect(interception.request.body).to.deep.equal({key: "key"});
     });
    cy.wait("@isAuthenticated");
    cy.getBySel("loading").should("not.exist");
    cy.url().should("include", RouteNames.Dashboard);
 });

  it("validate success logged in", () => {
    let getSessionResponseIdx = 0;
    const getSessionResponse = [
      {isAuthenticated: true, email: "test@test.at", has_beta_access: false},
      {isAuthenticated: false},
      {isAuthenticated: true, email: "new@test.at", has_beta_access: false},
    ]

    cy.mockSettings();
    cy.mockLocale();
    cy.intercept("/api/v1/users/auth/logout/").as("logout")
    cy.intercept(
      "POST",
      "/api/v1/users/auth/verify-email/",
      {statusCode: 200, body: {detail: "Ok"}}
    ).as("verifyRequest");
    cy.intercept(
      "POST",
      "/api/v1/users/account/session/",
      (request) => {
        request.reply(getSessionResponse[getSessionResponseIdx])
        getSessionResponseIdx++;
      }
    ).as("isAuthenticated");

    cy.visitWithLocale(`${RouteNames.ConfirmEmail}/key/`);

    // Ensure that the progress bar is shown while the API request is processed
    cy.getBySel("loading").should("exist");

    cy.wait(["@logout", "@verifyRequest", "@isAuthenticated"]);
    cy.getBySel("loading").should("not.exist");
    cy.url().should("include", RouteNames.Dashboard);
 });

  it("validate error", () => {
    cy.mockLoggedOut();
    cy.intercept(
      "POST",
      "/api/v1/users/auth/verify-email/",
      {statusCode: 400}
    ).as("verifyRequest");

    cy.visitWithLocale(`${RouteNames.ConfirmEmail}/key/`);

    cy.wait("@verifyRequest");
    cy.hasBaseStructure(false);
    cy.getBySel("block-error").should("exist");
    cy.getBySel("link-home").click();
    cy.url().should("include", RouteNames.Home);
 });
});
