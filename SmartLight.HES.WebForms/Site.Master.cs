using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace SmartLight.HES.WebForms
{
    public partial class SiteMaster : MasterPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            Response.ContentEncoding = System.Text.Encoding.UTF8;
            Response.Charset = "utf-8";
        }

        public string IsActive(string page)
        {
            string current = Request.Url.AbsolutePath;
            if (page.Equals("UcTongQuan", StringComparison.OrdinalIgnoreCase) || page.Equals("Default", StringComparison.OrdinalIgnoreCase))
            {
                if (current.EndsWith("/") ||
                    current.EndsWith("/Default", StringComparison.OrdinalIgnoreCase) ||
                    current.EndsWith("/Default.aspx", StringComparison.OrdinalIgnoreCase) ||
                    current.EndsWith("/UcTongQuan", StringComparison.OrdinalIgnoreCase) ||
                    current.EndsWith("/UcTongQuan.aspx", StringComparison.OrdinalIgnoreCase))
                {
                    return "active";
                }
            }
            else if (current.IndexOf(page, StringComparison.OrdinalIgnoreCase) >= 0)
            {
                return "active";
            }
            return "";
        }
    }
}