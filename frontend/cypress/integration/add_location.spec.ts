import {FuelType, LocationType, RouteNames} from "../../src/common/types";
import * as google from "../../src/features/location/NamedLocationField/google";


class MockLatLng {
  private readonly _lat;
  private readonly _lng;

  constructor(lat: number, lng: number) {
    this._lat = lat;
    this._lng = lng;
  }

  public lat(): number {
    return this._lat;
  }

  public lng(): number {
    return this._lng;
  }
}

type Window = Cypress.AUTWindow & {
  google: {
    maps: {
      Geocoder: any;
      LatLng: typeof MockLatLng;
      places: {
        AutocompleteSessionToken: any;
        AutocompleteService: any;
      }
    }
  }
}

function mockGoogleMapsAPI(
  win: Window,
  geocodeResults: any,
  predictions: any
) {
  win.google = {
    maps: {
      Geocoder: class {
        async geocode(request: any) {
          return Promise.resolve({results: geocodeResults});
        }
      },
      LatLng: MockLatLng,
      places: {
        AutocompleteSessionToken: class {
        },
        AutocompleteService: class {
          async getPlacePredictions(request: any) {
            return Promise.resolve({predictions: predictions});
          }
        },
      }
    }
  };
  cy.stub(google, "waitForGoogleMapsAPI").resolves(true);
}

function mockEControlApi(responseStatus = 200) {
  let body = [
    {
      code: 1,
      type: "BL",
      name: "State 1",
      subRegions: [
        {
          code: 101,
          type: "PB",
          name: "District 101",
          postalCodes: ["1001", "1002"]
        },
        {
          code: 102,
          type: "PB",
          name: "District 102",
          postalCodes: ["1021", "1022"]
        }
      ],
      postalCodes: [
        "1001", "1002", "1021", "1022"
      ]
    },
    {
      code: 2,
      type: "BL",
      name: "State 2",
      subRegions: [
        {
          code: 201,
          type: "PB",
          name: "District 201",
          postalCodes: ["2001", "2002"]
        }
      ],
      postalCodes: [
        "2001", "2002"
      ]
    }
  ];
  cy.intercept(
    {
      method: "GET",
      hostname: "api.e-control.at",
      pathname: "/sprit/1.0/regions"
    },
    {
      statusCode: responseStatus,
      body
    }
  ).as("econtrolRegionRequest");
}


describe("Add location flows", () => {
  beforeEach(() => {
    cy.mockSettings();
    cy.mockLocale();
    cy.resetDB(["user.json", "settings.json"]);
    cy.login("tom@test.at", "test");

    mockEControlApi();
    cy.mockEcontrolPriceAPI();
    cy.intercept("POST", "/api/v1/sprit/").as("addLocationRequest");
  });

  it("validate content", () => {
    cy.visitWithLocale(RouteNames.AddLocation);

    cy.hasBaseStructure(true);
    cy.getBySelLike("breadcrumb-")
      .should("have.length", 2)
      .within(() => {
        cy.contains("Startseite");
        cy.contains("Ort hinzufügen");
      });

    // Defaults
    cy.getBySel("tab-location-type-named")
      .should("be.visible")
      .should("have.class", "is-active");
    cy.getBySel("tab-location-type-region")
      .should("be.visible")
      .should("not.have.class", "is-active");
    cy.getBySel("location-add-address")
      .should("be.visible");
    cy.getBySel(`btn-fuel-${FuelType.Diesel}`)
      .should("be.visible")
      .should("have.class", "is-selected");
    cy.getBySel(`btn-fuel-${FuelType.Super}`)
      .should("be.visible")
      .should("not.have.class", "is-selected");
    cy.getBySel(`btn-fuel-${FuelType.Gas}`)
      .should("be.visible")
      .should("not.have.class", "is-selected");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");

    // Region location
    cy.getBySel("tab-location-type-region").click();
    cy.getBySel("location-add-region").should("be.visible");
    cy.getBySel("btn-submit")
      .should("be.visible")
      .should("be.disabled");

    // Address location
    cy.getBySel("tab-location-type-named").click();
    cy.getBySel("location-add-address")
      .should("be.visible");

    // Fuel type super
    cy.getBySel(`btn-fuel-${FuelType.Super}`)
      .click()
      .should("have.class", "is-selected");
    cy.getBySel(`btn-fuel-${FuelType.Diesel}`)
      .should("not.have.class", "is-selected");
    cy.getBySel(`btn-fuel-${FuelType.Gas}`)
      .should("not.have.class", "is-selected");

    // Fuel type gas
    cy.getBySel(`btn-fuel-${FuelType.Gas}`)
      .click()
      .should("have.class", "is-selected");
    cy.getBySel(`btn-fuel-${FuelType.Diesel}`)
      .should("not.have.class", "is-selected");
    cy.getBySel(`btn-fuel-${FuelType.Super}`)
      .should("not.have.class", "is-selected");
  });

  it("create location from address success", () => {
    const mockPredictions = [
      {description: "Prediction 1", place_id: "1"},
      {description: "Prediction 2", place_id: "2"}
    ];
    const mockGocodeResult = {
      address_components: [
        {long_name: "1", types: ["street_number"]},
        {long_name: "Street", types: ["route"]},
        {long_name: "City", types: ["locality"]},
        {long_name: "1234", types: ["postal_code"]},
        {short_name: "AT", types: ["country"]}
      ],
      place_id: "prediction1",
      geometry: {location: new MockLatLng(48.21016009993677, 16.37002493713177)}
    };

    cy.visit(
      RouteNames.AddLocation,
      {
        onBeforeLoad(win: Window) {
          // We replace the Google Maps API created by the Google Maps API Loader
          //  with our mocks
          mockGoogleMapsAPI(win, [mockGocodeResult], mockPredictions);
        }
      }
    );

    // Check predictions are filled in correctly
    cy.getBySel("field-search").type("Address 1");
    cy.getBySel("btn-submit").should("be.disabled");
    cy.getBySelLike("field-search-dropdown-")
      .should("have.length.gte", 1);
    cy.getBySel("field-search-dropdown-0").contains(mockPredictions[0].description);
    cy.getBySel("btn-submit").should("be.disabled");

    // Check if place is extracted correctly and the correct place is created
    cy.getBySel("field-search-dropdown-0").click();
    cy.getBySel("btn-submit").click();
    cy.wait("@addLocationRequest").then((interception) => {
      const addrComp = mockGocodeResult.address_components
      expect(interception.request.body).to.deep.equal({
        type: 1,
        name: `${addrComp[1].long_name} ${addrComp[0].long_name}, ${addrComp[3].long_name} ${addrComp[2].long_name}`,
        latitude: mockGocodeResult.geometry.location.lat(),
        longitude: mockGocodeResult.geometry.location.lng(),
        fuel_type: "DIE"
      })
    });
    cy.url().should("include", RouteNames.Dashboard);
  });

  it("create location from current location success", () => {
    const mockCoords = {latitude: 48.21016009993677, longitude: 16.37002493713177};
    const mockPredictions = [{description: "Prediction 1", place_id: "1"}];
    const mockGocodeResult = {
      address_components: [
        {long_name: "1", types: ["street_number"]},
        {long_name: "Street", types: ["route"]},
        {long_name: "City", types: ["locality"]},
        {long_name: "1234", types: ["postal_code"]},
        {short_name: "AT", types: ["country"]}
      ],
      place_id: "prediction1",
      geometry: {location: new MockLatLng(mockCoords.latitude, mockCoords.longitude)}
    };

    cy.visit(
      RouteNames.AddLocation,
      {
        onBeforeLoad(win: Window) {
          // We replace the Google Maps API created by the Google Maps API Loader
          //  with our mocks
          mockGoogleMapsAPI(win, [mockGocodeResult], mockPredictions);
          cy.stub(
            win.navigator.geolocation,
            "getCurrentPosition",
            (successCallback, errorCallback, options) => {
              return successCallback({coords: mockCoords});
            }
          )
        }
      }
    );

    // Check predictions are filled in correctly
    cy.getBySel("btn-location").click();
    cy.getBySel("btn-submit").should("be.disabled");
    cy.getBySel("field-search-dropdown-0").click();
    cy.getBySel("btn-submit").click();
    cy.wait("@addLocationRequest").then((interception) => {
      const addrComp = mockGocodeResult.address_components
      expect(interception.request.body).to.deep.equal({
        type: 1,
        name: `${addrComp[1].long_name} ${addrComp[0].long_name}, ${addrComp[3].long_name} ${addrComp[2].long_name}`,
        latitude: mockGocodeResult.geometry.location.lat(),
        longitude: mockGocodeResult.geometry.location.lng(),
        fuel_type: "DIE"
      })
    });
    cy.url().should("include", RouteNames.Dashboard);
  });

  it("create location from region success", () => {
    cy.visitWithLocale(RouteNames.AddLocation);

    cy.getBySel("tab-location-type-region").click();
    cy.getBySel("field-state").select(1);
    cy.getBySel(`btn-fuel-${FuelType.Super}`).click();
    cy.getBySel("btn-submit").click();

    cy.wait("@addLocationRequest").then((interception) => {
      expect(interception.request.body).to.deep.equal({
        type: 2,
        name: "State 1", // from mockEControlApi
        region_code: 1, // from mockEControlApi
        region_type: "BL", // from mockEControlApi
        fuel_type: "SUP"
      })
    });
    cy.url().should("include", RouteNames.Dashboard);
  });

  it("create location failed", () => {
    cy.intercept(
      "POST",
      "/api/v1/sprit/",
      {statusCode: 400}
    ).as("addLocationRequest");

    cy.visitWithLocale(RouteNames.AddLocation);

    cy.getBySel("tab-location-type-region").click();
    cy.getBySel("field-state").select(1);
    cy.getBySel("btn-submit").click();

    cy.wait("@addLocationRequest");
    cy.url().should("include", RouteNames.AddLocation);
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
  });

  it("address check failed", () => {
    const mockPredictions = [{description: "Prediction 1", place_id: "1"}];
    cy.visit(
      RouteNames.AddLocation,
      {
        onBeforeLoad(win: Window) {
          // We replace the Google Maps API created by the Google Maps API Loader
          //  with our mocks
          mockGoogleMapsAPI(win, [], mockPredictions);
        }
      }
    );

    cy.getBySel("field-search").type("Address 1");
    cy.getBySel("field-search-dropdown-0").click();
    cy.getBySel("btn-submit").should("be.disabled");
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
  });

  it("get regions failed", () => {
    mockEControlApi(400);

    cy.visitWithLocale(RouteNames.AddLocation);

    cy.getBySel("tab-location-type-region").click();

    cy.wait("@econtrolRegionRequest");
    cy.getBySel("notification")
      .should("exist")
      .should("have.class", "is-danger");
  });

  it("redirect if not logged in", () => {
    cy.mockLoggedOut();
    cy.visitWithLocale(RouteNames.AddLocation);
    cy.url().should("include", RouteNames.Login);
  });
});
