sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function(Controller, JSONModel, MessageToast, Fragment) {
    "use strict";

    return Controller.extend("ns.tableview.controller.View1", {
        onInit: function() {
            this.getView().setModel(new JSONModel(), "viewModel");
        },

        onPreview: function() {
            var oView = this.getView();
            var serviceName = oView.byId("serviceInput").getValue().trim();

            if (!serviceName) {
                MessageToast.show("Please enter a service name.");
                return;
            }

            console.log("Fetching Metadata for Service:", serviceName);

            var that = this;
            axios.get(`/odata/v4/catalog/Metadata?$filter=serviceName eq '${serviceName}'`)
            .then(response => {
                console.log("Metadata Response:", response.data);
                if (response.data.value && response.data.value.length > 0) {
                    var entityName = response.data.value[0].metadata;
                    console.log("The service Name:",serviceName,"The Entity Name: ",entityName);
                    that.loadEntityData(serviceName, entityName);
                } 
                else 
                {
                    MessageToast.show("No metadata found for the given service.");
                }
            })
            .catch(error => {
                console.error("Error fetching metadata:", error);
                MessageToast.show("Error fetching metadata");
            });

        },

        loadEntityData: function(serviceName, entityName) {
            var that = this;
        
            axios.get(`/odata/v4/catalog/EntityData?serviceName=${serviceName}&entityName=${entityName}`)
                .then(response => {
                    console.log("Full Entity Data Response:", response?.data?.value);
        
                    if (!Array.isArray(response?.data?.value) || response?.data?.value.length === 0) {
                        console.warn("Response data is empty or invalid.");
                        sap.m.MessageToast.show("No data available for this entity.");
                        return;
                    }
        
                    // Step 1: Transform Data
                    var transformedData = response.data.value.map(item => {
                        let transformedItem = {};
                        Object.keys(item).forEach(key => {
                            if (key !== "_metadata") {
                                transformedItem[key] = item[key];
                            }
                        });
                        return transformedItem;
                    });
        
                    // Step 2: Set model before binding data
                    var oModel = new sap.ui.model.json.JSONModel({ results: transformedData });
                    var oView = that.getView();
                    if (!oView) {
                        console.warn("View is not available. Cannot set model.");
                        return;
                    }
                    oView.setModel(oModel, "viewModel");
                    
                    // Step 3: Create table columns & bind data
                    that.createTableColumns(transformedData);
        
                    console.log("TransformData", transformedData);
                    console.log("View Model Data:", this.getView().getModel("viewModel").getData());

                    
                    // Step 4: Refresh UI
                    oView.getModel("viewModel").refresh();
                })
                .catch(error => {
                    console.error("Error fetching entity data:", error);
                    sap.m.MessageToast.show("Error fetching entity data.");
                });
        },
        
        convertSAPDate: function(sapDate) {
            if (!sapDate) return "";
            
            var match = sapDate.match(/\d+/);
            if (!match) return "Invalid Date";

            var timestamp = parseInt(match[0], 10);
            var date = new Date(timestamp);
            return date.toISOString().split("T")[0];
        },

        createTableColumns: function (data) {
            var oTable = this.getView().byId("dataTable");
        
            // Remove existing columns & items
            oTable.removeAllColumns();
            oTable.destroyItems();
        
            if (!data || data.length === 0) {
                console.warn("No data available for columns");
                sap.m.MessageToast.show("No data available.");
                return;
            }
        
            var aKeys = Object.keys(data[0]); // Extract column names
        
            // Create columns
            aKeys.forEach(function (key) {
                oTable.addColumn(new sap.m.Column({
                    header: new sap.m.Text({ text: key })
                }));
            });
        
            // Create dynamic row template
            var oTemplate = new sap.m.ColumnListItem({
                cells: aKeys.map(function (key) {
                    return new sap.m.Text({ text: "{viewModel>" + key + "}" }); 
                })
            });
        
            //Bind table items to viewModel
            oTable.bindItems({
                path: "viewModel>/results",
                template: oTemplate
            });
        
            oTable.setVisible(true);
        }
         
    });
});
