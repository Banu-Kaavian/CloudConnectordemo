sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v4/ODataModel"
], (UIComponent, ODataModel) => {
    "use strict";

    return UIComponent.extend("ns.uploadfile.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            var oModel = new ODataModel({
                serviceUrl: "/odata/v4/upload/",
                synchronizationMode: "None" 
            });

            this.setModel(oModel);

            // // enable routing
             this.getRouter().initialize();
        }
    });
});