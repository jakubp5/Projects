/**
 * @author Boris Hatala (xhatal02) Jakub Pogádl (xpogad00) Boris Semanco(xseman06)
 * @file habit.dart
 */
import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'category.g.dart';

@HiveType(typeId: 1)
class Category extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String name;

  @HiveField(2)
  String? emoji;

  @HiveField(3)
  List<int>? habits;

  Category({required this.name, this.emoji, List<int>? habits})
      : id = Uuid().v4(),
        habits = habits ?? [];
}
