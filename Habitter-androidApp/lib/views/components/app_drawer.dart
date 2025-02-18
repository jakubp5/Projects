/**
 * @author Jakub Pogadl(xpogad00)
 * @file app_drawer.dart
 */

import 'package:flutter/material.dart';
import 'package:habitter_itu/constants.dart';
import 'package:habitter_itu/views/profile_page.dart';
import 'package:habitter_itu/views/journal_page.dart';

class AppDrawer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Container(
        color: backgroundColor, 
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            // add some padding to the top of the drawer
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Habitter',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

            ListTile(
              leading: Icon(Icons.person,
                  color: Colors.white), 
              title: Text(
                'Profile',
                style:
                    TextStyle(color: Colors.white), 
              ),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ProfilePage()),
                );
              },
            ),
            ListTile(
              leading: Icon(Icons.book,
                  color: Colors.white), 
              title: Text(
                'Journal',
                style:
                    TextStyle(color: Colors.white), 
              ),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => JournalPage()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
