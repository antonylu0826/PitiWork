﻿using DevExpress.ExpressApp;
using DevExpress.ExpressApp.Updating;
using DevExpress.Persistent.BaseImpl;
using System.ComponentModel;

namespace PitiWork.Blazor.Server;

[ToolboxItemFilter("Xaf.Platform.Blazor")]
// For more typical usage scenarios, be sure to check out https://docs.devexpress.com/eXpressAppFramework/DevExpress.ExpressApp.ModuleBase.
public sealed class PitiWorkBlazorModule : ModuleBase
{
    //private void Application_CreateCustomModelDifferenceStore(object sender, CreateCustomModelDifferenceStoreEventArgs e) {
    //    e.Store = new ModelDifferenceDbStore((XafApplication)sender, typeof(ModelDifference), true, "Blazor");
    //    e.Handled = true;
    //}
    private void Application_CreateCustomUserModelDifferenceStore(object sender, CreateCustomModelDifferenceStoreEventArgs e)
    {
        e.Store = new ModelDifferenceDbStore((XafApplication)sender, typeof(ModelDifference), false, "Blazor");
        e.Handled = true;
    }
    public PitiWorkBlazorModule()
    {
        RequiredModuleTypes.Add(typeof(DevExpress.ExpressApp.Scheduler.Blazor.SchedulerBlazorModule));

        RequiredModuleTypes.Add(typeof(PitiWork.Core.Blazor.CoreBlazorModule));
    }
    public override IEnumerable<ModuleUpdater> GetModuleUpdaters(IObjectSpace objectSpace, Version versionFromDB)
    {
        return ModuleUpdater.EmptyModuleUpdaters;
    }
    public override void Setup(XafApplication application)
    {
        base.Setup(application);
        // Uncomment this code to store the shared model differences (administrator settings in Model.XAFML) in the database.
        // For more information, refer to the following topic: https://docs.devexpress.com/eXpressAppFramework/113698/
        //application.CreateCustomModelDifferenceStore += Application_CreateCustomModelDifferenceStore;
        application.CreateCustomUserModelDifferenceStore += Application_CreateCustomUserModelDifferenceStore;
    }
}
