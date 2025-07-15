using DevExpress.Data.Filtering;
using DevExpress.ExpressApp.Model;
using DevExpress.Persistent.Base;
using DevExpress.Persistent.BaseImpl;
using DevExpress.Xpo;
using PitiWork.Core.Authentication;
using System.ComponentModel;

namespace PitiWork.Module.BusinessObjects
{
    [DefaultProperty(nameof(Subject))]
    [DefaultClassOptions]
    public class PersonalCalendar : Event
    {
        public PersonalCalendar(Session session) : base(session) { }

        public override void AfterConstruction()
        {
            base.AfterConstruction();
            Owner = Session.FindObject<ApplicationUser>(CriteriaOperator.Parse("Oid = CurrentUserId()"));
        }

        private ApplicationUser _Owner;
        [VisibleInDetailView(false)]
        [VisibleInListView(false)]
        [ModelDefault("AllowEdit", "False")]
        public ApplicationUser Owner
        {
            get { return _Owner; }
            set { SetPropertyValue(nameof(Owner), ref _Owner, value); }
        }
    }
}