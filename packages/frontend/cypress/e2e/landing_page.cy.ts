const longUrl = "https://facebook.com";
const BASE_API_URL = process.env.CYPRESS_BASE_URL ?? "";
const FRONTEND_URL = "http://localhost:5173";

describe("Landing Page (E2E)", () => {
  it("Shorten Url", () => {
    console.log(BASE_API_URL);
    cy.visit(FRONTEND_URL);
    cy.get('[data-cy="url_input"]').click().type(longUrl);
    cy.get('[data-cy="submit_url"]').click();
    cy.get('[data-cy="copy_url"]', { timeout: 20000 }).should("be.visible");
    cy.get('[data-cy="shortened_url_input"]')
      .find("input")
      .then((urlField: any) => {
        Cypress.on("uncaught:exception", () => {
          return false;
        });
        cy.visit(urlField.val().toString(), {});
        cy.origin("https://www.facebook.com", () => {
          cy.contains("Facebook");
        });
      });
  });
});
