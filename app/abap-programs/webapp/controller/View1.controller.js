sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ns.abapprograms.controller.View1", {
        onInit: function () {
        },
        onProgramSelect: function (oEvent) {
            var sSelectedProgram = oEvent.getSource().getSelectedKey();
            var oModel = this.getView().getModel("mainmodel"); 
            var that = this;
            var oListBinding = oModel.bindList("/Programs", undefined, undefined, 
                [new sap.ui.model.Filter("ProgramName", sap.ui.model.FilterOperator.EQ, sSelectedProgram)]
            );
            oListBinding.requestContexts().then(function (aContexts) {
                if (aContexts.length > 0) {
                    var sProgramCode = aContexts[0].getObject().ProgramSourceCode;
                    that.getView().byId("programCode").setValue(sProgramCode);
                } else {
                    that.getView().byId("programCode").setValue("No source code available.");
                }
            }).catch(function () {
                sap.m.MessageToast.show("Failed to load program source code.");
            });
        }
    });
});
