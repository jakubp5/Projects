/**
 * @author Boris Semanco(xseman06)
 * @file appbar.dart
 */

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:habitter_itu/constants.dart';
import 'package:flutter_svg/flutter_svg.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final Color bgColor;
  final int streak_count;

  // Constructor with default values
  const CustomAppBar({
    Key? key,
    this.title = 'Habitter',
    this.bgColor = orangeColor,
    this.streak_count = 10,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: bgColor,
      leading: IconButton(
        icon: SvgPicture.asset('assets/sidebar.svg'),
        onPressed: () {
          Scaffold.of(context).openDrawer();
        },
      ),
      title: Center(
        child: Text(
          title,
          style: GoogleFonts.poppins(fontSize: 24),
        ),
      ),
      actions: [
        Stack(
          alignment: Alignment.center,
          children: [
            SvgPicture.asset('assets/streak_badge.svg'),
            Positioned(
              top: 5,
              child: Text(
                '$streak_count',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  // Return the preferred size of the app bar
  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
