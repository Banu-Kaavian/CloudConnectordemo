const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Files } = this.entities;

    this.on('uploadFile', async (req) => {
        const { ID, fileName, fileContent } = req.data;

        if (!fileContent) {
            req.error(400, "File content is required.");
        }

        await INSERT.into(Files).entries({ ID, fileName, fileContent });
        return { message: "File uploaded successfully!" };
    });
});
