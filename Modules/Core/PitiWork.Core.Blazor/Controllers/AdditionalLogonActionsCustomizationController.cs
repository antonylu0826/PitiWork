using DevExpress.ExpressApp;
using DevExpress.ExpressApp.Blazor.SystemModule;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;

namespace PitiWork.Core.Blazor.Controllers
{
    public class AdditionalLogonActionsCustomizationController : WindowController
    {
        protected override void OnActivated()
        {
            base.OnActivated();
            AdditionalLogonActionsController additionalLogonActionsController = Frame.GetController<AdditionalLogonActionsController>();
            if (additionalLogonActionsController != null)
            {
                var action = additionalLogonActionsController.Actions.Where(action => action.Id == OpenIdConnectDefaults.AuthenticationScheme).FirstOrDefault();
                if (action != null)
                {
                    action.Caption = "Keycloak";
                    action.ImageName = "Keycloak";
                }
            }
        }
    }
}
