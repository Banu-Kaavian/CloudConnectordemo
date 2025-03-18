const cds = require('@sap/cds');

module.exports = async function (srv) {
    const ODataService = await cds.connect.to('ODataService');

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
};
