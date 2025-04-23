sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/util/UriParameters",
    "sap/m/MessageBox"
  ], function (Controller, UriParameters, MessageBox) {
    "use strict";
  
    return Controller.extend("ns.tableview.controller.BaseController", {
        /**
         * Determines the API configuration based on the current environment.
         * @returns {object} An object containing the API url and headers.
         */
        getApiConfig: function() {
            // Get config from manifest.json
            const oConfig = this.getOwnerComponent().getManifestEntry("/sap.ui5/config");
        
            if (!oConfig || !oConfig.routerConfig) {
                console.error("routerConfig is missing in manifest.json");
                return { url: "" };  // Return an empty URL to prevent errors
            }
        
            // Get hostname
            const sHostname = window.location.hostname;
        
            // Check if running locally
            const bIsBAS = sHostname.includes("applicationstudio.cloud.sap");
            const bIsLocal = sHostname === "localhost" || bIsBAS || 
                             new URLSearchParams(window.location.search).get("local") === "true";
        
            if (bIsLocal) {
                return {
                    url: oConfig?.routerConfig?.localApi?.uri || "/default/local/api/"
                };
            } else {
                return {
                    url: oConfig?.routerConfig?.productionApi?.uri || "/default/production/api/",
                    headers: {}
                };
            }
        },
        
        // getApiConfig: function() {
        //   // Get router configuration from manifest
        //   const oConfig = this.getOwnerComponent().getManifestEntry("/sap.ui5/config/routerConfig");
        //   const sHostname = window.location.hostname;
          
        //   // Check if running in Business Application Studio
        //   const bIsBAS = sHostname.includes("applicationstudio.cloud.sap");
          
        //   console.log(bIsBAS, "BAS");
          
        //   /**
        //    * Determine if running in a local environment
        //    * Set bIsLocal as true, if the hostname is localhost, or in BAS, or 'local=true' in URL parameters
        //    */
        //   const bIsLocal = sHostname === "localhost" || bIsBAS || UriParameters.fromQuery(window.location.search).get("local") === "true";
          
        //   console.log(bIsLocal);
          
        //   if (bIsLocal) {
        //       // Return local API configuration
        //       return {
        //           url: oConfig.localApi.uri
        //       };
        //   } else {
        //       /**
        //        * Return production API configuration
        //        * Use the base path from the manifest for the URL
        //        */
        //       return {
        //           url: this.getOwnerComponent().getManifestObject()._oBaseUri._parts.path,
        //           headers: {}
        //       };
        //   }
        // },
        /**
          * Handles error and display it to users
          * @param {Error} error 
        */
        errorHandler : function (error) {
          
          let errorCode = 500;
          let errorMessage = error.message;
           
          // If error send from authentication server
          if(typeof(error?.response?.data) === 'string') {
            errorCode = error.response.status;
            errorMessage =error.response.data;
          } else if(error?.response){                // If error send from server
            const errorResponse = error.response.data;
            const errorResponseType = Object?.keys(errorResponse)[0];
            
            errorCode = error.response.status;
          
            errorMessage =`${errorResponseType}: ${errorResponse[errorResponseType].message}`;
          }
  
          MessageBox.error(`${errorCode}, ${errorMessage}`);
      }
    //   ,
    //   getEnvironmentVariables: async function(){
    //     try {
    //         const {url} = this.getApiConfig();
            
    //         console.log(url);
            
    //         return url;
    //     } catch (error) {
    //         console.log("Error failed to get the url");
            
    //     }
    //   }
    });
  });