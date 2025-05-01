# Hướng dẫn cấu hình Email

## Cài đặt

### 1. Cài đặt thư viện
```bash
npm install googleapis nodemailer
```

### 2. Cấu hình file .env
Tạo file `.env` trong thư mục `/backend` với nội dung sau:

```
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
PORT=5000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Email Configuration (Gmail with OAuth2)
EMAIL=your-email@gmail.com
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token

# Backup Email Configuration (In case OAuth2 fails)
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## Cách nhận Google OAuth2 Credentials cho Gmail

### 1. Tạo Project trong Google Cloud Console
- Truy cập [Google Cloud Console](https://console.cloud.google.com/)
- Tạo project mới
- Chọn project vừa tạo

### 2. Cấu hình OAuth consent screen
- Vào API & Services > OAuth consent screen
- Chọn User Type là "External" và ấn "Create"
- Điền thông tin cần thiết
- Trong phần "Scopes", thêm "Gmail API"
- Lưu và tiếp tục

### 3. Tạo OAuth Client ID
- Vào API & Services > Credentials
- Nhấn "Create Credentials" và chọn "OAuth client ID"
- Chọn Application type là "Web application"
- Đặt tên
- Trong phần "Authorized redirect URIs", thêm: `https://developers.google.com/oauthplayground`
- Nhấn "Create"
- Lưu lại thông tin Client ID và Client Secret

### 4. Lấy Refresh Token
- Truy cập [Google OAuth Playground](https://developers.google.com/oauthplayground/)
- Nhấn biểu tượng cài đặt (bánh răng) ở góc phải màn hình
- Tích chọn "Use your own OAuth credentials"
- Điền Client ID và Client Secret
- Đóng cửa sổ settings
- Trong mục "Select & authorize APIs", tìm và chọn `https://mail.google.com/` trong danh sách
- Nhấn "Authorize APIs"
- Đăng nhập vào tài khoản Google và cấp quyền truy cập
- Nhấn "Exchange authorization code for tokens"
- Lưu lại Refresh Token

### 5. Tạo App Password (Cho phương thức dự phòng)
- Đi đến [Google Account Security](https://myaccount.google.com/security)
- Bật xác thực 2 yếu tố nếu chưa được bật
- Sau khi bật xác thực 2 yếu tố, tìm "App passwords" và nhấn vào
- Tạo một app password mới
- Lưu lại mật khẩu này vào biến `EMAIL_PASSWORD` trong file .env

## Ưu ý

Khi triển khai lên server thực tế, hãy đảm bảo các biến môi trường được cấu hình đúng. Với các dịch vụ như Render, Heroku, Vercel, bạn cần cấu hình các biến môi trường trong phần cài đặt của dự án.

Tính năng gửi email sẽ sử dụng OAuth2 làm phương thức xác thực chính, nhưng nếu OAuth2 gặp sự cố, hệ thống sẽ tự động chuyển sang sử dụng App Password làm phương thức dự phòng. 