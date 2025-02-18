/**
 * @author Boris Hatala (xhatal02)
 * @file habit_controller.dart
 */
import 'package:hive/hive.dart';
import 'package:habitter_itu/models/habit.dart';

class HabitController {
  static const String _boxName = 'habits';
  late Box<Habit> _habitBox;

  HabitController();

  // Initialize Hive box
  Future<void> init() async {
    _habitBox = await Hive.openBox<Habit>(_boxName);
  }

  Future<void> addHabit(Habit habit) async {
    try {
      await _habitBox.put(habit.id, habit);
    } catch (e) {
      print("Error adding habit: $e");
    }
  }

  Future<void> updateHabit(String id, Habit habit) async {
    try {
      final key = _habitBox.keys.firstWhere(
        (key) => _habitBox.get(key)?.id == id,
        orElse: () => null,
      );
      if (key != null) {
        await _habitBox.put(key, habit);
        print("Habit updated with ID: $id");
      } else {
        print("Error: Habit not found");
      }
    } catch (e) {
      print("Error updating habit: $e");
    }
  }

  Future<void> deleteHabit(String id) async {
    try {
      final key = _habitBox.keys.firstWhere(
        (key) => _habitBox.get(key)?.id == id,
        orElse: () => null,
      );
      if (key != null) {
        await _habitBox.delete(key);
      } else {
        print("Error: Habit not found");
      }
    } catch (e) {
      print("Error deleting habit: $e");
    }
  }

  Future<List<Habit>> getHabits() async {
    return _habitBox.values.toList();
  }

  Future<Habit?> getHabit(String id) async {
    try {
      return _habitBox.values.firstWhere(
        (habit) => habit.id == id,
      );
    } catch (e) {
      print("Error getting habit: $e");
      return null;
    }
  }

  List<Habit> getHabitsByTitle(String title) {
    return _habitBox.values
        .where((habit) => habit.title.contains(title))
        .toList();
  }

  // Print all habits to the console
  void printAllHabits() {
    final habits = _habitBox.values.toList();
    for (var habit in habits) {
      print('Habit: ${habit.title}, Description: ${habit.description}, Category: ${habit.category.name}');
      print('Completion Status: ${habit.completionStatus}\n');
      print('ID: ${habit.id}\n');

    }
  }

  // Close the box
  Future<void> closeBox() async {
    await _habitBox.close();
  }
}