import {FuelType, LocationType, RouteNames} from "../../src/utils/types";
import {RegionType} from "../../src/services/econtrolApi";
import {Loader} from "@googlemaps/js-api-loader";



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

function mockGoogleMapsAPI(
  win: Cypress.AUTWindow,
  geocodeResults: any,
  predictions: any
) {
  win.google = {
    maps: {
      Geocoder: class {
        async geocode(request: any) {
          return Promise.resolve({ results: geocodeResults });
        }
      } as any,
      LatLng: MockLatLng as any,
      places: {
        AutocompleteSessionToken: class {},
        AutocompleteService: class {
          async getPlacePredictions(request: any) {
            return Promise.resolve({ predictions: predictions });
          }
        } as any,
      } as any
    } as any
  } as any;
  cy.stub(Loader.prototype, "load").resolves(true);
}


describe("Add location flows", () => {
  beforeEach(() => {
    cy.resetDB(["customuser.json", "emailaddress.json"]);
    cy.login("test@test.at", "test");

    cy.mockEcontrolRegionAPI();
    cy.mockEcontrolPriceAPI();
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
      .should("have.value", LocationType.Named);
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
      .select(LocationType.Named.toString())
      .should("have.value", LocationType.Named);
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

  it.skip("create location from address success", () => {
    // TODO: we do not execute this for now as I didn't manage to make cy.stub
    //  work (see https://stackoverflow.com/q/70940991/3927228). Using the live
    //  Google Maps API is extremely brittle and we are actually better off not
    //  even testing it ...
    const mockPredictions = [
      {
        description: "Prediction 1",
        place_id: "1",
      },
      {
        description: "Prediction 2",
        place_id: "2",
      }
    ];
    const mockGocodeResult = {
      address_components: [
        {
          long_name: "1",
          types: [ "street_number" ]
        },
        {
          long_name: "Street",
          types: [ "route" ]
        },
        {
          long_name: "City",
          types: [ "locality" ]
        },
        {
          long_name: "1234",
          types: [ "postal_code" ]
        },
        {
          short_name: "AT",
          types: [ "country" ]
        }
      ],
      geometry: {
        location: new MockLatLng(48.21016009993677, 16.37002493713177)
      }
    };

    cy.visit(
      RouteNames.AddLocation,
      {
        onBeforeLoad(win: Cypress.AUTWindow) {
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
    cy.getBySel("field-search-dropdown-0").within(() => {
      cy.get(mockPredictions[0].description);
    });
    cy.getBySel("btn-submit").should("be.disabled");

    // Check if place is extracted correctly and the correct place is created
    cy.getBySel("field-search-dropdown-0").click();
    cy.getBySel("btn-submit").click();
    cy.wait("@addLocationRequest").then((interception) => {
      const addrComp = mockGocodeResult.address_components
      expect(interception.request.body).to.deep.equal({
        type: LocationType.Named,
        name: `${addrComp[1].long_name} ${addrComp[0].long_name}, ${addrComp[3].long_name} ${addrComp[2].long_name}`,
        latitude: mockGocodeResult.geometry.location.lat(),
        longitude: mockGocodeResult.geometry.location.lng(),
        region_type: "",
        fuel_type: "DIE"
      })
    });
    cy.url().should("include", RouteNames.Dashboard);
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
        name: "State 1", // from cy.mockEcontrolRegionAPI
        region_code: 1, // from cy.mockEcontrolRegionAPI
        region_type: RegionType.State, // from cy.mockEcontrolRegionAPI
        fuel_type: FuelType.Super
      })
    });
    cy.url().should("include", RouteNames.Dashboard);
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

  it.skip("address check failed", () => {
    // TODO: we do not test this for now as I didn't manage to make cy.stub work
    //  (see https://stackoverflow.com/q/70940991/3927228). Using the live
    //  Google Maps API is extremely brittle and we are actually better off not
    //  even testing it ...
    const mockPredictions = [{ description: "Prediction 1", place_id: "1" }];
    cy.visit(
      RouteNames.AddLocation,
      {
        onBeforeLoad(win: Cypress.AUTWindow) {
          // We replace the Google Maps API created by the Google Maps API Loader
          //  with our mocks
          mockGoogleMapsAPI(win, [], mockPredictions);
        }
      }
    );

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
