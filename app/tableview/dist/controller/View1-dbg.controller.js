sap.ui.define([
    "ns/tableview/controller/BaseController",
    
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function(BaseController, JSONModel, MessageToast, Fragment, MessageBox) {
    "use strict";

    return BaseController
    .extend("ns.tableview.controller.View1", {
        onInit: function() {
          
            
            this.getView().setModel(new JSONModel(), "viewModel");
            const {url} = this.getApiConfig();
            this.SERVERHOST = url;
            console.log(this.SERVERHOST);
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
            console.log(`${this.SERVERHOST}/odata/v4/catalog/Metadata?$filter=serviceName eq '${serviceName}'`);
            
            axios.get(`${this.SERVERHOST}Metadata?$filter=serviceName eq '${serviceName}'`)
            .then(response => {
                console.log("Metadata Response:", response.data);
                if (response.data.value && response.data.value.length > 0) {
                    var entityName = response.data.value[0].metadata;

                    console.log("The service Name:",serviceName,"The Entity Name: ",entityName);

                    that.loadEntityData(serviceName, entityName);
                } 
                else 
                {
                    MessageBox.warning("No Service Found \n Please Enter a Valid Service Name");
                }
            })
            .catch(error => {
                console.error("Error fetching metadata:", error);
                MessageBox.error("Error fetching metadata");
            });

        },
        onColumnChange: function (oEvent) {
            var sSelectedKey = oEvent.getSource().getSelectedKey();
        
            if (!sSelectedKey) {
                console.log("No column selected.");
                return;
            }
        
            // Store selected column for filtering
            this.selectedColumn = sSelectedKey;
        },
        
        
        onFilterData: function (oEvent) {
            var sQuery = oEvent.getParameter("value"); // Get user input value
            var oTable = this.getView().byId("dataTable"); // Get table
            var oBinding = oTable.getBinding("items"); // Get data binding
        
            if (!this.selectedColumn) {
                MessageBox.warning("Please select a column to filter.");
                return;
            }
        
            if (sQuery) {
                var oFilter = new sap.ui.model.Filter(this.selectedColumn, sap.ui.model.FilterOperator.Contains, sQuery);
                oBinding.filter([oFilter]); // Apply filter
            } else {
                oBinding.filter([]); // Reset filter
            }
        },
        
        // Function to dynamically populate column selection
        populateFilterColumns: function (data) {
            var oSelect = this.getView().byId("filterColumnSelect");
            oSelect.destroyItems(); // Clear previous entries
        
            // Add an empty option as the first item
            oSelect.addItem(new sap.ui.core.Item({
                key: "",
                text: "-- Select Column --" // Placeholder text
            }));
        
            // Get keys (column names) from the first data object
            if (data.length > 0) {
                var aKeys = Object.keys(data[0]); // Extract column names
                aKeys.forEach(function (key) {
                    oSelect.addItem(new sap.ui.core.Item({
                        key: key,
                        text: key.toUpperCase() // Display as uppercase
                    }));
                });
            }
        
            // Set default selection to the empty option
            oSelect.setSelectedKey("");
        },
        
        
        // Modify loadEntityData to call populateFilterColumns
        loadEntityData: function(serviceName, entityName) {
            var that = this;
            axios.get(`${this.SERVERHOST}EntityData?serviceName=${serviceName}&entityName=${entityName}`)
                .then(response => {
                    if (!Array.isArray(response?.data?.value) || response?.data?.value.length === 0) {
                        MessageBox.information("No data available for this entity.");
                        return;
                    }
        
                    var transformedData = response.data.value.map(item => {
                        let transformedItem = {};
                        Object.keys(item).forEach(key => {
                            if (typeof item[key] === "string" && item[key].startsWith("/Date(")) {
                                transformedItem[key] = that.convertSAPDate(item[key]);
                                } else if (key !== "__metadata") {
                                    transformedItem[key] = item[key];
                                }
                        });
                        return transformedItem;
                    });
                    var oModel = new sap.ui.model.json.JSONModel({ results: transformedData });
        
                
                    that.getView().setModel(oModel, "viewModel");
        
                    // Populate filter dropdown with columns
                    that.populateFilterColumns(transformedData);
        
                    that.createTableColumns(transformedData);
                    
                    

                    that.getView().getModel("viewModel").refresh();
                })
                .catch(error => {
                    sap.m.MessageToast.show("Error fetching entity data.");
                    console.error("Error fetching entity data:", error);
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
                    header: new sap.m.Text({ text: key.toUpperCase() })
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
