describe("Landing Page (Stubbed)", () => {
  const errorMessage = "Error message";
  const shortUrl = "shortUrl";
  const longUr = "https://facebook.com";
  const BASE_API_URL = `${Cypress.env("apiUrl")}/url` ?? "";
  const FRONTEND_URL = "http://localhost:5173";

  it("Shorten Url", () => {
    Cypress.automation("remote:debugger:protocol", {
      command: "Browser.grantPermissions",
      params: {
        permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
        origin: FRONTEND_URL,
      },
    });

    cy.visit(FRONTEND_URL);
    cy.url();
    cy.get('[data-cy="url_input"]').click().type("facebook.com");

    cy.intercept("POST", `${BASE_API_URL}`, {
      statusCode: 500,
      body: errorMessage,
    });

    cy.get('[data-cy="submit_url"]').click();
    cy.contains(errorMessage);

    cy.intercept("POST", `${BASE_API_URL}`, {
      statusCode: 200,
      body: shortUrl,
    });

    cy.get('[data-cy="submit_url"]').click();
    cy.get('[data-cy="shortened_url_input"]')
      .find("input")
      .should("contain.value", `${FRONTEND_URL}/${shortUrl}`);
    cy.get('[data-cy="copy_url"]').realClick();
    cy.contains("Link copied to clipboard!");

    cy.intercept("GET", `${BASE_API_URL}/${shortUrl}`, {
      statusCode: 302,
      headers: {
        location: longUr,
      },
    });

    cy.visit(`${FRONTEND_URL}/${shortUrl}`);
    cy.origin("https://www.facebook.com", () => {
      cy.contains("Facebook");
    });
  });
});
