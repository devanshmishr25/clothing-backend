import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Clothing Webapp API",
      version: "1.0.0"
    },
    servers: [
      { url: "http://localhost:5000" },
      { url: "https://YOUR-RENDER-URL.onrender.com" }
    ]
  },
  apis: ["./src/routes/*.js"] // we will add docs in routes
});
