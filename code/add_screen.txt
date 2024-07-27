import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'save_add_screen.dart';

class AddScreen extends StatefulWidget {
  @override
  _AddScreenState createState() => _AddScreenState();
}

class _AddScreenState extends State<AddScreen> {
  CameraController? _controller;
  Future<void>? _initializeControllerFuture;
  IO.Socket? socket;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
    _initializeSocket();
  }

  void _initializeSocket() {
    socket = IO.io('http://192.168.2.4:8080', IO.OptionBuilder().setTransports(['websocket']).build());
    socket?.onConnect((_) => print('Connected to Socket.IO server'));
    socket?.onDisconnect((_) => print('Disconnected from Socket.IO server'));
  }

  Future<void> _initializeCamera() async {
    final cameras = await availableCameras();
    final firstCamera = cameras.first;

    _controller = CameraController(
      firstCamera,
      ResolutionPreset.high,
    );

    _initializeControllerFuture = _controller!.initialize();
    setState(() {});
  }

  @override
  void dispose() {
    _controller?.dispose();
    socket?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'TAKE GREAT PICTURE',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  FutureBuilder<void>(
                    future: _initializeControllerFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.done) {
                        return Container(
                          width: 350, // Width of camera preview
                          height: 350, // Height of camera preview
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(50), // Rounded corners
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(50),
                            child: AspectRatio(
                              aspectRatio: _controller!.value.aspectRatio,
                              child: CameraPreview(_controller!),
                            ),
                          ),
                        );
                      } else {
                        return const Center(child: CircularProgressIndicator());
                      }
                    },
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.autorenew),
                        onPressed: () {},
                        iconSize: 40,
                      ),
                      const SizedBox(width: 40),
                      IconButton(
                        icon: const Icon(Icons.camera),
                        onPressed: () async {
                          try {
                            await _initializeControllerFuture;
                            final image = await _controller!.takePicture();
                            if (!mounted) return;
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => SaveAddScreen(
                                  imagePath: image.path,
                                  socket: socket,
                                ),
                              ),
                            );
                          } catch (e) {
                            print(e);
                          }
                        },
                        iconSize: 70,
                      ),
                      const SizedBox(width: 40),
                      IconButton(
                        icon: const Icon(Icons.flash_on),
                        onPressed: () {},
                        iconSize: 40,
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
