import 'package:demo/screen/account/account_screen.dart';
import 'package:demo/screen/add/add_screen.dart';
import 'package:demo/screen/chat/chat_screen.dart';
import 'package:demo/screen/home/home_screen.dart';
import 'package:demo/screen/notification/notification_screen.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_nav_bar/google_nav_bar.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  final List<Widget> screens = [
    HomeScreen(
      image: '',
      caption: '',
      time: DateTime.now(),
    ), // Pass default values for initial rendering
    NotificationScreen(),
    AddScreen(),
    ChatScreen(),
    AccountScreen()
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
          child: GNav(
            selectedIndex: _currentIndex,
            backgroundColor: Colors.white,
            color: Colors.grey[400],
            activeColor: Colors.black,
            tabBackgroundColor: Colors.white,
            gap: 5,
            tabs: const [
              GButton(
                icon: Icons.home_outlined,
                iconSize: 30,
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              ),
              GButton(
                icon: CupertinoIcons.bell,
                iconSize: 30,
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              ),
              GButton(
                icon: CupertinoIcons.add_circled,
                iconSize: 30,
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              ),
              GButton(
                icon: CupertinoIcons.conversation_bubble,
                iconSize: 30,
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              ),
              GButton(
                icon: CupertinoIcons.person,
                iconSize: 30,
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              ),
            ],
            onTabChange: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
          ),
        ),
      ),
    );
  }
}
