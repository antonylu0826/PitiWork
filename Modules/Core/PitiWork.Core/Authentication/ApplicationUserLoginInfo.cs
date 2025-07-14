using DevExpress.ExpressApp.ConditionalAppearance;
using DevExpress.ExpressApp.Security;
using DevExpress.Persistent.BaseImpl;
using DevExpress.Xpo;
using System.ComponentModel;

namespace PitiWork.Core.Authentication
{
    [Description("Represents the login information for an application user. " +
    "This class is used to store details about the login provider, the associated user, and the provider-specific user key.")]
    [DeferredDeletion(false)]
    [Persistent("PermissionPolicyUserLoginInfo")]
    public class ApplicationUserLoginInfo : BaseObject, ISecurityUserLoginInfo
    {
        public ApplicationUserLoginInfo(Session session) : base(session) { }

        private string loginProviderName;
        private ApplicationUser user;
        private string providerUserKey;

        [Description("Specifies the name of the login provider (e.g., Google, Facebook, etc.). This property is indexed and uniquely identifies the login provider in combination with the ProviderUserKey.")]
        [Indexed("ProviderUserKey", Unique = true)]
        [Appearance("PasswordProvider", Enabled = false, Criteria = "!(IsNewObject(this)) and LoginProviderName == '" + SecurityDefaults.PasswordAuthentication + "'", Context = "DetailView")]
        public string LoginProviderName
        {
            get { return loginProviderName; }
            set { SetPropertyValue(nameof(LoginProviderName), ref loginProviderName, value); }
        }

        [Description("Specifies the unique key assigned by the login provider for the user. This property is used in conjunction with the LoginProviderName to uniquely identify a user's login information.")]
        [Appearance("PasswordProviderUserKey", Enabled = false, Criteria = "!(IsNewObject(this)) and LoginProviderName == '" + SecurityDefaults.PasswordAuthentication + "'", Context = "DetailView")]
        public string ProviderUserKey
        {
            get { return providerUserKey; }
            set { SetPropertyValue(nameof(ProviderUserKey), ref providerUserKey, value); }
        }

        [Description("References the application user associated with this login information. This property establishes an association between the user and their login details.")]
        [Association("User-LoginInfo")]
        public ApplicationUser User
        {
            get { return user; }
            set { SetPropertyValue(nameof(User), ref user, value); }
        }

        object ISecurityUserLoginInfo.User => User;
    }
}
