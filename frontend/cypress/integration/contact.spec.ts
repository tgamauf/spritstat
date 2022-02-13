import {RouteNames} from "../../src/common/types";

describe("Validate password change process", () => {
  before(() => {
    cy.resetDB(["customuser.json", "emailaddress.json"]);
    cy.login("test@test.at", "test");
    Cypress.Cookies.defaults({
      preserve: ["sessionid", "csrftoken"],
    });
  });

  it("validate content", () => {
    cy.visit(RouteNames.Contact);

    cy.hasBaseStructure(true);
    cy.getBySelLike("breadcrumb-")
      .should("have.length", 2)
      .within(() => {
        cy.contains("Startseite");
        cy.contains("Kontakt");
      });
    cy.getBySel("field-name").should("be.visible");
    cy.getBySel("field-select-subject")
      .should("be.visible")
      .children()
      .should("have.length", 4);
    cy.getBySel("field-message").should("be.visible");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");
  });

  it("validate send message", () => {
    cy.visit(RouteNames.Contact);

    const name = "My Name";
    const message = "My Message";

    cy.intercept("POST", "/api/v1/users/account/contact/")
      .as("contactRequest");

    cy.getBySel("field-name").type(name);
    cy.getBySel("field-select-subject").select(1);
    cy.getBySel("field-message").type(message);
    cy.getBySel("btn-submit").click();

    cy.wait("@contactRequest").then((interception) => {
      expect(interception.request.body).to.deep.equal({
        contact_form_id: "0",
        name,
        subject: "Ich benötige Hilfe",
        message,
      })
    })
    cy.url().should("include", RouteNames.Dashboard)
  });

  it("redirect if not logged in", () => {
    cy.mockLoggedOut();
    cy.visit(RouteNames.Contact);
    cy.url().should("include", RouteNames.Login);
  });
});
