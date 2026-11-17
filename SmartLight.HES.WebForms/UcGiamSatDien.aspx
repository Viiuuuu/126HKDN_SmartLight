<%@ Page Title="Giám sát thông số điện" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="UcGiamSatDien.aspx.cs" Inherits="SmartLight.HES.WebForms.UcGiamSatDien" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <div style="padding: 40px 20px; text-align: center; background: #FFFFFF; border-radius: 8px; margin: 20px 0; border: 1px solid #E2E8F0;">
        <h3 style="color: #073B63; font-size: 18px; margin-bottom: 10px;">ĐANG CHUYỂN HƯỚNG ĐẾN TRANG GIÁM SÁT THÔNG SỐ ĐIỆN</h3>
        <p style="color: #64748B; font-size: 14px;">Hệ thống đang chuyển sang màn hình SCADA trực tuyến. Nếu trình duyệt không tự chuyển, vui lòng <a href="UcGiamSatThongSoDien.aspx" style="color: #2563EB; font-weight: 600;">bấm vào đây</a>.</p>
    </div>
    <script type="text/javascript">
        window.location.replace("UcGiamSatThongSoDien.aspx");
    </script>
</asp:Content>
