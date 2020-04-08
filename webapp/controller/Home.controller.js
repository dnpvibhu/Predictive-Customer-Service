sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageBox",
	"com/wipro/ccs/js/underscore"
], function (Controller, JSONModel, MessageToast, DateFormat, MessageBox, _) {
	"use strict";

	return Controller.extend("com.wipro.ccs.controller.Home", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Home").attachPatternMatched(function (oEvent) {

				//Intiating URL Parameters
				var url = new URL(window.location.href);
				var bp_id = url.searchParams.get("bp_id") + "";
				var cat1 = url.searchParams.get("cat1") + "";
				var cat2 = url.searchParams.get("cat2") + "";
				var cat3 = url.searchParams.get("cat3") + "";
				var cat4 = url.searchParams.get("cat4") + "";
				var selCat = url.searchParams.get("sel_cat") + "";

				this.getView().getModel().setProperty("/NBAName", "Next Best Action");

				if (bp_id) {

					//Creating Array of URL Parameters 
					var urlParameters = [cat1, cat2, cat3];
					var newKeyValuePair = [];
					var KVWord = [];
					var KVItem;
					selCat = selCat.split(':', 2);

					for (var index = 0; index < urlParameters.length; index++) {
						var theString = urlParameters[index];
						var parts = theString.split(':', 2);
						var theKey = parts[0];
						var theValue = parts[1];
						KVWord.push(theValue);
						KVItem = {
							"key": theKey,
							"query": theValue
						};
						newKeyValuePair.push(KVItem);
					}

					//Creating model for Radio Button Group
					var querymodel = JSON.parse(JSON.stringify(newKeyValuePair));
					var newmodel = this.getView().getModel().getProperty("/Queries");
					// querymodel = JSON.parse(JSON.stringify(newmodel));
					// querymodel.length = 3;
					querymodel.push({
						"key": "other",
						"query": "Other"
					});
					this.getView().getModel().setProperty("/queriesList", querymodel);
					this.getView().byId("queryRadioButtonGroup").setSelectedIndex(KVWord.indexOf(selCat[1]));
					this.ajaxCall(selCat[1]);

					//Removing duplicate enteries to show in pop-up
					var myArray = JSON.parse(JSON.stringify(newmodel));
					var toRemove = querymodel;
					for (var i = myArray.length - 1; i >= 0; i--) {
						for (var j = 0; j < toRemove.length; j++) {
							if (myArray[i] && (myArray[i].query === toRemove[j].query)) {
								myArray.splice(i, 1);
							}
						}
					}
					this.getView().getModel().setProperty("/filteredQueriesList", myArray);

					//Fetching user data from JSON Model
					var oModel = _.filter(this.getView().getModel().getProperty("/customerInfo"), function (obj) {
						return obj.BP_ID === bp_id;
					});
					this.getView().getModel().setProperty("/custInfo", oModel);

					//Enabling footer (Have to remove)
					var oObjectPageLayout = this.byId("ObjectPageLayout");
					oObjectPageLayout.setShowFooter(!oObjectPageLayout.getShowFooter());

					//Creating model for NBA Radio Buttons
					var nbaQueryModel;
					var newmodel2 = this.getView().getModel().getProperty("/NBA");
					nbaQueryModel = JSON.parse(JSON.stringify(newmodel2));
					nbaQueryModel.length = 3;
					nbaQueryModel.push({
						"nbaName": "Other"
					});
					this.getView().getModel().setProperty("/nbaList", {});

					//Creating filtered model for pop up RBG
					var myUniqueNbaArray = newmodel2;
					var toRemoveDuplicateNBA = nbaQueryModel;
					for (var i = myUniqueNbaArray.length - 1; i >= 0; i--) {
						for (var j = 0; j < toRemoveDuplicateNBA.length; j++) {
							if (myUniqueNbaArray[i] && (myUniqueNbaArray[i].nbaName === toRemoveDuplicateNBA[j].nbaName)) {
								myUniqueNbaArray.splice(i, 1);
							}
						}
					}
					this.getView().getModel().setProperty("/filteredNBAList", myUniqueNbaArray);
					console.log(oModel);
				} else {
					MessageToast.show("Invalid");
				}

			}, this);
		},

		onQuerySelect: function (oEvent) {
			var selectedIndex = oEvent.getSource().getSelectedIndex();
			var selectedQuery = oEvent.getSource().getSelectedButton().getText();
			if (selectedIndex === 3) {
				this.getView().setBusy(true);
				var that = com.wipro.ccs.this;
				jQuery.sap.delayedCall(2000, this, function () {
					this.getView().setBusy(false);
					if (!this.queryDialog) {
						this.queryDialog = sap.ui.xmlfragment("com.wipro.ccs.fragments.QueriesFragment", this);
						this.getView().addDependent(this.queryDialog);
					}
					this.queryDialog.open();
				});
			} else {
				this.ajaxCall(selectedQuery);
			}
		},

		//Making functon for Ajax Call
		ajaxCall: function (selectedQuerys) {
			var selectedQuery = selectedQuerys.toUpperCase();
			var oModelResonText = _.filter(this.getView().getModel().getProperty("/Mapping"), function (obj) {
				return obj.ReasonText === selectedQuery;
			});
			var reason = oModelResonText[0].NBA;
			this.getView().getModel().setProperty("/NBAName", "Next Best Action - " + reason);
			var settings = {
				'cache': false,
				'dataType': "json",
				"async": true,
				"crossDomain": true,
				"contentType": "application/json",
				"data": JSON.stringify([{
					"__type__": "body",
					"Onit": "m_yes, d_yes, e_yes, o_no",
					"Asked": "m_yes, d_yes, e_yes, o_no"
				}]),
				"url": "/BusinessRules/TW_businessrules_v4/BR_RS_DT",
				"method": "POST",
				"processData": false,
				"headers": {
					"accept": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Postman-Token": "bc3c98f0-5ae1-4d29-a4d7-881376f9d38a",
					"Cache-Control": "no-cache"
						//"Authorization": oauth
				}
			};
			this.getView().setBusy(true);
			var responseArray = [];
			var res;
			$.ajax(settings).done(function (response) {
				if (response.length) {
					for (var i = 0; i < response.length; i++) {
						res = {
							"nbaName": response[i].NBA
						};
						responseArray.push(res);
					}
					this.getView().getModel().setProperty("/nbaList", responseArray);
					this.getView().setBusy(false);
				} else {
					this.getView().setBusy(false);
				}
				// this.getView().getModel().setProperty("/sapResponse", response[0].NBA);
			}.bind(this));
		},

		onNBASelect: function (oEvent) {
			var selectedQuery = oEvent.getSource().getSelectedButton().getText();
			var selectedIndex = oEvent.getSource().getSelectedIndex();
			if (selectedIndex === 3) {
				this.getView().setBusy(true);
				var that = com.wipro.ccs.this;
				jQuery.sap.delayedCall(2000, this, function () {
					this.getView().setBusy(false);
					if (!this.nbaDialog) {
						this.nbaDialog = sap.ui.xmlfragment("com.wipro.ccs.fragments.NBAFragment", this);
						this.getView().addDependent(this.nbaDialog);
					}
					this.nbaDialog.open();
				});
			} else {
				console.log(selectedQuery);
			}
		},

		onQueryFragmentSelect: function (oEvent) {
			var selectedFragmentQuery = oEvent.getSource().getSelectedButton().getText();
			var selectedFragmentIndex = oEvent.getSource().getSelectedIndex();
			var key = this.getView().getModel().getProperty("/Queries/" + selectedFragmentIndex + "/key");

			if (selectedFragmentQuery !== undefined) {
				var newModel = this.getView().getModel().getProperty("/queriesList");
				newModel.pop();
				newModel.push({
					"key": key,
					"query": selectedFragmentQuery
				});
				this.getView().getModel().setProperty("/queriesList", newModel);
			}
			this.ajaxCall(selectedFragmentQuery);
			this.queryDialog.close();

		},

		onNBAFragmentSelect: function (oEvent) {
			var selectedFragmentQuery = oEvent.getSource().getSelectedButton().getText();
			var selectedFragmentIndex = oEvent.getSource().getSelectedIndex();
			var key = this.getView().getModel().getProperty("/NBA/" + selectedFragmentIndex + "/key");

			if (selectedFragmentQuery !== undefined) {
				var newModel = this.getView().getModel().getProperty("/nbaList");
				newModel.pop();
				newModel.push({
					"nbaName": selectedFragmentQuery
				});
				this.getView().getModel().setProperty("/nbaList", newModel);
			}

			this.nbaDialog.close();

		},

		handleDialogCancelButton: function (oEvent) {
			this.queryDialog.close();
		},

		handleDialogCancelButton2: function (oEvent) {
			this.nbaDialog.close();
		}

		//Above this
	});
});