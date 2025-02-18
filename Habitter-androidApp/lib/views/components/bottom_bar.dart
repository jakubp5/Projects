/**
 * @author Boris Semanco(xseman06)
 * @file bottom_bar.dart
 */

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:habitter_itu/constants.dart';
import 'package:habitter_itu/main.dart';
import 'package:habitter_itu/views/category_page.dart';
import 'package:habitter_itu/views/habits_list_page.dart';
import 'package:habitter_itu/views/statistics_page.dart';
import 'package:habitter_itu/views/home.dart';

class BottomBar extends StatefulWidget {
  final int? selectedIndex;

  BottomBar({this.selectedIndex});

  @override
  _BottomBarState createState() => _BottomBarState();
}

class _BottomBarState extends State<BottomBar> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.selectedIndex ?? 0;
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    // Handle navigation to different views based on the selected index
    switch (index) {
      case 0:
        // Navigate to Home view
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => MyHomePage()),
        );

        break;
      case 1:
        // Navigate to All Habits view
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => HabitsListPage()),
        );
        break;
      case 2:
        // Navigate to Categories view
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => CategoryPage()),
        );
        break;
      case 3:
        // Navigate to stats view
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => StatisticsPage()),
        );
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: Colors.grey, // Set the desired border color
            width: 1.0, // Set the desired border width
          ),
        ),
      ),
      child: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: backgroundColor,
        items: <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: SvgPicture.asset(
              'assets/home.svg',
              colorFilter: ColorFilter.mode(
                _selectedIndex == 0 ? orangeColor : Colors.white,
                BlendMode.srcIn,
              ),
            ),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: SvgPicture.asset(
              'assets/target.svg',
              colorFilter: ColorFilter.mode(
                _selectedIndex == 1 ? orangeColor : Colors.white,
                BlendMode.srcIn,
              ),
            ),
            label: 'Target',
          ),
          BottomNavigationBarItem(
            icon: SvgPicture.asset(
              'assets/categories.svg',
              colorFilter: ColorFilter.mode(
                _selectedIndex == 2 ? orangeColor : Colors.white,
                BlendMode.srcIn,
              ),
            ),
            label: 'Categories',
          ),
          BottomNavigationBarItem(
            icon: SvgPicture.asset(
              'assets/pie-chart.svg',
              colorFilter: ColorFilter.mode(
                _selectedIndex == 3 ? orangeColor : Colors.white,
                BlendMode.srcIn,
              ),
            ),
            label: 'Stats',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: orangeColor,
        unselectedItemColor: Colors.white,
        showSelectedLabels: false,
        showUnselectedLabels: false,
        onTap: _onItemTapped,
      ),
    );
  }
}
