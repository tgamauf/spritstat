import "cypress-real-events/support";

import './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Reset and reseed database.
       * @example cy.resetDB();
       * @example cy.resetDB(["customuser.json"]);
       */
      resetDB(fixtures?: string[]): Chainable<Element>;

      /**
       * Login while bypassing the UI.
       * @example cy.login("test@test.at", "test");
       */
      login(username: string, password: string): Chainable<Element>;

      /**
       * Logout while bypassing the UI.
       * @example cy.logout();
       */
      logout(): Chainable<Element>;

      /**
       * Mock logged-in state by intercepting the session API.
       * @example cy.mockLoggedIn();
       * @example cy.mockLoggedIn("my.user@email.com");
       */
      mockLoggedIn(email?: string): Chainable<Element>;

      /**
       * Mock logged-out state by intercepting the session API.
       * @example cy.mockLoggedOut();
       */
      mockLoggedOut(): Chainable<Element>;

      /**
       * Mock the Google Geocode API.
       * @example cy.mockGeoCoordinatesAPI();
       * @example cy.mockGeoCoordinatesAPI(400, []);
       */
      mockGeoCoordinatesAPI(
        responseStatus?: number,
        responseBody?: [])
        : Chainable<Element>;

      /**
       * Mock the E-Control region API.
       * @example cy.mockEcontrolRegionAPI();
       * @example cy.mockEcontrolRegionAPI(400, []);
       */
      mockEcontrolRegionAPI(
        responseStatus?: number,
        responseBody?: [])
        : Chainable<Element>;

      /**
       * Mock the E-Control price API.
       * @example cy.mockEcontrolPriceAPI();
       * @example cy.mockEcontrolPriceAPI(400, []);
       */
      mockEcontrolPriceAPI(
        responseStatus?: number,
        responseBody?: [])
        : Chainable<Element>;

      /**
       * Custom login command.
       * @example cy.getBySel("header");
       */
      getBySel(selector: string, args?: Parameters<any>): Chainable<Element>;

      /**
       * Custom login command.
       * @example cy.getBySelLike("location-type")
       */
      getBySelLike(selector: string, args?: Parameters<any>): Chainable<Element>;

        /**
       * Command to validate that the basic structure of the page
       *  (header, footer).
       * @example cy.hasBaseStructure(false);
       */
      hasBaseStructure(loggedIn: boolean): Chainable<Element>;
    }
  }
}
