## Business and Report

# Trò Chơi Bài Cào

![Preview](link_to_preview_image.png)

## Mô Tả

Đây là một ứng dụng trò chơi bài cào trực tuyến đơn giản được xây dựng bằng React, TypeScript và sử dụng API để chơi bài cào. Trò chơi bao gồm các chức năng cơ bản như trộn bài, chia bài, trả kết quả và khởi tạo lại trò chơi.

## Chức Năng Cơ Bản

- **Bàn Chơi (Game Board)**:

  - Hiển thị thông tin của người chơi.
  - Hiển thị số tiền (Coins).
  - Hiển thị điểm của người chơi (Point of 3 Cards).
  - Hiển thị lá bài khi nhận.
  - Hiển thị số lượng lá bài còn lại trong Deck Cards.
  - Hiển thị thông tin vị trí của 4 người chơi.

- **Nút Chức Năng**:

  - Nút Shuffle (Trộn bài).
  - Nút Draw (Chia bài).
  - Nút Reveal (Trả kết quả).
  - Nút Reset (Khởi tạo lại trò chơi).

- **Luật Chơi**:
  - Tạo một bộ bài tây 52 lá.
  - Chia bài cho người chơi (mỗi người 3 lá).
  - Tính điểm của người chơi dựa trên 3 lá bài.
  - Xác định người thắng và người thua.
  - Trừ tiền người chơi thua.

## Kế Hoạch Làm Việc

1. **Thiết Kế Giao Diện**:

   - Thiết kế giao diện bàn chơi với các phần hiển thị thông tin và nút chức năng.
   - Xây dựng các component React cho người chơi và các phần tử giao diện.

2. **Quản lý State và Logic**:

   - Xác định cách lưu trữ trạng thái trò chơi (state).
   - Xây dựng reducer để xử lý các hành động như Shuffle, Draw, Reveal, Reset.
   - Sử dụng Context API để chia sẻ state trong ứng dụng.

3. **Kết Nối với API**:

   - Sử dụng Axios hoặc Fetch để kết nối với [API](https://deckofcardsapi.com) để lấy thông tin về lá bài.

4. **Xử Lý Luật Chơi**:

   - Tạo hàm tính điểm của người chơi dựa trên 3 lá bài.
   - Xác định người thắng và người thua sau khi Reveal.
   - Trừ tiền từ người chơi thua.

5. **Kết Hợp Giao Diện và Logic**:

   - Lắng nghe các sự kiện như nhấn nút để gọi các hàm xử lý tương ứng.
   - Cập nhật giao diện khi có sự thay đổi trong state.

6. **Kiểm Tra Lỗi**:

   - Xác định và xử lý các lỗi có thể xảy ra, chẳng hạn như không đủ lá bài.

7. **Tích Hợp Các Tính Năng Bổ Sung** (tùy chọn):

   - Thêm tính năng chơi nhiều ván liên tiếp.
   - Thêm tính năng đặt cược.
   - Thêm tính năng lưu trạng thái trò chơi.

8. **Kiểm Tra và Debug**:

   - Kiểm tra toàn bộ ứng dụng để đảm bảo hoạt động ổn định.
   - Debug và sửa lỗi nếu cần.

9. **Triển Khai Ứng Dụng**:

   - Triển khai ứng dụng lên một môi trường thực tế (ví dụ: hosting trên web).

10. **Kiểm Tra và Cải Tiến**:
    - Thu thập ý kiến từ người dùng và tiến hành cải tiến dự án dựa trên phản hồi.

## Cài Đặt và Sử Dụng

1. Clone repository này: `git clone https://github.com/WonnDev/BaiCaoApp`
2. Di chuyển vào thư mục dự án: `cd BaiCaoApp`
3. Cài đặt các dependencies: `npm install`
4. Khởi chạy ứng dụng: `npm start`

## Demo ứng dụng

Link:

## Báo Cáo:

- Đây là một trò chơi bài cào trực tuyến với các chức năng cơ bản bao gồm trộn bài, chia bài, trả kết quả, và khởi tạo lại trò chơi.
- Trò chơi sử dụng React và quản lý state bằng Context API.
- Dự án đã kết nối với API deckofcardsapi.com để lấy thông tin về lá bài.
- Luật chơi đã được xác định và triển khai.
- Giao diện trò chơi và logic đã được tích hợp.
- Ứng dụng đã kiểm tra và debug để đảm bảo hoạt động ổn định.
- Ứng dụng có tiềm năng để thêm các tính năng bổ sung như chơi nhiều ván liên tiếp, đặt cược, hoặc lưu trạng thái trò chơi.
- Sau khi kiểm tra và thu thập phản hồi từ người dùng, có thể cần thực hiện các cải tiến và điều chỉnh thêm.
