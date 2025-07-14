using DevExpress.ExpressApp;
using DevExpress.ExpressApp.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PitiWork.Core.Authentication
{
    public class KeycloakAuthorizationService
    {
        readonly HttpClient HttpClient;
        readonly IServiceProvider ServiceProvider;
        readonly IConfiguration Configuration;

        public KeycloakAuthorizationService(IServiceProvider serviceProvider, HttpClient httpClient, IConfiguration configuration)
        {
            ServiceProvider = serviceProvider;
            HttpClient = httpClient;
            Configuration = configuration;
        }

        public async Task<TokenResponse> LoginAsync(string username, string password)
        {
            var tokenEndpoint = $"{Configuration["Keycloak:Authority"]}/protocol/openid-connect/token";

            var requestBody = new Dictionary<string, string>
            {
                { "grant_type", "password" },
                { "client_id", Configuration["Keycloak:ClientId"] },
                { "client_secret", Configuration["Keycloak:ClientSecret"] },
                { "username", username },
                { "password", password }
            };

            var content = new FormUrlEncodedContent(requestBody);
            var response = await HttpClient.PostAsync(tokenEndpoint, content);
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var tokenResult = JsonSerializer.Deserialize<TokenResponse>(responseContent);

                //Generate ClaimPrincipal
                var token = new JwtSecurityTokenHandler().ReadJwtToken(tokenResult.AccessToken);
                var identity = new ClaimsPrincipal(new ClaimsIdentity(token.Claims, "Password"));

                IEnumerable<IAuthenticationProviderV2> services = ServiceProvider.GetServices<IAuthenticationProviderV2>();
                ISecurityStrategyBase requiredService2 = ServiceProvider.GetRequiredService<ISecurityStrategyBase>();
                INonSecuredObjectSpaceFactory requiredService3 = ServiceProvider.GetRequiredService<INonSecuredObjectSpaceFactory>();
                var authenticationProviderV = services.OfType<KeycloakAuthenticationProvider>().FirstOrDefault();
                if (authenticationProviderV == null)
                {
                    throw new ArgumentException("There are no registered authentication providers that implement the " + typeof(KeycloakAuthenticationProvider).FullName + " interface");
                }

                using IObjectSpace objectSpace = requiredService3.CreateNonSecuredObjectSpace(requiredService2.UserType);

                authenticationProviderV.Authenticate(objectSpace, identity);

                return tokenResult!;
            }

            throw new Exception("failed");
        }
    }

    public class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; }
    }


}
