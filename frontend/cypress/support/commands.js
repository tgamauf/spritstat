const path = require("path");
const {RegionType} = require("../../src/services/econtrolApi");

Cypress.Commands.add(
  "resetDB",
  (fixtures = []) => {
    const managePath = path.resolve(__dirname);

    // Clear database
    cy.exec("npm run db:flush")
      .then(() => {

        // Seed database if fixtures have been provided
        if (fixtures.length > 0) {
          cy.exec(`npm run db:seed -- ${fixtures.join(" ")}`);
        }
      });
  }
);

Cypress.Commands.add(
  "login",
  (username, password) => {
    cy.visit("/");
    cy.request({
      method: "POST",
      url: "/api/v1/users/auth/login/",
      body: {email: username, password},
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    });

    cy.getCookie("sessionid").should("exist");
    cy.getCookie("csrftoken").should("exist");

    cy.intercept(
      "POST",
      "/api/v1/users/account/session/",
    ).as("isAuthenticated");
  }
);

Cypress.Commands.add(
  "logout",
  () => {
    cy.getCookie("csrftoken")
      .then((token) => {
        if (token) {
          cy.request({
            method: "POST",
            url: "/api/v1/users/auth/logout/",
            headers: {
              "X-CSRFToken": token.value,
            }
          });
          cy.getCookie("sessionid").should("not.exist");
        }
      });
  });

Cypress.Commands.add(
  "mockLoggedIn",
  (email = "test@test.at") => {
    // Set the CSRF token, then intercept the call to the session endpoint
    cy.setCookie("csrftoken", "sometoken");
    cy.intercept(
      "POST",
      "/api/v1/users/account/session/",
      {
        statusCode: 200,
        body: { isAuthenticated: true, email }
      }
    ).as("isAuthenticated");
  }
);

Cypress.Commands.add(
  "mockLoggedOut",
  () => {
    cy.intercept(
      "POST",
      "/api/v1/users/account/session/",
      {
        statusCode: 200,
        body: { isAuthenticated: false }
      }
    ).as("isNotAuthenticated");
  }
);

Cypress.Commands.add(
  "mockLogin",
  (email = "test@test.at") => {
    // Set the CSRF token, then intercept the call to the session endpoint
    cy.setCookie("csrftoken", "sometoken");
    cy.intercept(
      "POST",
      "/api/v1/users/account/session/",
      {
        statusCode: 200,
        body: {isAuthenticated: true, email}
      }
    ).as("isAuthenticated");
  }
);

Cypress.Commands.add(
  "mockGeoCoordinatesAPI",
  (responseStatus = 200, responseBody = null) => {
    cy.log(`mockGeoCoordinatesAPI status=${responseStatus} body=${JSON.stringify(responseBody)}`);
    let body = responseBody ? responseBody : {
      status: "OK",
      results: [{
        geometry: {
          location: {
            lat: 48.21016009993677,
            lng: 16.37002493713177
          }
        }
      }]
    };
    cy.intercept(
      "GET",
      "https://maps.googleapis.com/maps/api/geocode/json*",
      {
        statusCode: responseStatus,
        body
      }
    ).as("geoCoordinatesRequest");
  }
);

Cypress.Commands.add(
  "mockEcontrolRegionAPI",
  (responseStatus = 200, responseBody = null) => {
    cy.log(`mockEcontrolRegionAPI status=${responseStatus} body=${JSON.stringify(responseBody)}`);
    let body = responseBody ? responseBody : [
      {
        code: 1,
        type: RegionType.State,
        name: "State 1",
        subRegions: [
          {
          code: 101,
          type: RegionType.District,
          name: "District 101",
          postalCodes: [ "1001", "1002" ]
          },
          {
          code: 102,
          type: RegionType.District,
          name: "District 102",
          postalCodes: [ "1021", "1022" ]
          }
        ],
        postalCodes: [
         "1001", "1002", "1021", "1022"
        ]
      },
      {
        code: 2,
        type: RegionType.State,
        name: "State 2",
        subRegions: [
          {
          code: 201,
          type: RegionType.District,
          name: "District 201",
          postalCodes: [ "2001", "2002" ]
          }
        ],
        postalCodes: [
         "2001", "2002"
        ]
      }
    ];
    cy.intercept(
      "GET",
      "https://api.e-control.at/sprit/1.0/regions*",
      {
        statusCode: responseStatus,
        body
      }
    ).as("econtrolRegionRequest");
  }
);

Cypress.Commands.add(
  "mockEcontrolPriceAPI",
  (responseStatus = 200, responseBody = null) => {
    cy.log(`mockEcontrolPriceAPI status=${responseStatus} body=${JSON.stringify(responseBody)}`);
    let body = responseBody ? responseBody : [{
      id: 1,
      name: "Station",
      location: {
        address: "Address 1",
        postalCode: "1234",
        city: "Graz"
      },
      prices: [{
        amount: 1.1
      }]
    }];
    cy.intercept(
      "GET",
      "https://api.e-control.at/sprit/1.0/search/gas-stations/*",
      {
        statusCode: responseStatus,
        body
      }
    ).as("econtrolPriceRequest");
  }
);

Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-test=${selector}]`, ...args);
});

Cypress.Commands.add("getBySelLike", (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args);
});

Cypress.Commands.add(
  "hasBaseStructure",
  (loggedIn) => {
    // Just check if the header exists, the login button is shown and the
    //  navbar burger exists. Everything else is checked in component tests.
    cy.getBySel("header-logo-img").should("be.visible");
    if (loggedIn) {
      cy.getBySel("header-dropdown").should("be.visible");
    } else {
      cy.getBySel("header-btn-login").should("be.visible");
    }
    cy.getBySel("header-burger");

    // Just check if the footer exists, everything else is checked in component
    //  tests.
    cy.getBySel("footer").should("be.visible");
  }
);
