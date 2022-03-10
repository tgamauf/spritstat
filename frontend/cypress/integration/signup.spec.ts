import {RouteNames} from "../../src/common/types";

describe("Validate signup", () => {
  it("validate content of signup view", () => {
    cy.visit(RouteNames.Signup);

    cy.hasBaseStructure(false);
    cy.getBySel("field-username").should("be.visible");
    cy.getBySel("field-new-password").should("be.visible");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");
 });

  it("signup success", () => {
    cy.visit(RouteNames.Signup);

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
    cy.visit(`${RouteNames.VerifyEmailSent}/test@test.at`);

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
    cy.visit(RouteNames.Signup);

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
    cy.resetDB(["user.json"]);
    cy.login("test@test.at", "test")
    cy.intercept("/api/v1/users/auth/logout/").as("logout")
    cy.visit(RouteNames.Signup);
    cy.wait("@logout")
    cy.url().should("include", RouteNames.Signup);
 });
});

describe("Validate confirm email address", () => {
  // We mock all of the API calls as the tests would require receiving emails
  //  and then grepping for the key inside. All of this is tested on the backend.

  it("validate success logged out", () => {
    cy.mockLoggedOut();
    cy.intercept(
      "POST",
      "/api/v1/users/auth/verify-email/",
      {statusCode: 200, body: {detail: "Ok"}}
    ).as("verifyRequest");

    cy.visit(`${RouteNames.ConfirmEmail}/key/`);

    // Ensure that the progress bar is shown while the API request is processed
    cy.getBySel("loading").should("exist");

    cy.wait("@verifyRequest")
      .then((interception) => {
        expect(interception.request.body).to.deep.equal({key: "key"});
     });
    cy.getBySel("loading").should("not.exist");
    cy.url().should("include", RouteNames.Login);
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-info");
 });

  it("validate success logged in", () => {
    cy.mockSettings();
    cy.resetDB(["user.json"]);
    cy.login("test@test.at", "test")
    cy.intercept("/api/v1/users/auth/logout/").as("logout")
    cy.intercept(
      "POST",
      "/api/v1/users/auth/verify-email/",
      {statusCode: 200, body: {detail: "Ok"}}
    ).as("verifyRequest");

    cy.visit(`${RouteNames.ConfirmEmail}/key/`);

    // Ensure that the progress bar is shown while the API request is processed
    cy.getBySel("loading").should("exist");

    cy.wait(["@logout", "@verifyRequest"]);
    cy.getBySel("loading").should("not.exist");
    cy.url().should("include", RouteNames.Login);
 });

  it("validate error", () => {
    cy.mockLoggedOut();
    cy.intercept(
      "POST",
      "/api/v1/users/auth/verify-email/",
      {statusCode: 400}
    ).as("verifyRequest");

    cy.visit(`${RouteNames.ConfirmEmail}/key/`);

    cy.wait("@verifyRequest");
    cy.hasBaseStructure(false);
    cy.getBySel("block-error").should("exist");
    cy.getBySel("link-home").click();
    cy.url().should("include", RouteNames.Home);
 });
});
