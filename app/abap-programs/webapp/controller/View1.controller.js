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
            
            sSelectedProgram = sSelectedProgram.trim();

            if (sSelectedProgram) {
                this._fetchProgramSourceCode(sSelectedProgram);
            }
        },

        _fetchProgramSourceCode: function (programName) {
            console.log(programName);
            
            // Construct the URL with the program name as a query parameter
            var sUrl = `/odata/v4/catalog/SourceCode?programName=${programName}`;
        
            console.log(sUrl);
            
            var oTextArea = this.getView().byId("programCode");
        
            fetch(sUrl, {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                }
            })
            
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok: " + response.statusText);
                    
                }
                return response.json(); // Parse JSON response
                

            })
            .then(data => {
               
                oTextArea.setValue(data.value.sourceCode); 
                console.log(data.sourceCode);
            })
            .catch(error => {
                oTextArea.setValue("Error fetching source code.");
                console.error("Error:", error);
            });
        }
        
    });
});
