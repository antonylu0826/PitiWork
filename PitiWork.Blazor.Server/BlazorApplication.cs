using DevExpress.ExpressApp;
using DevExpress.ExpressApp.Blazor;
using Microsoft.AspNetCore.Components;
using PitiWork.Core.Blazor.Controllers;

namespace PitiWork.Blazor.Server;

public class PitiWorkBlazorApplication : BlazorApplication
{
    public PitiWorkBlazorApplication()
    {
        ApplicationName = "PitiWork";
        CheckCompatibilityType = DevExpress.ExpressApp.CheckCompatibilityType.DatabaseSchema;
        DatabaseVersionMismatch += PitiWorkBlazorApplication_DatabaseVersionMismatch;
    }
    protected override void OnSetupStarted()
    {
        base.OnSetupStarted();
#if DEBUG
        if (System.Diagnostics.Debugger.IsAttached && CheckCompatibilityType == CheckCompatibilityType.DatabaseSchema)
        {
            DatabaseUpdateMode = DatabaseUpdateMode.UpdateDatabaseAlways;
        }
#endif
    }
    private void PitiWorkBlazorApplication_DatabaseVersionMismatch(object sender, DatabaseVersionMismatchEventArgs e)
    {
#if EASYTEST
        e.Updater.Update();
        e.Handled = true;
#else
        if (System.Diagnostics.Debugger.IsAttached)
        {
            e.Updater.Update();
            e.Handled = true;
        }
        else
        {
            string message = "The application cannot connect to the specified database, " +
                "because the database doesn't exist, its version is older " +
                "than that of the application or its schema does not match " +
                "the ORM data model structure. To avoid this error, use one " +
                "of the solutions from the https://www.devexpress.com/kb=T367835 KB Article.";

            if (e.CompatibilityError != null && e.CompatibilityError.Exception != null)
            {
                message += "\r\n\r\nInner exception: " + e.CompatibilityError.Exception.Message;
            }
            throw new InvalidOperationException(message);
        }
#endif
    }

    protected override List<Controller> CreateLogonWindowControllers()
    {
        var result = base.CreateLogonWindowControllers();
        result.Add(new AdditionalLogonActionsCustomizationController());
        return result;
    }

    public override void LogOff()
    {
        base.LogOff();
        var navigationManager = this.ServiceProvider.GetRequiredService<NavigationManager>();
        navigationManager.NavigateTo("Account/Logout", forceLoad: true);
    }
}
