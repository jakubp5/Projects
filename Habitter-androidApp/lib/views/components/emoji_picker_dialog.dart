/**
 * @author Boris Semanco(xseman06)
 * @file emoji_picker_dialog.dart
 */

import 'package:flutter/material.dart';
import 'package:habitter_itu/constants.dart';

// Emoji picker dialog
class EmojiPickerDialog extends StatelessWidget {
  final int emojiCount = 1024; // Number of emojis to fetch

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
            Text(
              "Choose an emoji:",
              style: TextStyle(color: Colors.white, fontSize: 18),
            ),
            SizedBox(height: 20),
            Expanded(
              child: GridView.builder(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 8, // Number of columns
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                // skipping non-emoji characters
                itemCount: emojiCount -
                    (127 - 80 + 1) -
                    (371 - 198 + 1) -
                    (479 - 372 + 1) -
                    (779 - 492 + 1),
                itemBuilder: (context, index) {
                  // Adjust the index to skip non-emoji characters
                  int adjustedIndex = index;
                  if (index >= 80) {
                    adjustedIndex += (127 - 80 + 1);
                  }
                  if (index >= 198 - (127 - 80 + 1)) {
                    adjustedIndex += (371 - 198 + 1);
                  }
                  if (index >= 372 - (127 - 80 + 1) - (371 - 198 + 1)) {
                    adjustedIndex += (479 - 372 + 1);
                  }
                  if (index >=
                      492 -
                          (127 - 80 + 1) -
                          (371 - 198 + 1) -
                          (479 - 372 + 1)) {
                    adjustedIndex += (779 - 492 + 1);
                  }
                  return GestureDetector(
                    onTap: () {
                      // Return the selected emoji
                      Navigator.of(context)
                          .pop(String.fromCharCode(0x1F600 + adjustedIndex));
                    },
                    child: Center(
                      child: Text(
                        String.fromCharCode(0x1F600 + adjustedIndex),
                        style: TextStyle(fontSize: 24),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
