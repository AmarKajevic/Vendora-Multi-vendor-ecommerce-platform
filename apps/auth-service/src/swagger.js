import { version } from "react";
import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Auth Service API",
        description: "Automatically generated swagger documentation for Auth Service API",
        version: "1.0.0",
    },
    host: "localhost:6001",
    schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endPointsFiles = ["./routes/auth.routes.ts"];

swaggerAutogen(outputFile, endPointsFiles, doc);