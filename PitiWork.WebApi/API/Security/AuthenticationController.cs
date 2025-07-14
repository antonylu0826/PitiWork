using DevExpress.ExpressApp;
using DevExpress.ExpressApp.Security;
using DevExpress.ExpressApp.Security.Authentication.ClientServer;
using Microsoft.AspNetCore.Mvc;
using PitiWork.Core.Authentication;
using Swashbuckle.AspNetCore.Annotations;

namespace PitiWork.WebApi.JWT;

[ApiController]
[Route("api/[controller]")]
public class AuthenticationController : ControllerBase
{
    readonly IAuthenticationTokenProvider tokenProvider;
    readonly KeycloakAuthorizationService keycloakAuthorizationService;
    public AuthenticationController(IAuthenticationTokenProvider tokenProvider, KeycloakAuthorizationService keycloakAuthService = null)
    {
        this.tokenProvider = tokenProvider;
        this.keycloakAuthorizationService = keycloakAuthService;
    }

    [HttpPost("KeycloakAuthenticate")]
    [SwaggerOperation("Checks if the user with the specified logon parameters exists in the database. If it does, authenticates this user.", "Refer to the following help topic for more information on authentication methods in the XAF Security System: <a href='https://docs.devexpress.com/eXpressAppFramework/119064/data-security-and-safety/security-system/authentication'>Authentication</a>.")]
    public async Task<IActionResult> KeycloakAuthenticate(
        [FromBody]
        [SwaggerRequestBody(@"For example: <br /> { ""userName"": ""Admin"", ""password"": """" }")]
        AuthenticationStandardLogonParameters logonParameters
    )
    {
        try
        {
            var token = await keycloakAuthorizationService.LoginAsync(logonParameters.UserName, logonParameters.Password);
            return Ok(token.AccessToken);
        }
        catch (AuthenticationException ex)
        {
            return Unauthorized(ex.GetJson());
        }
    }
}
