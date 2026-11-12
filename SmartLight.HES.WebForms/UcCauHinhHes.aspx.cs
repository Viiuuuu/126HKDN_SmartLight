using System;
using System.Web.UI;

namespace SmartLight.HES.WebForms
{
    public partial class UcCauHinhHes : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            Response.ContentEncoding = System.Text.Encoding.UTF8;
            Response.Charset = "utf-8";

            if (!IsPostBack)
            {
                // Khởi tạo trang Cấu hình hệ thống HES SCADA
            }
        }
    }
}

