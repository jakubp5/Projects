/**
 * @author Boris Semanco(xseman06)
 * @file add_category.dart
 */

import 'package:flutter/material.dart';
import 'package:habitter_itu/constants.dart';
import 'package:habitter_itu/models/category.dart';
import 'package:habitter_itu/views/components/emoji_picker_dialog.dart';

class AddCategoryDialog extends StatefulWidget {
  final String? emoji;
  final String? name;

  AddCategoryDialog({this.emoji, this.name});

  @override
  _AddCategoryDialogState createState() => _AddCategoryDialogState();
}

class _AddCategoryDialogState extends State<AddCategoryDialog> {
  late String selectedEmoji;
  late TextEditingController _nameController;

  @override
  void initState() {
    super.initState();
    selectedEmoji = widget.emoji ?? '😀'; // Default emoji
    _nameController = TextEditingController(text: widget.name ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: backgroundColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.of(context).pop(),
                ),
                Text(
                  "Add category",
                  style: TextStyle(color: Colors.white, fontSize: 24),
                ),
                IconButton(
                  icon: Icon(Icons.check, color: Colors.white),
                  onPressed: () {
                    // Check if name is entered
                    if (_nameController.text.isNotEmpty) {
                      // Create a new Category instance
                      final newCategory = Category(
                        name: _nameController.text,
                        emoji: selectedEmoji,
                      );
                      // Pass the new category back to the calling context
                      Navigator.of(context).pop(newCategory);
                    } else {
                      // Show an alert if the name is empty
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text("Please enter a category name."),
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
            SizedBox(height: 20),
            Text(
              "Choose an icon:",
              style: TextStyle(color: Colors.white, fontSize: 18),
            ),
            SizedBox(height: 20),
            GestureDetector(
              onTap: () async {
                final emoji = await showDialog<String>(
                  context: context,
                  builder: (context) {
                    return EmojiPickerDialog();
                  },
                );
                if (emoji != null) {
                  setState(() {
                    selectedEmoji = emoji;
                  });
                }
              },
              child: Container(
                padding: EdgeInsets.all(30),
                decoration: BoxDecoration(
                  color: boxColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  selectedEmoji,
                  style: TextStyle(fontSize: 50),
                ),
              ),
            ),
            SizedBox(height: 20),
            TextField(
              controller: _nameController,
              style: TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: "Name...",
                hintStyle: TextStyle(color: Colors.white38),
                filled: true,
                fillColor: boxColor,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
