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
				var url = new URL(window.location.href);
				var bp_id = url.searchParams.get("bp_id") + "";

				if (bp_id) {
					var oModel = _.filter(this.getView().getModel().getProperty("/customerInfo"), function (obj) {
						return obj.BP_ID === bp_id;
					});
					this.getView().getModel().setProperty("/custInfo", oModel);

					var oObjectPageLayout = this.byId("ObjectPageLayout");
					oObjectPageLayout.setShowFooter(!oObjectPageLayout.getShowFooter());

					var querymodel;
					var newmodel = this.getView().getModel().getProperty("/Queries");
					//console.log(newmodel);
					querymodel = JSON.parse(JSON.stringify(newmodel));
					querymodel.length = 3;
					querymodel.push({
						"key": "A1#ZA000001#Z110",
						"query": "Other"
					});
					this.getView().getModel().setProperty("/queriesList", querymodel);
					var myArray = newmodel;
					var toRemove = querymodel;

					for (var i = myArray.length - 1; i >= 0; i--) {
						for (var j = 0; j < toRemove.length; j++) {
							if (myArray[i] && (myArray[i].query === toRemove[j].query)) {
								myArray.splice(i, 1);
							}
						}
					}

					this.getView().getModel().setProperty("/filteredQueriesList", myArray);

					var nbaQueryModel;
					var newmodel2 = this.getView().getModel().getProperty("/NBA");
					//console.log(newmodel);
					nbaQueryModel = JSON.parse(JSON.stringify(newmodel2));
					nbaQueryModel.length = 3;
					nbaQueryModel.push({
						"nbaName": "Other"
					});
					this.getView().getModel().setProperty("/nbaList", nbaQueryModel);

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
			var selectedQuery = oEvent.getSource().getSelectedButton().getText();
			var selectedIndex = oEvent.getSource().getSelectedIndex();
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
				console.log(selectedQuery);
			}

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