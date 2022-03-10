const path = require("path");

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
        body: {isAuthenticated: true, email}
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
        body: {isAuthenticated: false}
      }
    ).as("isNotAuthenticated");
  }
);

Cypress.Commands.add(
  "mockSettings",
  (settings) => {
    cy.intercept(
      "GET",
      "/api/v1/sprit/settings/",
      {
        statusCode: 200,
        body: {
          // Disable the intro for all pages by default
          intro: {
            add_location_active: false,
            location_details_active: false,
            location_list_active: false,
            no_location_active: false
          },
          notifications_active: true
        }
      }
    ).as("settings");
  }
);

Cypress.Commands.add(
  "mockEcontrolPriceAPI",
  (responseStatus = 200, responseBody = null) => {
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
      {
        method: "GET",
        hostname: "api.e-control.at",
        pathname: "/sprit/1.0/search/gas-stations/*"
      },
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
