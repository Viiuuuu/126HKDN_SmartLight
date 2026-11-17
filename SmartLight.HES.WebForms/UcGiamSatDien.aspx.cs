using System;
using System.Web.UI;

namespace SmartLight.HES.WebForms
{
    public partial class UcGiamSatDien : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // Tự động chuyển hướng sang trang Giám sát thông số điện SCADA chính thức
            Response.Redirect("~/UcGiamSatThongSoDien.aspx", true);
        }
    }
}

