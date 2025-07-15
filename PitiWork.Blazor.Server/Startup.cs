﻿using DevExpress.ExpressApp.ApplicationBuilder;
using DevExpress.ExpressApp.Blazor.ApplicationBuilder;
using DevExpress.ExpressApp.Blazor.Services;
using DevExpress.ExpressApp.Security;
using DevExpress.Persistent.BaseImpl.PermissionPolicy;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Components.Server.Circuits;
using PitiWork.Blazor.Server.Services;
using PitiWork.Core.Authentication;

namespace PitiWork.Blazor.Server;

public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton(typeof(Microsoft.AspNetCore.SignalR.HubConnectionHandler<>), typeof(ProxyHubConnectionHandler<>));

        services.AddRazorPages();
        services.AddServerSideBlazor();
        services.AddHttpContextAccessor();
        services.AddScoped<CircuitHandler, CircuitHandlerProxy>();
        services.AddXaf(Configuration, builder =>
        {
            builder.UseApplication<PitiWorkBlazorApplication>();
            builder.Modules
                .AddConditionalAppearance()
                .AddValidation(options =>
                {
                    options.AllowValidationDetailsAccess = false;
                })
                .Add<PitiWork.Module.PitiWorkModule>()
                .Add<PitiWorkBlazorModule>()
                .AddScheduler();
            builder.ObjectSpaceProviders
                .AddSecuredXpo((serviceProvider, options) =>
                {
                    string connectionString = null;
                    if (Configuration.GetConnectionString("ConnectionString") != null)
                    {
                        connectionString = Configuration.GetConnectionString("ConnectionString");
                    }
#if EASYTEST
                    if(Configuration.GetConnectionString("EasyTestConnectionString") != null) {
                        connectionString = Configuration.GetConnectionString("EasyTestConnectionString");
                    }
#endif
                    ArgumentNullException.ThrowIfNull(connectionString);
                    options.ConnectionString = connectionString;
                    options.ThreadSafe = true;
                    options.UseSharedDataStoreProvider = true;
                })
                .AddNonPersistent();
            builder.Security
                .UseIntegratedMode(options =>
                {
                    options.Lockout.Enabled = true;

                    options.RoleType = typeof(PermissionPolicyRole);
                    // ApplicationUser descends from PermissionPolicyUser and supports the OAuth authentication. For more information, refer to the following topic: https://docs.devexpress.com/eXpressAppFramework/402197
                    // If your application uses PermissionPolicyUser or a custom user type, set the UserType property as follows:
                    options.UserType = typeof(ApplicationUser);
                    // ApplicationUserLoginInfo is only necessary for applications that use the ApplicationUser user type.
                    // If you use PermissionPolicyUser or a custom user type, comment out the following line:
                    options.UserLoginInfoType = typeof(ApplicationUserLoginInfo);
                    options.UseXpoPermissionsCaching();
                    options.Events.OnSecurityStrategyCreated += securityStrategy =>
                    {
                        // Use the 'PermissionsReloadMode.NoCache' option to load the most recent permissions from the database once
                        // for every Session instance when secured data is accessed through this instance for the first time.
                        // Use the 'PermissionsReloadMode.CacheOnFirstAccess' option to reduce the number of database queries.
                        // In this case, permission requests are loaded and cached when secured data is accessed for the first time
                        // and used until the current user logs out.
                        // See the following article for more details: https://docs.devexpress.com/eXpressAppFramework/DevExpress.ExpressApp.Security.SecurityStrategy.PermissionsReloadMode.
                        ((SecurityStrategy)securityStrategy).PermissionsReloadMode = PermissionsReloadMode.NoCache;
                    };
                })
                .AddPasswordAuthentication(options =>
                {
                    options.IsSupportChangePassword = true;
                })
                .AddAuthenticationProvider<KeycloakAuthenticationProvider>();
        });
        var authentication = services.AddAuthentication(options =>
        {
            options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        });
        authentication.AddCookie(options =>
        {
            options.LoginPath = "/LoginPage";
        });
        authentication.AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, "Keycloak", options =>
        {
            options.Authority = Configuration["Keycloak:Authority"];
            options.ClientId = Configuration["Keycloak:ClientId"];
            options.ClientSecret = Configuration["Keycloak:ClientSecret"];
            options.SaveTokens = true;
            options.RequireHttpsMetadata = false;

            //https://stackoverflow.com/questions/74052650
            options.SignOutScheme = OpenIdConnectDefaults.AuthenticationScheme;

            //https://stackoverflow.com/questions/74327614
            options.Scope.Add("openid");

            options.Events.OnRedirectToIdentityProvider = async context =>
            {
                context.ProtocolMessage.RedirectUri = context.ProtocolMessage.RedirectUri.Replace("http:", "https:");
                await Task.FromResult(0);
            };
        });
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseExceptionHandler("/Error");
            // The default HSTS value is 30 days. To change this for production scenarios, see: https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }
        app.UseHttpsRedirection();
        app.UseRequestLocalization();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseXaf();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapXafEndpoints();
            endpoints.MapBlazorHub();
            endpoints.MapFallbackToPage("/_Host");

            endpoints.MapGet("/Account/Logout", async context =>
            {
                if (context.User.Identity.AuthenticationType == "AuthenticationTypes.Federation")
                    await context.SignOutAsync(OpenIdConnectDefaults.AuthenticationScheme);

                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme, new AuthenticationProperties
                {
                    RedirectUri = "/"
                });
            }).RequireAuthorization();

            endpoints.MapControllers();
        });
    }
}
