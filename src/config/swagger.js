import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";

export const swaggerSpec = (() => {
  const filePath = path.join(process.cwd(), "src", "swagger.yaml");
  const yamlText = fs.readFileSync(filePath, "utf8");

  // swagger-jsdoc can accept YAML via definition as a JS object only,
  // so easiest is to keep your current setup OR switch to swagger-ui-express with yaml parser.
  // We'll keep swagger-jsdoc for JSDoc approach instead (Option B).
  return swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: { title: "Clothing Backend API", version: "1.0.0" }
    },
    apis: ["./src/routes/*.js"]
  });
})();
