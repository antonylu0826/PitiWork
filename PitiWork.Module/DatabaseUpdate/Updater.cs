﻿using DevExpress.ExpressApp;
using DevExpress.ExpressApp.Security;
using DevExpress.ExpressApp.SystemModule;
using DevExpress.ExpressApp.Updating;
using DevExpress.Persistent.Base;
using DevExpress.Persistent.BaseImpl;
using DevExpress.Persistent.BaseImpl.PermissionPolicy;
using Microsoft.Extensions.DependencyInjection;
using PitiWork.Core.Authentication;
using PitiWork.Module.BusinessObjects;

namespace PitiWork.Module.DatabaseUpdate;

public class Updater : ModuleUpdater
{
    public Updater(IObjectSpace objectSpace, Version currentDBVersion) :
        base(objectSpace, currentDBVersion)
    {
    }
    public override void UpdateDatabaseAfterUpdateSchema()
    {
        base.UpdateDatabaseAfterUpdateSchema();
        //string name = "MyName";
        //DomainObject1 theObject = ObjectSpace.FirstOrDefault<DomainObject1>(u => u.Name == name);
        //if(theObject == null) {
        //    theObject = ObjectSpace.CreateObject<DomainObject1>();
        //    theObject.Name = name;
        //}

        // The code below creates users and roles for testing purposes only.
        // In production code, you can create users and assign roles to them automatically, as described in the following help topic:
        // https://docs.devexpress.com/eXpressAppFramework/119064/data-security-and-safety/security-system/authentication
#if !RELEASE
        // If a role doesn't exist in the database, create this role
        var defaultRole = CreateDefaultRole();
        var adminRole = CreateAdminRole();

        ObjectSpace.CommitChanges(); //This line persists created object(s).

        UserManager userManager = ObjectSpace.ServiceProvider.GetRequiredService<UserManager>();

        // If a user named 'User' doesn't exist in the database, create this user
        if (userManager.FindUserByName<ApplicationUser>(ObjectSpace, "User") == null)
        {
            // Set a password if the standard authentication type is used
            string EmptyPassword = "";
            _ = userManager.CreateUser<ApplicationUser>(ObjectSpace, "User", EmptyPassword, (user) =>
            {
                // Add the Users role to the user
                user.Roles.Add(defaultRole);
            });
        }

        // If a user named 'Admin' doesn't exist in the database, create this user
        if (userManager.FindUserByName<ApplicationUser>(ObjectSpace, "Admin") == null)
        {
            // Set a password if the standard authentication type is used
            string EmptyPassword = "";
            _ = userManager.CreateUser<ApplicationUser>(ObjectSpace, "Admin", EmptyPassword, (user) =>
            {
                // Add the Administrators role to the user
                user.Roles.Add(adminRole);
            });
        }

        ObjectSpace.CommitChanges(); //This line persists created object(s).
#endif
    }
    public override void UpdateDatabaseBeforeUpdateSchema()
    {
        base.UpdateDatabaseBeforeUpdateSchema();
        //if(CurrentDBVersion < new Version("1.1.0.0") && CurrentDBVersion > new Version("0.0.0.0")) {
        //    RenameColumn("DomainObject1Table", "OldColumnName", "NewColumnName");
        //}
    }
    private PermissionPolicyRole CreateAdminRole()
    {
        PermissionPolicyRole adminRole = ObjectSpace.FirstOrDefault<PermissionPolicyRole>(r => r.Name == "Administrators");
        if (adminRole == null)
        {
            adminRole = ObjectSpace.CreateObject<PermissionPolicyRole>();
            adminRole.Name = "Administrators";
            adminRole.IsAdministrative = true;
        }
        return adminRole;
    }
    private PermissionPolicyRole CreateDefaultRole()
    {
        PermissionPolicyRole defaultRole = ObjectSpace.FirstOrDefault<PermissionPolicyRole>(role => role.Name == "Default");
        if (defaultRole == null)
        {
            defaultRole = ObjectSpace.CreateObject<PermissionPolicyRole>();
            defaultRole.Name = "Default";

            defaultRole.AddObjectPermissionFromLambda<ApplicationUser>(SecurityOperations.Read, cm => cm.Oid == (Guid)CurrentUserIdOperator.CurrentUserId(), SecurityPermissionState.Allow);
            defaultRole.AddNavigationPermission(@"Application/NavigationItems/Items/Default/Items/MyDetails", SecurityPermissionState.Allow);
            defaultRole.AddMemberPermissionFromLambda<ApplicationUser>(SecurityOperations.Write, "ChangePasswordOnFirstLogon", cm => cm.Oid == (Guid)CurrentUserIdOperator.CurrentUserId(), SecurityPermissionState.Allow);
            defaultRole.AddMemberPermissionFromLambda<ApplicationUser>(SecurityOperations.Write, "StoredPassword", cm => cm.Oid == (Guid)CurrentUserIdOperator.CurrentUserId(), SecurityPermissionState.Allow);
            defaultRole.AddTypePermissionsRecursively<PermissionPolicyRole>(SecurityOperations.Read, SecurityPermissionState.Deny);
            defaultRole.AddObjectPermission<ModelDifference>(SecurityOperations.ReadWriteAccess, "UserId = ToStr(CurrentUserId())", SecurityPermissionState.Allow);
            defaultRole.AddObjectPermission<ModelDifferenceAspect>(SecurityOperations.ReadWriteAccess, "Owner.UserId = ToStr(CurrentUserId())", SecurityPermissionState.Allow);
            defaultRole.AddTypePermissionsRecursively<ModelDifference>(SecurityOperations.Create, SecurityPermissionState.Allow);
            defaultRole.AddTypePermissionsRecursively<ModelDifferenceAspect>(SecurityOperations.Create, SecurityPermissionState.Allow);

            defaultRole.AddObjectPermission<PermissionPolicyUser>(SecurityOperations.ReadOnlyAccess, "[Oid] = CurrentUserId()", SecurityPermissionState.Allow);

            // PersonalCalendar permissions
            defaultRole.AddNavigationPermission(@"Application/NavigationItems/Items/Default/Items/PersonalCalendar_ListView", SecurityPermissionState.Allow);
            defaultRole.AddObjectPermissionFromLambda<PersonalCalendar>(SecurityOperations.Read, pc => pc.Owner.Oid == (Guid)CurrentUserIdOperator.CurrentUserId(), SecurityPermissionState.Allow);
            defaultRole.AddObjectPermissionFromLambda<PersonalCalendar>(SecurityOperations.Write, pc => pc.Owner.Oid == (Guid)CurrentUserIdOperator.CurrentUserId(), SecurityPermissionState.Allow);
            defaultRole.AddObjectPermissionFromLambda<PersonalCalendar>(SecurityOperations.Delete, pc => pc.Owner.Oid == (Guid)CurrentUserIdOperator.CurrentUserId(), SecurityPermissionState.Allow);
            defaultRole.AddTypePermissionsRecursively<PersonalCalendar>(SecurityOperations.Create, SecurityPermissionState.Allow);
        }
        return defaultRole;
    }
}
