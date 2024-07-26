require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const os = require('os'); // Import os module to get IP address
const fs = require('fs'); // Import fs module to handle file system operations
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  
  ssl: true,
}).catch(error => console.error('Error connecting to MongoDB:', error));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Schema and Model
const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  caption: String,
  time: { type: Date, default: Date.now },
  avatar: String,
  name: String,
  likes: Number,
  comments: [String],
  isFavorite: Boolean,
});

const Image = mongoose.model('Image', imageSchema);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('save_image', async (data) => {
    console.log('image and caption received');

    const newImage = new Image({
      data: Buffer.from(data.image, 'base64'),
      contentType: 'image/jpeg',
      caption: data.caption,
      avatar: data.avatar,
      name: data.name,
      likes: data.likes,
      comments: data.comments,
      isFavorite: data.isFavorite,
    });

    try {
      const savedImage = await newImage.save();
      console.log('Image and caption saved to MongoDB');

      // Save image to uploads folder
      const fileName = `${Date.now()}.jpeg`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, newImage.data);

      // Emit the image and caption data along with other details to all connected clients
      io.emit('new_image', {
        image: data.image,
        caption: data.caption,
        time: savedImage.time,
        avatar: data.avatar,
        name: data.name,
        likes: data.likes,
        comments: data.comments,
        isFavorite: data.isFavorite,
      });
    } catch (error) {
      console.error('Error saving image and caption to MongoDB:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// API to return the server IP address
app.get('/server-ip', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = [];

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddresses.push(iface.address);
      }
    }
  }

  res.json({ ip: ipAddresses[0] || 'localhost' });
});

server.listen(8080, () => {
  console.log('Server listening on port 8080');
});
