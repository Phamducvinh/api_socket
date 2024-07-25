require('dotenv').config(); 

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const fs = require('fs'); // Import thư viện fs
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Định nghĩa Schema và Model
const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  comment: String,
  createdAt: { type: Date, default: Date.now } // Thêm trường createdAt
});

const Image = mongoose.model('Image', imageSchema);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('save_image', async (data) => {
    console.log('image and comment received');

    const newImage = new Image({
      data: Buffer.from(data.image, 'base64'),
      contentType: 'image/jpeg',
      comment: data.comment
    });

    try {
      const savedImage = await newImage.save();
      console.log('Image and comment saved to MongoDB');

      // Lưu ảnh vào folder uploads
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }
      const fileName = `${Date.now()}.jpeg`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, newImage.data);

      // Gửi lại thông tin ảnh và bình luận kèm theo thời gian cho tất cả client đang kết nối
      io.emit('new_image', {
        image: data.image,
        comment: data.comment,
        createdAt: savedImage.createdAt // Trả về thời gian lưu vào MongoDB
      });
    } catch (error) {
      console.error('Error saving image and comment to MongoDB:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
