const cds = require('@sap/cds');
const axios = require('axios');

module.exports = async function (srv) {
    const ODataService = await cds.connect.to('ODataService');

    // Existing READ handler for Programs
    srv.on('READ', 'Programs', async (req) => {
        try {
            let allResults = [];
            let skip = 0;
            const batchSize = 500; // Fetch in batches

            while (true) {
                const results = await ODataService.run(
                    SELECT.from('ODataService.Programs')
                        .columns('ProgramName')
                        .limit(batchSize, skip)
                );

                if (results.length === 0) break;

                allResults.push(...results);
                skip += batchSize;
            }

            console.log(`Fetched Programs: ${allResults.length}`);
            return allResults;
        } catch (error) {
            req.reject(500, `Error fetching data: ${error.message}`);
        }
    });

    // New endpoint to get the source code of a specific program
    srv.on('SourceCode', async (req) => {
        console.log( req?._.req?.query?.programName);
        
        const programName =  req?._.req?.query?.programName; // Get program name from the request
        
        
        try {
            const url = `http://44.201.188.132:50000/sap/opu/odata/sap/ZPROGRAM_READ_SRV/ReadCollection?$filter=ProgramName eq '${programName}'`;
            
            const response = await axios.get(url, {
                auth: {
                    username: 'KAAV22',
                    password: 'Newpass22',
                },
            });
            var sourceCode = response.data.d.results[0].SourceCode;

            return { sourceCode }; // Return the source code to the frontend
        } catch (error) {
            req.reject(500, `Error fetching source code: ${error.message}`);
        }
    });
};
