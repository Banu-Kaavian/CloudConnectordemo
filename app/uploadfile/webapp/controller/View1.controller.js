sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/unified/FileUploader"
], function (Controller, MessageToast, JSONModel, FileUploader) {
    "use strict";

    return Controller.extend("ns.uploadfile.controller.View1", {
        onInit: function () {
            
        },
        onFileChange: function (oEvent) {
            var oFile = oEvent.getParameter("files")[0];
            var reader = new FileReader();
        
            if (oFile.type.startsWith("text")) {
            
                reader.onload = function (e) {
                    var textContent = e.target.result;
                    console.log("Text File Content:", textContent);
                    sap.m.MessageToast.show("Text File Content: " + textContent);
                };
                reader.readAsText(oFile);
            } else if (oFile.name.endsWith(".docx")) {
                // Read DOCX file using Mammoth
                reader.onload = function (e) {
                    var arrayBuffer = e.target.result;
        
                    if (window.mammoth) {
                        window.mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                            .then(function (result) {
                                console.log("DOCX File Content:", result.value);
                                sap.m.MessageToast.show("DOCX File Content: " + result.value);
                            })
                            .catch(function (error) {
                                console.error("Error processing file...:", error);
                                
                            });
                    } else {
                        sap.m.MessageToast.show("Mammoth.js not found.");
                    }
                };
        
                reader.readAsArrayBuffer(oFile);
            } else {
                sap.m.MessageToast.show("Unsupported file type. Only .txt and .docx are allowed.");
            }
        }
    });
});
