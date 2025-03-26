const cds = require("@sap/cds");
const axios = require("axios");
require("dotenv").config();
const { parseStringPromise } = require("xml2js");

const xml2js = require("xml2js"); // Install using: npm install xml2js
    

module.exports = cds.service.impl(async function () {
    const { Services, Metadata, EntityData } = this.entities;

    // Common Basic Authentication
    const auth = {
        username: process.env.ODATA_USER,
        password: process.env.ODATA_PASS,
    };

     // Fetch OData Services
     this.on("READ", Services, async () => {
        try {
            const response = await axios.get(
                "http://34.238.82.151:50000/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection?$format=json",
                { auth }
            );

            return response.data.d.results.map(service => ({
                TechnicalServiceName: service.TechnicalServiceName
            }));

        } catch (error) {
            console.error("Error fetching OData Services:", error);
            return [];
        }
    });

    // Fetch Metadata
    this.on("READ", Metadata, async (req) => {
        try {
            //console.log("Request received:", JSON.stringify(req.query, null, 2)); // Debugging
    
            const whereClause = req.query?.SELECT?.where;
            if (!whereClause || whereClause.length < 3) {
                console.error("Invalid or missing WHERE clause in request.");
                return [];
            }
    
            // Extract serviceName from WHERE clause (assuming "serviceName eq 'ZSB_DEMO1'")
            const serviceName = whereClause[2]?.val;
            if (!serviceName) {
                console.error("Service name is missing or invalid in WHERE clause.");
                return [];
            }
    
            //console.log("Extracted serviceName:", serviceName); // Debugging
    
            const response = await axios.get(
                `http://34.238.82.151:50000/sap/opu/odata/sap/${serviceName}/$metadata`,
                { auth }
            );
    
            const parsedXml = await parseStringPromise(response.data, { explicitArray: false });
            const schema = parsedXml["edmx:Edmx"]["edmx:DataServices"]["Schema"];
            const entityTypes = schema["EntityType"];
            if (!entityTypes) return [{ ID: cds.utils.uuid(), metadata: null }];
    
            let entityName = (Array.isArray(entityTypes) ? entityTypes[0] : entityTypes).$.Name;
            if (entityName.endsWith("Type")) {
                entityName = entityName.slice(0, -4);
            }
    
            return [{ ID: cds.utils.uuid(), metadata: entityName }];
        } catch (error) {
            console.error("Error fetching metadata:", error);
            return [];
        }
    });
    
    // Fetch Entity Data
    
    this.on("READ", EntityData, async (req) => {
        try {
            let serviceName = req?._.req?.query?.serviceName;
            let entityName = req?._.req?.query?.entityName;
    
            if (!serviceName || !entityName) {
                console.error("Error: Service name or entity name is missing.");
                return [];
            }
    
            const response = await axios.get(
                `http://34.238.82.151:50000/sap/opu/odata/sap/${serviceName}/${entityName}/`,
                {
                    headers: { Accept: "application/json, application/xml" },
                    auth,
                }
            );
    
            let data = [];
    
            if (response.headers["content-type"].includes("application/json")) {
                data = response.data?.d?.results || [];
            } else if (response.headers["content-type"].includes("application/xml")) {
                const parser = new xml2js.Parser({ explicitArray: false });
                const jsonData = await parser.parseStringPromise(response.data);
                data = jsonData?.feed?.entry || [];
            }
    
            //  Ensure response is always an array
            if (!Array.isArray(data)) {
                console.warn("Unexpected response format, wrapping into an array.");
                data = [data];
            }
    
            return data;
        } catch (error) {
            console.error("Error fetching entity data:", error.response?.data || error.message);
            return [];
        }
    });
     
});