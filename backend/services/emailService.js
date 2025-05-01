const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// Cấu hình OAuth2
const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.log("**** Error getting access token: ", err);
          reject(err);
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
      }
    });

    return transporter;
  } catch (error) {
    console.log("Error creating transporter: ", error);
    // Sử dụng transporter dự phòng nếu không thể tạo OAuth2
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

// Gửi email xác nhận đơn hàng
exports.sendOrderConfirmationEmail = async (orderDetails, userEmail) => {
  try {
    const transporter = await createTransporter();
    
    // Tạo bảng mua hàng
    let orderItemsHtml = '';
    orderDetails.orderItems.forEach(item => {
      orderItemsHtml += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: auto;">
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.price.toLocaleString('vi-VN')} VND</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${(item.price * item.quantity).toLocaleString('vi-VN')} VND</td>
        </tr>
      `;
    });
    
    // Gửi email
    const mailOptions = {
      from: `"Shop" <${process.env.EMAIL}>`,
      to: userEmail,
      subject: `Xác nhận đơn hàng #${orderDetails._id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Xác nhận đơn hàng</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #4CAF50;">
            <h1 style="color: #4CAF50; margin: 0;">Đơn hàng của bạn đã được xác nhận!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Xin chào <b>${orderDetails.shippingInfo.fullName}</b>,</p>
            <p>Cảm ơn bạn đã đặt hàng. Chúng tôi rất vui được phục vụ bạn!</p>
            <p>Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3 style="margin-top: 0;">Thông tin đơn hàng:</h3>
              <p><strong>Mã đơn hàng:</strong> ${orderDetails._id}</p>
              <p><strong>Ngày đặt hàng:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString('vi-VN')}</p>
              <p><strong>Phương thức thanh toán:</strong> ${orderDetails.paymentInfo.method}</p>
              <p><strong>Trạng thái thanh toán:</strong> ${orderDetails.paymentInfo.status}</p>
              <p><strong>Trạng thái đơn hàng:</strong> ${orderDetails.orderStatus}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3>Chi tiết đơn hàng:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; text-align: left;">Hình ảnh</th>
                    <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                    <th style="padding: 10px; text-align: left;">Số lượng</th>
                    <th style="padding: 10px; text-align: left;">Đơn giá</th>
                    <th style="padding: 10px; text-align: left;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0;">
              <h3>Tóm tắt đơn hàng:</h3>
              <p><strong>Tạm tính:</strong> ${orderDetails.itemsPrice.toLocaleString('vi-VN')} VND</p>
              <p><strong>Thuế:</strong> ${orderDetails.taxPrice.toLocaleString('vi-VN')} VND</p>
              <p><strong>Phí vận chuyển:</strong> ${orderDetails.shippingPrice === 0 ? 'Miễn phí' : orderDetails.shippingPrice.toLocaleString('vi-VN') + ' VND'}</p>
              <p style="font-size: 18px; font-weight: bold; color: #4CAF50;">
                <strong>Tổng cộng:</strong> ${orderDetails.totalPrice.toLocaleString('vi-VN')} VND
              </p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3>Thông tin giao hàng:</h3>
              <p><strong>Người nhận:</strong> ${orderDetails.shippingInfo.fullName}</p>
              <p><strong>Địa chỉ:</strong> ${orderDetails.shippingInfo.address}, ${orderDetails.shippingInfo.city}</p>
              <p><strong>Số điện thoại:</strong> ${orderDetails.shippingInfo.phoneNo}</p>
            </div>
            
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
            <p>Trân trọng,<br>Đội ngũ hỗ trợ khách hàng</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd;">
            <p>© 2023 Shop. Tất cả các quyền được bảo lưu.</p>
            <p>Email này được gửi từ hệ thống tự động. Xin đừng trả lời email này.</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + result.response);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
}; 