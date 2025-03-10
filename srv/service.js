const cds = require('@sap/cds');

module.exports = async function (srv) {
    const ODataService = await cds.connect.to('ODataService'); // Connect to OData V2

    srv.on('READ', 'Programs', async (req) => {
        try {
            const results = await ODataService.run(req.query);

            // Explicitly fetch binary data if needed
            if (results && Array.isArray(results)) {
                for (let program of results) {
                    if (program.ProgramName) {
                        let binaryData = await ODataService.run(
                            SELECT.one.from('ODataService.Programs')
                                .columns('ProgramSourceCode')
                                .where({ ProgramName: program.ProgramName })
                        );
                        console.log(program.ProgramSourceCode);

                        if (binaryData && binaryData.ProgramSourceCode) {
                            program.ProgramSourceCode = Buffer.from(binaryData.ProgramSourceCode).toString('base64');
                        }
                    }
                }
            }
            return results;
        } catch (error) {
            req.reject(500, `Error fetching data: ${error.message}`);
        }
    });
};
