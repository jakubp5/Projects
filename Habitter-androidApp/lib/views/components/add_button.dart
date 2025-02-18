/**
 * @author Boris Semanco(xseman06)
 * @file add_button.dart
 */

import 'package:flutter/material.dart';
import 'package:habitter_itu/constants.dart';

class AddButton extends StatelessWidget {
  final Function onPressed;

  const AddButton({Key? key, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () {
        onPressed();
      },
      child: Icon(Icons.add, color: Colors.black),
      backgroundColor: orangeColor,
      shape: CircleBorder(),
    );
  }
}
