import {RouteNames} from "../../src/common/types";

describe("Validate the dashboard", () => {
  it("validate content", () => {
    cy.mockEcontrolPriceAPI();
    cy.mockLoggedIn();

    // Test no locations
    cy.intercept(
      "GET",
      "/api/v1/sprit/",
      {
        statusCode: 200,
        body: [],
        delay: 100
     }
    ).as("locationRequest");
    cy.visit(RouteNames.Dashboard);

    // Verify that the spinner is shown while loading the locations
    cy.getBySel("breadcrumb-0")
      .should("exist")
      .within(() => {
        cy.contains("Startseite");
     });
    cy.getBySel("loading").should("exist");
    cy.getBySel("no-location").should("not.exist");
    cy.getBySel("location-list").should("not.exist");
    cy.getBySel("block-error").should("not.exist");

    cy.wait("@locationRequest");
    cy.hasBaseStructure(true);

    // Verify that the spinner isn't shown after loading finished
    cy.getBySel("loading").should("not.exist");
    cy.getBySel("no-location").should("exist");
    cy.getBySel("location-list").should("not.exist");
    cy.getBySel("block-error").should("not.exist");

    // Test location exist
    cy.intercept(
      "GET",
      "/api/v1/sprit/",
      {
        statusCode: 200,
        body: [{
          id: 1,
          type: 1,
          latitude: 47.0737304,
          longitude: 15.4376933,
          address: "Am Schlossberg",
          postal_code: "8010",
          city: "Graz",
          region_code: null,
          region_type: "",
          region_name: "",
          fuel_type: "DIE",
       }]
     }
    ).as("locationRequest");
    cy.intercept(
      "GET",
      "/api/v1/sprit/1/prices/?date_range=1m",
      {
        statusCode: 200,
        body: []
     }
    ).as("priceRequest");

    cy.visit(RouteNames.Dashboard);
    cy.wait(["@locationRequest", "@priceRequest", "@econtrolPriceRequest"]);
    cy.getBySel("loading").should("not.exist");
    cy.getBySel("no-location").should("not.exist");
    cy.getBySel("location-list").should("exist");
    cy.getBySel("block-error").should("not.exist");

    // Test location request timeout
    cy.intercept(
      "GET",
      "/api/v1/sprit/",
      (req) => {
        req.reply({
          forceNetworkError: true
       })
     }
    ).as("locationRequest");

    cy.visit(RouteNames.Dashboard);
    cy.wait("@locationRequest");
    cy.getBySel("loading").should("not.exist");
    cy.getBySel("no-location").should("not.exist");
    cy.getBySel("location-list").should("not.exist");
    cy.getBySel("block-error").should("exist");
 });
});

describe("Dashboard process", () => {
  before(() => {
    cy.resetDB([
      "customuser.json",
      "emailaddress.json",
      "schedule.json",
      "location.json",
      "test_station.json",
      "test_price.json"
    ]);
    cy.mockEcontrolPriceAPI();
    cy.login("test2@test.at", "test");
 })

  it("validate data loaded", () => {
    cy.intercept("GET", "/api/v1/sprit/").as("locationRequest");
    cy.intercept("DELETE", "/api/v1/sprit/*").as("deleteRequest");

    cy.visit(RouteNames.Dashboard);


    const locationId = 2;
    cy.getBySel(`card-location-${locationId}`).click();
    cy.url().should("include", `${RouteNames.LocationDetails}/${locationId}`)
 });

  it("redirect if not logged in", () => {
    cy.mockLoggedOut();

    cy.visit(RouteNames.Dashboard);
    cy.url().should("include", RouteNames.Login);
 });
});
