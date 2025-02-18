/**
 * @author Boris Hatala (xhatal02) Jakub Pogádl (xpogad00) Boris Semanco(xseman06)
 * @file habit.dart
 */

import 'package:hive/hive.dart';

part 'journal.g.dart';

@HiveType(typeId: 7)
class JournalEntry extends HiveObject {
  @HiveField(0)
  late String id;

  @HiveField(1)
  late String title;

  @HiveField(2)
  late String content;

  @HiveField(3)
  late DateTime date;
}
