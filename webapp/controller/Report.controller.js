sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox", 'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/ui/core/Fragment", 'sap/ui/model/BindingMode',
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet"
], (Controller, MessageBox, Filter, FilterOperator, JSONModel, Fragment, BindingMode, x, Spreadsheet) => {
    "use strict";
    var EdmType = x.EdmType;
    return Controller.extend("zppdailyreport.controller.Report", {
        onInit() {//week1,month,week2,weekdays,shoporder,product,prdcategory,
            this.getOwnerComponent().getModel("i18n")._oResourceBundle.aPropertyFiles[0].mProperties.HeaderTitle = 'Overall Report';
            this.getOwnerComponent().getModel("i18n").refresh(true);
            // var sinitvis = "size,prodsch,lotsize,suppwastg,actmixed,actfilled,caseprd,schvsfilled,mixvsact,proccplant,prdcycle,runningblock,uhtlosslitrs,uhtlossperc,prdlosslitrs,prdlossperc";
            // this.getOwnerComponent().getModel("initialvisible").setProperty("/results", sinitvis);
            // var sinitvis1 = "recepielosslitrs ,recepielossperc,totallosslitrs,totallossperc,remarks";
            // this.getOwnerComponent().getModel("initialvisible").setProperty("/results1", sinitvis1);
            this.getOwnerComponent().getModel("initialvisible").setProperty("/flag", true);
            this.getOwnerComponent().getModel("initialvisible").setProperty("/flag1", true);
            this.getOwnerComponent().getModel("initialvisible").refresh(true);
        },
        refreshTable: function () {
            this.byId("smartTable").rebindTable();
        },
        formatcomma: function (e) {
            var sval = e;
        if(e !== '' && e !==  null && e !== undefined){
            if(e.charAt(0).indexOf(",") !== -1){
                sval = e.slice(1);
            }
        }
            return sval;
        },
        formatWeekdays: function (e) {
            var sval = e;
            var formatter = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd-MM-yyyy"
            });

            if(e !== '' && e !==  null && e !== undefined){
                var oval = e.split("-");
                var date0 = new Date(oval[0].substring(0,4)+"-"+oval[0].substring(6,4)+"-"+oval[0].substring(8,6));
                var date1 = new Date(oval[1].substring(0,4)+"-"+oval[1].substring(6,4)+"-"+oval[1].substring(8,6));                
                var sVal0 = formatter.format(date0);
                var sVal1 = formatter.format(date1);
                sval = sVal0 +" --- "+sVal1;
            }
            return sval;
        },
        onchangeReport: function (e) {
            // if(this.getView().byId("smartFilterBar").getFilters()[0] === undefined){
            //     sap.m.MessageBox.error("Please select filters");
            //     return;
            // }
            var sval = e.getParameter("selectedItem").getKey();
            //this.getView().byId("smartFilterBar").getFilters()[0].aFilters.push(new sap.ui.model.Filter("Report", sap.ui.model.FilterOperator.EQ, sval));
            
            this.getView().getModel("i18n")._oResourceBundle.aPropertyFiles[0].mProperties.HeaderTitle = e.getParameter("selectedItem").getText();
            this.getView().getModel("i18n").refresh(true);
            this.getView().getModel("initialvisible").setProperty("/flag", true);
            this.getView().getModel("initialvisible").setProperty("/flag1", true);
            if (sval === 'W') {
                this.getView().getModel("initialvisible").setProperty("/flag", false);
            } 
            if (sval === 'M') {
                this.getView().getModel("initialvisible").setProperty("/flag1", false);
            } 

            this.getView().getModel("initialvisible").refresh(true);
            this.byId("smartTable").rebindTable();
        },

        onBeforeRebindTable: function(oEvent){
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.parameters = oBindingParams.parameters || {};
                            
            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            var vCategory;
            if (oSmartFilterBar instanceof sap.ui.comp.smartfilterbar.SmartFilterBar) {
                //Custom price filter
                var oCustomControl = oSmartFilterBar.getControlByKey("Report");
                if (oCustomControl instanceof sap.m.Select) {
                    vCategory = oCustomControl.getSelectedKey();
                    switch (vCategory) {
                        case "W":
                            oBindingParams.filters.push(new sap.ui.model.Filter("Report",sap.ui.model.FilterOperator.EQ, "W"));
                            break;
                        case "M":
                            oBindingParams.filters.push(new sap.ui.model.Filter("Report",sap.ui.model.FilterOperator.EQ, "M"));
                            break;
                        default:
                            break;
                    }
                }
            }
        },
         onExport: function (OEvt) {
            var ofilters=this.getView().byId("smartFilterBar").getFilters()[0].aFilters;
            this.getOdata("/HeaderSet", "ReportModel", ofilters).then((res) => {
              
            var aCols,
                aData,
                oSettings;

            aCols = this.createColumnConfig();
            aData = res;
            debugger;
            var sid = this.getView().byId("customSelect").getSelectedItem().getProperty("text");
            oSettings = {
                workbook: {
                    columns: aCols
                },
                dataSource: aData,
                fileName: sid
            };

            new Spreadsheet(oSettings).build().then(function () {
                MessageToast.show("Export has finished");
            });

            });
        },
         createColumnConfig: function () {
            var selectedColumns = this.getView().byId("smartTable")._oTable.getBindingInfo("items").parameters.select;
            var tablemetadata = this.getModel().getServiceMetadata().dataServices.schema[0].entityType;
            var selectedCol = selectedColumns.split(",");
            var seldata = [], selcolumn = [];
            var sentity = [];
            tablemetadata.forEach(function (ent) {
                if (ent.name === "Header") {
                    sentity = ent.property;
                }
            });
            selectedCol.forEach(function (oItem) {
                var selCurrRow = sentity.filter(function (el) {
                    return el.name == oItem;
                }.bind(this));
                if (selCurrRow.length > 0) {
                    var sdt = {
                        "label": selCurrRow[0].extensions[1].value,
                        "property": selCurrRow[0].name
                    }
                    seldata.push(sdt);
                }

            });

           return seldata;
        },
          getModel: function (e) {
                return this.getView().getModel(e)
            },
            setModel: function (e, t) {
                return this.getView().setModel(e, t)
            },
            showBusy: function (bBusy) {
                if (bBusy) {
                    sap.ui.core.BusyIndicator.show(0);
                } else {
                    sap.ui.core.BusyIndicator.hide();
                }
            },
            getText: function (sProperty, aArgs) {
                if (!this._oResourceBundle) {
                    this._oResourceBundle = this.getModel("i18n").getResourceBundle();
                }
                return this._oResourceBundle.getText(sProperty, aArgs);
            },

            getResourceBundle: function (sText) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle()
            },

             getOdata: function (surl, smodelname, ofilter, stype) {
            return new Promise((resolve, reject) => {
            if (ofilter === null) {
                this.showBusy(true);
                this.getOwnerComponent().getModel().read(surl, {
                    success: function (oData) {
                        this.showBusy(false);
                        this.getOwnerComponent().getModel(smodelname).setProperty("/results", oData.results);
                       resolve(oData.results);
                    }.bind(this),
                    error: function (oError) {
                        this.showBusy(false);
                       reject();
                    }.bind(this)
                });
            } else {
                this.showBusy(true);
                this.getOwnerComponent().getModel().read(surl, {
                    filters: [ofilter],
                    success: function (oData) {
                        this.showBusy(false);
                        this.getOwnerComponent().getModel(smodelname).setProperty("/results", oData.results);
                        resolve(oData.results);
                    }.bind(this),
                    error: function (oError) {
                        this.showBusy(false);
                        reject();
                    }.bind(this)
                });
            }
             });
            }

    });
});