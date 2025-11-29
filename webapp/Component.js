sap.ui.define([
    "sap/ui/core/UIComponent",
    "zppdailyreport/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("zppdailyreport.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(new sap.ui.model.json.JSONModel(), "initialvisible");
            this.setModel(new sap.ui.model.json.JSONModel(), "ReportModel");
            this.setModel(new sap.ui.model.json.JSONModel(), "LocalModel");
            // enable routing
            this.getRouter().initialize();
        }
    });
});