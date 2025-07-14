using DevExpress.ExpressApp.Security;
using DevExpress.Persistent.Base;
using DevExpress.Persistent.BaseImpl.PermissionPolicy;
using DevExpress.Xpo;
using System.ComponentModel;

namespace PitiWork.Core.Authentication
{
    [OptimisticLocking(false)]
    [DeferredDeletion(false)]
    [MapInheritance(MapInheritanceType.ParentTable)]
    [DefaultProperty(nameof(DisplayName))]
    [CurrentUserDisplayImage(nameof(Photo))]
    [Description("The ApplicationUser class represents a user in the system. " +
    "It includes properties for user details, authentication, and related metadata.")]
    public class ApplicationUser : PermissionPolicyUser, ISecurityUserWithLoginInfo, ISecurityUserLockout
    {
        public ApplicationUser(Session session) : base(session) { }

        private int accessFailedCount;
        private DateTime lockoutEnd;

        #region DefaultProperty => DisplayName

        private string _DisplayName;

        [Description("The DisplayName property represents the full name of the user. It is used as the default display name in the application.")]
        public string DisplayName
        {
            get { return _DisplayName; }
            set { SetPropertyValue<string>(nameof(DisplayName), ref _DisplayName, value); }
        }

        private string _Email;

        [Description("The Email property stores the email address of the user. It is used for communication and authentication purposes.")]
        public string Email
        {
            get { return _Email; }
            set { SetPropertyValue<string>(nameof(Email), ref _Email, value); }
        }

        [Description("The Photo property stores the user's profile picture as a byte array. It is displayed in the user interface to represent the user visually.")]
        [ImageEditor(ListViewImageEditorMode = ImageEditorMode.PictureEdit,
        DetailViewImageEditorMode = ImageEditorMode.PictureEdit)]
        public byte[] Photo
        {
            get { return GetPropertyValue<byte[]>(nameof(Photo)); }
            set
            {
                SetPropertyValue<byte[]>(nameof(Photo), value);
                //if (!IsLoading)
                //{
                //    if (value != null)
                //    {
                //        Thumbnail = Helpers.ImageHelper.CreateThumb(value, 100, 100, true, true);
                //    }
                //    else
                //    {
                //        Thumbnail = null;
                //    }
                //}
            }
        }

        //private byte[] _Thumbnail;
        //[Browsable(false)]
        //[ImageEditor(ListViewImageEditorMode = ImageEditorMode.PictureEdit,
        //DetailViewImageEditorMode = ImageEditorMode.PictureEdit)]
        //[ModelDefault("AllowEdit", "False")]
        //public byte[] Thumbnail
        //{
        //    get { return _Thumbnail; }
        //    set { SetPropertyValue<byte[]>(nameof(Thumbnail), ref _Thumbnail, value); }
        //}


        protected override void OnSaving()
        {
            base.OnSaving();
            if (string.IsNullOrEmpty(DisplayName))
                DisplayName = UserName;
        }

        #endregion

        [Browsable(false)]
        [Description("The AccessFailedCount property tracks the number of failed login attempts. It is used to enforce account lockout policies.")]
        public int AccessFailedCount
        {
            get { return accessFailedCount; }
            set { SetPropertyValue(nameof(AccessFailedCount), ref accessFailedCount, value); }
        }

        [Browsable(false)]
        [Description("The LockoutEnd property specifies the end time of the user's account lockout period. It is used to temporarily prevent login attempts after multiple failures.")]
        public DateTime LockoutEnd
        {
            get { return lockoutEnd; }
            set { SetPropertyValue(nameof(LockoutEnd), ref lockoutEnd, value); }
        }

        [Browsable(false)]
        [Description("The LoginInfo property contains a collection of login information associated with the user. It is used to manage external login providers and authentication details.")]
        [DevExpress.Xpo.Aggregated, Association("User-LoginInfo")]
        public XPCollection<ApplicationUserLoginInfo> LoginInfo
        {
            get { return GetCollection<ApplicationUserLoginInfo>(nameof(LoginInfo)); }
        }

        IEnumerable<ISecurityUserLoginInfo> IOAuthSecurityUser.UserLogins => LoginInfo.OfType<ISecurityUserLoginInfo>();

        ISecurityUserLoginInfo ISecurityUserWithLoginInfo.CreateUserLoginInfo(string loginProviderName, string providerUserKey)
        {
            ApplicationUserLoginInfo result = new ApplicationUserLoginInfo(Session);
            result.LoginProviderName = loginProviderName;
            result.ProviderUserKey = providerUserKey;
            result.User = this;
            return result;
        }

    }
}
