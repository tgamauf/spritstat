import {FuelType, LocationType, RouteNames} from "../../src/utils/types";
import {RegionType} from "../../src/services/econtrolApi";

describe("Add location flows", () => {
  beforeEach(() => {
    cy.resetDB(["customuser.json", "emailaddress.json"]);
    cy.login("test@test.at", "test");

    cy.mockGeoCoordinatesAPI();
    cy.mockEcontrolRegionAPI();
    cy.intercept("POST", "/api/v1/sprit/").as("addLocationRequest");
  });

  it("validate content", () => {
    cy.mockLoggedIn();
    cy.visit(RouteNames.AddLocation);

    cy.hasBaseStructure(true);
    cy.getBySelLike("breadcrumb-")
      .should("have.length", 2)
      .within(() => {
        cy.contains("Startseite");
        cy.contains("Ort hinzufügen");
      });

    // Defaults
    cy.getBySel("field-location-type")
      .should("be.visible")
      .should("have.value", LocationType.Address);
    cy.getBySel("location-add-address")
      .should("be.visible");
    cy.getBySel("field-fuel-type")
      .should("be.visible")
      .should("have.value", FuelType.Diesel);
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");

    // Address location
    cy.getBySel("field-location-type")
      .select(LocationType.Address.toString())
      .should("have.value", LocationType.Address);
    cy.getBySel("location-add-address")
      .should("be.visible");

    // Region location
    cy.getBySel("field-location-type")
      .select(LocationType.Region.toString())
      .should("have.value", LocationType.Region);
    cy.getBySel("location-add-region").should("be.visible");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");

    // Fuel type super
    cy.getBySel("field-fuel-type")
      .select(FuelType.Super)
      .should("have.value", FuelType.Super);

    // Fuel type gas
    cy.getBySel("field-fuel-type")
      .select(FuelType.Gas)
      .should("have.value", FuelType.Gas);
  });

  it("create location from address success", () => {
    cy.visit(RouteNames.AddLocation);

    const address = "Address 1";
    const postalCode = "1234";
    const city = "City 1";

    cy.getBySel("field-address").type(address);
    cy.getBySel("field-postal-code").type(postalCode);
    cy.getBySel("field-city").type(city)
    cy.getBySel("btn-submit").should("be.disabled");

    cy.wait("@geoCoordinatesRequest").then((interception) => {
      expect(interception.request.url).contains(
        `bounds=AT&address=${postalCode}+${city}+${address}`
          .replaceAll(" ", "+")
      )
    });
    cy.getBySel("btn-submit").click();

    cy.wait("@addLocationRequest").then((interception) => {
      expect(interception.request.body).to.deep.equal({
        type: LocationType.Address,
        address: address,
        postal_code: postalCode,
        city: city,
        latitude: 48.21016009993677, // from cy.mockGeoCoordinatesAPI
        longitude: 16.37002493713177, // from cy.mockGeoCoordinatesAPI
        region_type: "",
        region_name: "",
        fuel_type: "DIE"
      })
    });
    cy.url().should("include", RouteNames.Home);
  });

  it("create location from region success", () => {
    cy.visit(RouteNames.AddLocation);

    cy.getBySel("field-location-type")
      .select(LocationType.Region.toString())
    cy.getBySel("field-state").select(1);
    cy.getBySel("field-fuel-type").select(FuelType.Super);
    cy.getBySel("btn-submit").click();

    cy.wait("@addLocationRequest").then((interception) => {
      console.log(JSON.stringify(interception.request.body))
      expect(interception.request.body).to.deep.equal({
        type: LocationType.Region,
        address: "",
        postal_code: "",
        city: "",
        region_code: 1, // from cy.mockEcontrolRegionAPI
        region_type: RegionType.State, // from cy.mockEcontrolRegionAPI
        region_name: "State 1", // from cy.mockEcontrolRegionAPI
        fuel_type: FuelType.Super
      })
    });
    cy.url().should("include", RouteNames.Home);
  });

  it("create location failed", () => {
    cy.intercept(
      "POST",
      "/api/v1/sprit/",
      { statusCode: 400 }
    ).as("addLocationRequest");

    cy.visit(RouteNames.AddLocation);

    cy.getBySel("field-location-type")
      .select(LocationType.Region.toString())
    cy.getBySel("field-state").select(1);
    cy.getBySel("field-fuel-type").select(FuelType.Super);
    cy.getBySel("btn-submit").click();

    cy.wait("@addLocationRequest");
    cy.url().should("include", RouteNames.AddLocation);
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
  });

  it("address check failed", () => {
    cy.visit(RouteNames.AddLocation);

    cy.mockGeoCoordinatesAPI(400);

    cy.getBySel("field-address").type("Address");
    cy.getBySel("field-postal-code").type("1234");
    cy.getBySel("field-city").type("City")

    cy.wait("@geoCoordinatesRequest");
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
  });

  it("get regions failed", () => {
    cy.mockEcontrolRegionAPI(400);

    cy.visit(RouteNames.AddLocation);

    cy.getBySel("field-location-type")
      .select(LocationType.Region.toString())

    cy.wait("@econtrolRegionRequest");
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
  });

  it("redirect if not logged in", () => {
    cy.mockLoggedOut();
    cy.visit(RouteNames.AddLocation);
    cy.url().should("include", RouteNames.Login);
  });
});
