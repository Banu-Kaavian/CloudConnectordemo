sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ns.abapprograms.controller.View1", {
        
        onInit: function () {
            this.getView().setModel(new JSONModel(), "sourceModel");
        },

        onProgramSelect: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedProgram = oComboBox.getSelectedKey() || oComboBox.getValue();
            
            if (sSelectedProgram) {
                this._fetchProgramSourceCode(sSelectedProgram);
            }
        },

        _fetchProgramSourceCode: function (programName) {
            var sUrl = `/api/sap/opu/odata/sap/ZPROGRAM_READ_SRV/ReadCollection?$filter=ProgramName eq '${programName}'`;
            var oTextArea = this.getView().byId("programCode");
        
            fetch(sUrl, {
                method: "GET",
                headers: {
                    "Accept": "application/xml" // Ensure you expect XML
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok: " + response.statusText);
                }
                return response.text(); // Use text() to get raw XML
            })
            .then(xmlText => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        
                // Extract the source code from the XML response
                const sourceCodeNode = xmlDoc.getElementsByTagName("d:SourceCode")[0];
                var sSourceCode = sourceCodeNode ? sourceCodeNode.textContent : "No source code available";
        
                // Set the source code to the text area
                oTextArea.setValue(sSourceCode);
            })
            .catch(error => {
                oTextArea.setValue("Error fetching source code.");
                console.error("Error:", error);
            });
        }
        
    });
});
