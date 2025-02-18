/**
 * @author Boris Semanco (xseman06)
 * @file category_controller.dart
 */
import 'package:hive/hive.dart';
import '../models/category.dart';

class CategoryController {
  static const String _boxName = 'categoriesBox';
  late Box<Category> _categoryBox;

  // Initialize Hive box
  Future<void> init() async {
    _categoryBox = await Hive.openBox<Category>(_boxName);
  }

  // Get all categories
  List<Category> getCategories() {
    return _categoryBox.values.toList();
  }

  // Add a new category
  Future<bool> addCategory(Category category) async {
    // check if category already exists
    final categoryExists = _categoryBox.values.any((element) {
      return element.name == category.name;
    });
    if (categoryExists) {
      return false;
    }

    await _categoryBox.put(category.id, category); // Save category
    return true;
  }

  // Delete a category
  Future<void> deleteCategory(String id) async {
    final key = _categoryBox.keys.firstWhere(
        (key) => _categoryBox.get(key)?.id == id,
        orElse: () => null);
    if (key != null) {
      await _categoryBox.delete(key);
    }
  }

  // Update a category
  Future<void> updateCategory(String id, Category updatedCategory) async {
    final key = _categoryBox.keys.firstWhere(
        (key) => _categoryBox.get(key)?.id == id,
        orElse: () => null);
    if (key != null) {
      // copy all habits from the old category to the updated category
      updatedCategory.habits = _categoryBox.get(key)?.habits;

      await _categoryBox.put(key, updatedCategory);
    }
  }

  // Close the box
  Future<void> closeBox() async {
    await _categoryBox.close();
  }
}
