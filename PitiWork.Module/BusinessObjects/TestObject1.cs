using DevExpress.Persistent.Base;
using DevExpress.Persistent.BaseImpl;
using DevExpress.Xpo;

namespace PitiWork.Module.BusinessObjects
{
    [DefaultClassOptions]
    public class TestObject1 : BaseObject
    {
        public TestObject1(Session session) : base(session) { }


        private string _Name;
        public string Name
        {
            get { return _Name; }
            set { SetPropertyValue<string>(nameof(Name), ref _Name, value); }
        }


        private string _DisplayName;
        public string DisplayName
        {
            get { return _DisplayName; }
            set { SetPropertyValue<string>(nameof(DisplayName), ref _DisplayName, value); }
        }




    }
}
