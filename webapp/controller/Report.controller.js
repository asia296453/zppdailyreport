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
        onInit() {
            // week1,month,weekdays,shoporder,product,prdcategory,size,prodsch,lotsize,suppwastg,actmixed,actfilled,caseprd,schvsfilled,mixvsact,proccplant,prdcycle,runningblock,uhtlosslitrs,uhtlossperc,prdlosslitrs,prdlossperc
            //suppwastg,actmixed,actfilled,caseprd,schvsfilled,mixvsact,proccplant,prdcycle,runningblock,uhtlosslitrs,uhtlossperc,prdlosslitrs,prdlossperc
            this.getOwnerComponent().getModel("i18n")._oResourceBundle.aPropertyFiles[0].mProperties.HeaderTitle = 'Overall Report';
            this.getOwnerComponent().getModel("i18n").refresh(true);
            // var sinitvis = "size,prodsch,lotsize,suppwastg,actmixed,actfilled,caseprd,schvsfilled,mixvsact,proccplant,prdcycle,runningblock,uhtlosslitrs,uhtlossperc,prdlosslitrs,prdlossperc";
            // this.getOwnerComponent().getModel("initialvisible").setProperty("/results", sinitvis);
            // var sinitvis1 = "recepielosslitrs ,recepielossperc,totallosslitrs,totallossperc,remarks";
            // this.getOwnerComponent().getModel("initialvisible").setProperty("/results1", sinitvis1);
            this.getOwnerComponent().getModel("initialvisible").setProperty("/flag", true);
            this.getOwnerComponent().getModel("initialvisible").setProperty("/flag1", false);
            this.getOwnerComponent().getModel("initialvisible").refresh(true);

            this.getOwnerComponent().getModel("LocalModel").setProperty("/Plant","5910");
            this.getOwnerComponent().getModel("LocalModel").setProperty("/Report","O");
                    this.getOwnerComponent().getModel("LocalModel").setProperty("/Year","");

            this.getOwnerComponent().getModel("monthflag").setProperty("/flag", false);
            this.getOwnerComponent().getModel("monthflag").setProperty("/flag1", false);
            this.getOwnerComponent().getModel("monthflag").refresh(true);
            this.setmonth();
            // this.getOwnerComponent().getModel("LocalModel").setProperty("/Material","20000002");
            // this.getOwnerComponent().getModel("LocalModel").setProperty("/Week","28");
        },
        formatDate: function (dt) {
			if (dt === undefined || dt === null || dt === "") {
				return;
			}
			var date = new Date(dt),
				month = '' + (dt.getMonth() + 1),
				day = '' + dt.getDate(),
				year = dt.getFullYear();
			if (month.length < 2)
				month = '0' + month;
			if (day.length < 2)
				day = '0' + day;
			return [day, month, year].join('.');
		},
        setmonth:function(){
            var omonth = [{"month":"January","key":"01"},
                {"month":"February","key":"02"},
                {"month":"March","key":"03"},
                {"month":"April","key":"04"},
                {"month":"May","key":"05"},
                {"month":"June","key":"06"},
                {"month":"July","key":"07"},
                {"month":"August","key":"08"},
                {"month":"September","key":"09"},
                {"month":"October","key":"10"},
                {"month":"November","key":"11"},
                {"month":"December","key":"12"}];
            
            this.getOwnerComponent().getModel("month1").setProperty("/results", omonth);
            this.getOwnerComponent().getModel("month1").refresh(true);

            var slastyear =  new Date(new Date().setFullYear(new Date().getFullYear() - 2));
            var snext3years = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
              var omonth1 = [];
              var okey = [];
            for (var d = slastyear ; d <= snext3years; d.setDate(d.getDate() + 1)) {
                    var skey = (d.getMonth()+1)  + '-' + (d.getFullYear());
                     var selCurrRow1 = okey.filter(function (el) {
                            return el == skey;
                        });
                    if (selCurrRow1.length > 0) {
                    }else{
                    if (omonth && omonth.length > 0) {
                        var selCurrRow = omonth.filter(function (el) {
                            return el.key == d.getMonth()+1;
                        });
                    }
                    if (selCurrRow.length > 0) {
                        var sval ={ "month": selCurrRow[0].month +" "+ d.getFullYear() ,
                                    "key": d
                        }
                        omonth1.push(sval);
                    }
                    
                         okey.push(skey);
                }
                   
                }
               
                 this.getOwnerComponent().getModel("month").setProperty("/results", omonth1);
            this.getOwnerComponent().getModel("month").refresh(true);

        },
        refreshTable: function () {
            this.byId("smartTable").rebindTable();
        },
        refreshTable1: function () {
            this.byId("smartTable1").rebindTable();
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
            if (sval === 'O') {
                this.getView().getModel("initialvisible").setProperty("/flag", true);
                this.getView().getModel("initialvisible").setProperty("/flag1", false);
                this.getView().getModel("initialvisible").refresh(true);

                this.getOwnerComponent().getModel("monthflag").setProperty("/flag", false);
                this.getOwnerComponent().getModel("monthflag").setProperty("/flag1", false);
                this.getOwnerComponent().getModel("monthflag").refresh(true);
                this.byId("smartTable").rebindTable();
            }
            if (sval === 'W') {
                this.getView().getModel("initialvisible").setProperty("/flag", false);
                this.getView().getModel("initialvisible").setProperty("/flag1", true);
                this.getView().getModel("initialvisible").refresh(true);

                this.getOwnerComponent().getModel("monthflag").setProperty("/flag", false);
                this.getOwnerComponent().getModel("monthflag").setProperty("/flag1", true);
                this.getOwnerComponent().getModel("monthflag").refresh(true);
                this.byId("smartTable1").rebindTable();
            }
            if (sval === 'M') {
                if (this.getView().getModel("LocalModel").getData().month !== null
                    && this.getView().getModel("LocalModel").getData().month !== ''
                    && this.getView().getModel("LocalModel").getData().month !== undefined) {
                    this.getView().getModel("initialvisible").setProperty("/flag", false);
                    this.getView().getModel("initialvisible").setProperty("/flag1", true);
                    this.getView().getModel("initialvisible").refresh(true);

                    this.getOwnerComponent().getModel("monthflag").setProperty("/flag", true);
                    this.getOwnerComponent().getModel("monthflag").setProperty("/flag1", false);
                    this.getOwnerComponent().getModel("monthflag").refresh(true);
                    this.byId("smartTable1").rebindTable();
                } else {
                    sap.m.MessageBox.error("Month is mandatory");
                    return;
                }
            }
        },
        buildFiltersForCustomFields: function () {
                    var oFilterBar = this.getView().byId("fbPreqs");
                    var aFilters = [];
                    oFilterBar.getFilterGroupItems().forEach(function (oItem) {
                        var oControl = oItem.getControl();
                        var sControlType = oControl.getMetadata().getName();
        
                        switch (sControlType) {
                             case "sap.m.Select":
                                var sKey1 = oControl.getSelectedKey();
                                if (sKey1) {
                                    aFilters.push(new Filter(oItem.getName(), FilterOperator.EQ, sKey1));
                                }
                                 break;
                            case "sap.m.MultiComboBox":
                                var oKey = oControl.getSelectedKey();
                               aFilters.push(new Filter(oItem.getName(), FilterOperator.EQ, oKey));
                                break;
                            case "sap.m.Input":
                                var sValue = oControl.getValue();
                                if (sValue && oItem.getName() !=='Bukrs') {
                                    aFilters.push(new Filter(oItem.getName(), FilterOperator.EQ, sValue));
                                }
        
                                break;
                            case "sap.m.ComboBox":
                                var sKey = oControl.getSelectedKey();
                                if (sKey) {
                                    aFilters.push(new Filter(oItem.getName(), FilterOperator.EQ, sKey));
                                }
        
                                break;
                            case "sap.m.MultiInput":
                                var ovl = [];
                                var sfilterval = '';
                                if(oControl.getProperty("value") !== ''){
                                    var ovl = oControl.getProperty("value").split(",");
                                   for(var i = 0 ; i< ovl.length ; i++){           
                                    if(oControl.mBindingInfos.value.parts[0].path.split("/")[1] === 'month'){
                                        aFilters.push(new Filter("month", FilterOperator.BT, ovl[i].trim().split(" ")[0],ovl[i].trim().split(" ")[1]));
                                        // aFilters.push(new Filter("year", FilterOperator.EQ, ovl[i].trim().split(" ")[1]));
                                    }   
                                    else{
                                        aFilters.push(new Filter(oControl.mBindingInfos.value.parts[0].path.split("/")[1], FilterOperator.EQ, ovl[i].trim()));
                                    }                      
                                    
                                   }
                                } 
                                break;
        
                            case "sap.m.DateRangeSelection":
                                var oDateFrom = oControl.getDateValue();
                                var oDateTo = oControl.getSecondDateValue();
                                if(oDateFrom !== null && oDateTo !== null){
                                    aFilters.push(new Filter(oItem.getName(), FilterOperator.EQ,this.formatDate(oDateFrom)));
                                    aFilters.push(new Filter(oItem.getName(), FilterOperator.EQ,this.formatDate(oDateTo)));
                                }
                               
        
                                break;
                        }
                    }.bind(this));
                    return aFilters;
                },
                onClearFilterBar: function (oEvent) {
                    var oFilterBar = this.getView().byId("fbPreqs");
                    oFilterBar.getFilterGroupItems().forEach(function (oItem) {
                        var oControl = oItem.getControl();
                        switch (oControl.getMetadata().getName()) {
                            case "sap.m.Input": oControl.setValue("");
                                break;
                            case "sap.m.DateRangeSelection": oControl.setDateValue(null);
                                oControl.setSecondDateValue(null);
                                break;
                            case "sap.m.MultiInput":oControl.setValue("");
                                break;
                            case "sap.m.ComboBox": oControl.setSelectedKey("");
                                break;
                            case "sap.m.MultiComboBox": oControl.setSelectedKeys("");
                                break;
                                 case "sap.m.Select": oControl.setSelectedKey("");
                                break;
                        }
                    });
                    this.getOwnerComponent().getModel("LocalModel").setProperty("/Plant","5910");
                    this.getOwnerComponent().getModel("LocalModel").setProperty("/Report","O");
                    this.getOwnerComponent().getModel("LocalModel").refresh();
                },

        onBeforeRebindTable1: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            var aFilters = this.buildFiltersForCustomFields();
            debugger;
            var aStandardFilters = oBindingParams.filters;
            aFilters = aFilters.concat(aStandardFilters);
            oBindingParams.filters = aFilters;

        },

        onBeforeRebindTable: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            var aFilters = this.buildFiltersForCustomFields();
            var aStandardFilters = oBindingParams.filters;
            debugger;
            aFilters = aFilters.concat(aStandardFilters)
            oBindingParams.filters = aFilters;

        // var oBindingParams = oEvent.getParameter("bindingParams");
            // oBindingParams.parameters = oBindingParams.parameters || {};
                            
            // var oSmartTable = oEvent.getSource();
            // var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            // var vCategory;
            // if (oSmartFilterBar instanceof sap.ui.comp.smartfilterbar.SmartFilterBar) {
            //     //Custom price filter
            //     var oCustomControl = oSmartFilterBar.getControlByKey("Report");
            //     if (oCustomControl instanceof sap.m.Select) {
            //         vCategory = oCustomControl.getSelectedKey();
            //         switch (vCategory) {
            //             case "W":
            //                 oBindingParams.filters.push(new sap.ui.model.Filter("Report",sap.ui.model.FilterOperator.EQ, "W"));
            //                 break;
            //             case "M":
            //                 oBindingParams.filters.push(new sap.ui.model.Filter("Report",sap.ui.model.FilterOperator.EQ, "M"));
            //                 break;
            //             default:
            //                 break;
            //         }
            //     }
            // }
        },
         onExport: function (OEvt) {
            var ofilters = this.buildFiltersForCustomFields();
            
            this.getOdata("/HeaderSet", "ReportModel", ofilters).then((res) => {
              
            var aCols,
                aData,
                oSettings;
            
            if(this.getOwnerComponent().getModel("LocalModel").getProperty("/Report") === 'O'){
                aCols = this.createColumnConfig();
            }else{                
                 aCols = this.createColumnConfigW();
            }
            aData = res;
            
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
            return [
                { property: "week1", label: "Week" },
                { property: "month", label: "Month" },
                { property: "weekdays", label: "Week Days" },
                { property: "shoporder", label: "Shop Order" },
                { property: "product", label: "Product" },
                { property: "prdcategory", label: "Product Category" },
                { property: "size", label: "Size" },
                { property: "prodsch", label: "Production Schedule" },
                { property: "lotsize", label: "IFS Lot size" },
                { property: "suppwastg", label: "% Add including wastages from Supply" },
                { property: "actmixed", label: "ACTUAL MIXED LTRS" },
                { property: "actfilled", label: "ACTUAL FILLED LTRS" },
                { property: "caseprd", label: "CASES PRODUCED" },
                { property: "schvsfilled", label: "% SCHEDULE VS FILLED" },
                { property: "mixvsact", label: "% (Mixed Vs Actual)" },
                { property: "proccplant", label: "PROCESS PLANT (Work Center)" },
                { property: "prdcycle", label: "Production cycle/CIP (qty)" },
                { property: "runningblock", label: "RUNNING BLOCK" },
                { property: "uhtlosslitrs", label: "UHT LOSS, liters" },
                { property: "uhtlossperc", label: "UHT LOSS, %" },
                { property: "prdlosslitrs", label: "Production loss, %" },
                { property: "prdlossperc", label: "Production loss, liters" }

            ];
        },

         createColumnConfigW: function () {
            return [
                    { property: "week1"	, label:	"WEEK"	},
                    { property: "lotsize"	, label:	"IFS Lot size"	},				
                    { property: "actmixed"	, label:	"ACTUAL MIXED LTRS"	},
                    { property: "actfilled"	, label:	"ACTUAL FILLED LTRS"	},				
                    { property: "schvsfilled"	, label:	"% SCHEDULE VS FILLED"	},				
                    { property: "uhtlosslitrs"	, label:	"UHT LOSS, liters"	},				
                    { property: "prdlosslitrs"	, label:	"Production loss, %"	}
            ];
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

            handleValueHelpSearchPlantF4: function (evt) {
                    var sValue = evt.getParameter("value");
                    var oFilter = new Filter("Werks", sap.ui.model.FilterOperator.EQ, sValue);
                    evt.getSource().getBinding("items").filter([oFilter]);
                },

        handleValueHelpSearchMaterial: function (evt) {
                    var sValue = evt.getParameter("value");
                    var oFilter = new Filter("Matnr", sap.ui.model.FilterOperator.EQ, sValue);
                    evt.getSource().getBinding("items").filter([oFilter]);
                },

         handleValueHelpSearchWeek: function (evt) {
                    var sValue = evt.getParameter("value");
                    var oFilter = new Filter("Zweek", sap.ui.model.FilterOperator.EQ, sValue);
                    evt.getSource().getBinding("items").filter([oFilter]);
                },
           handleValueHelpSearchmonth: function (evt) { 
          var sValue = evt.getParameter("value");
           var oFilter = new Filter("month", sap.ui.model.FilterOperator.Contains, sValue);
           evt.getSource().getBinding("items").filter([oFilter]);
           },
        handleValueHelpConfPlantF4: function (evt) {
                    var aContexts = evt.getParameter("selectedContexts");
                    if (aContexts && aContexts.length) {
                        var oval = aContexts.map(function (oContext) {
                            return oContext.getObject().Werks;
                        }).join(", ");
                       
                        this.getView().getModel("LocalModel").setProperty("/Plant", oval);
                        this.getView().getModel("LocalModel").refresh(true);
                    }
                    evt.getSource().getBinding("items").filter([]);
                },


                handleValueHelpConfmonth: function (evt) {
                    var omnth = this.getOwnerComponent().getModel("month1").getData().results;
                    var aContexts = evt.getParameter("selectedContexts");
                    if (aContexts && aContexts.length) {
                        var oval = aContexts.map(function (oContext) {
                            var smonth = oContext.getObject().month.split(" ");
                            if (omnth && omnth.length > 0) {
                                var selCurrRow1 = omnth.filter(function (el) {
                                    return el.month == smonth[0];
                                });
                            }
                            if (selCurrRow1.length > 0) {
                                var sval = selCurrRow1[0].key +" "+ smonth[1];
                            }
                            return sval;
                        }).join(", ");
                       
                    }
                    this.getView().getModel("LocalModel").setProperty("/month", oval);
                        this.getView().getModel("LocalModel").refresh(true);
                    evt.getSource().getBinding("items").filter([]);
                },
         handleValueHelpConfMaterial: function (evt) {
                    var aContexts = evt.getParameter("selectedContexts");
                    if (aContexts && aContexts.length) {
                        var oval = aContexts.map(function (oContext) {
                            return oContext.getObject().Matnr;
                        }).join(", ");
                       
                        this.getView().getModel("LocalModel").setProperty("/Material", oval);
                        this.getView().getModel("LocalModel").refresh(true);
                    }
                    evt.getSource().getBinding("items").filter([]);
                },

         handleValueHelpConfWeek: function (evt) {
                    var aContexts = evt.getParameter("selectedContexts");
                    if (aContexts && aContexts.length) {
                        var oval = aContexts.map(function (oContext) {
                            return oContext.getObject().Zweek;
                        }).join(", ");
                       
                        this.getView().getModel("LocalModel").setProperty("/Week", oval);
                        this.getView().getModel("LocalModel").refresh(true);
                    }
                    evt.getSource().getBinding("items").filter([]);
                },
            onOpenmonth: function (oEvent) {
                    this.monthf4 = null;
                    if (!this.monthf4) {
                        this.monthf4 = sap.ui.xmlfragment("zppdailyreport.fragment.month", this);
                        this.getView().addDependent(this.monthf4);
                    };
                    this.monthf4.open();
                },
            onOpenPlant: function (oEvent) {
                    this.Plantf4 = null;
                    if (!this.Plantf4) {
                        this.Plantf4 = sap.ui.xmlfragment("zppdailyreport.fragment.Plant", this);
                        this.getView().addDependent(this.Plantf4);
                    };
                    this.Plantf4.open();
                },

        onOpenMaterial: function (oEvent) {
                    this.Materialf4 = null;
                    if (!this.Materialf4) {
                        this.Materialf4 = sap.ui.xmlfragment("zppdailyreport.fragment.Material", this);
                        this.getView().addDependent(this.Materialf4);
                    };
                    this.Materialf4.open();
                },

      onOpenWeek: function (oEvent) {
                    this.Weekf4 = null;
                    if (!this.Weekf4) {
                        this.Weekf4 = sap.ui.xmlfragment("zppdailyreport.fragment.Week", this);
                        this.getView().addDependent(this.Weekf4);
                    };
                    this.Weekf4.open();
                },

                onSearch: function (oEvent) { // Fetch a list of filters to apply to the worklist:
                    var sval = this.getOwnerComponent().getModel("LocalModel").getProperty("/Report");
                    if (sval === 'O') {
                        this.getView().getModel("initialvisible").setProperty("/flag", true);
                        this.getView().getModel("initialvisible").setProperty("/flag1", false);
                        this.getView().getModel("initialvisible").refresh(true);

                        this.getOwnerComponent().getModel("monthflag").setProperty("/flag", false);
                        this.getOwnerComponent().getModel("monthflag").setProperty("/flag1", false);
                        this.getOwnerComponent().getModel("monthflag").refresh(true);

                        this.byId("smartTable").rebindTable();
                    }
                    if (sval === 'W') {
                        this.getView().getModel("initialvisible").setProperty("/flag", false);
                        this.getView().getModel("initialvisible").setProperty("/flag1", true);
                        this.getView().getModel("initialvisible").refresh(true);

                        this.getOwnerComponent().getModel("monthflag").setProperty("/flag", false);
                        this.getOwnerComponent().getModel("monthflag").setProperty("/flag1", true);
                        this.getOwnerComponent().getModel("monthflag").refresh(true);
                        this.byId("smartTable1").rebindTable();
                    }
                    if (sval === 'M') {
                        if (this.getView().getModel("LocalModel").getData().month !== null
                            && this.getView().getModel("LocalModel").getData().month !== ''
                            && this.getView().getModel("LocalModel").getData().month !== undefined) {
                            this.getView().getModel("initialvisible").setProperty("/flag", false);
                            this.getView().getModel("initialvisible").setProperty("/flag1", true);
                            this.getView().getModel("initialvisible").refresh(true);

                            this.getOwnerComponent().getModel("monthflag").setProperty("/flag", true);
                            this.getOwnerComponent().getModel("monthflag").setProperty("/flag1", false);
                            this.getOwnerComponent().getModel("monthflag").refresh(true);
                            this.byId("smartTable1").rebindTable();
                        }
                        else {
                            sap.m.MessageBox.error("Month is mandatory");
                            return;
                        }
                    }

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