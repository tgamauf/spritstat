import "cypress-real-events/support";

import './commands'
import {SettingsData} from "../../src/common/apis/spritstatApi";


beforeEach(function () {
  // Short circuit the Google Maps calls for all tests, as they are executed
  //  during page load.
  cy.intercept(
    {hostname: "maps.googleapis.com"},
    {statusCode: 200}
  ).as("googleMaps");
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Reset and reseed database.
       * @example cy.resetDB();
       * @example cy.resetDB(["user.json"]);
       */
      resetDB(fixtures?: string[]): Chainable<Element>;

      /**
       * Call visit, but with the changed locale. The default locale is "de".
       * @example cy.visitWithLocale("/");
       * @example cy.visitWithLocale("/", "en");
       * @example cy.visitWithLocale("/", "en", {someKey: "someValue"});
       */
      visitWithLocale(
        url: string, locale?: string, options?: Partial<VisitOptions>
      ): Chainable<Element>;

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
       * Mock settings.
       * @example cy.mockSettings();
       * @example cy.mockSettings({intro: {no_location_active: false}});
       */
      mockSettings(settings?: SettingsData): Chainable<Element>;

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
