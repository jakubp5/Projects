/**
 * @author Boris Semanco(xseman06)
 * @file category_page.dart
 */

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'components/appbar.dart';
import 'components/bottom_bar.dart';
import 'components/add_button.dart';
import '../constants.dart';
import '../models/category.dart';
import '../controllers/category_controller.dart';
import 'components/add_category.dart';
import 'habits_list_page.dart';
import 'components/search_input.dart';
import 'components/app_drawer.dart';

class CategoryPage extends StatefulWidget {
  @override
  _CategoryPageState createState() => _CategoryPageState();
}

class _CategoryPageState extends State<CategoryPage> {
  final CategoryController _categoryController = CategoryController();
  List<Category> categories = [];
  List<Category> selectedCategories = [];
  List<Category> filteredCategories = []; // For search results
  final TextEditingController _searchController =
      TextEditingController(); // Search controller

  @override
  void initState() {
    super.initState();
    _initializeController();

    // Listener to search controller
    _searchController.addListener(_filterCategories);
  }

  Future<void> _initializeController() async {
    await _categoryController.init(); // Ensure box is opened
    setState(() {
      categories = _categoryController.getCategories();
      filteredCategories = categories; // Initially, show all categories
    });
  }

  void _filterCategories() {
    final query = _searchController.text.toLowerCase();

    // Filter categories based on search query
    setState(() {
      if (query.isEmpty) {
        filteredCategories = categories;
      } else {
        filteredCategories = categories.where((category) {
          return category.name.toLowerCase().contains(query);
        }).toList();
      }
    });
  }

  Future<void> _addCategory(Category category) async {
    bool sucess = await _categoryController
        .addCategory(category); // Ensure save completes
    if (!sucess) {
      // show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Category already exists."),
        ),
      );
    }
    setState(() {
      categories = _categoryController.getCategories(); // Fetch latest list
      filteredCategories = categories; // Update filtered list
    });
  }

  Future<void> _deleteCategory(String id) async {
    await _categoryController.deleteCategory(id); // Ensure delete completes
    setState(() {
      categories = _categoryController.getCategories(); // Fetch latest list
      filteredCategories = categories; // Update filtered list
    });
  }

  Future<void> _updateCategory(String id, Category updatedCategory) async {
    await _categoryController.updateCategory(id, updatedCategory);
    setState(() {
      categories = _categoryController.getCategories();
      filteredCategories = categories; // Update filtered list
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(),
      drawer: AppDrawer(),
      backgroundColor: backgroundColor,
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SvgPicture.asset(
                'assets/categories.svg',
                color: Colors.white,
              ),
              Text(
                " Categories",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        SearchInput(
          controller: _searchController,
          onChanged: (value) => _filterCategories(),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: GridView.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 20,
                mainAxisSpacing: 20,
              ),
              itemCount: filteredCategories.length,
              itemBuilder: (context, index) {
                final category = filteredCategories[index];
                return GestureDetector(
                  onTap: () {
                    // navigate to habits list page of the selected category
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) =>
                              HabitsListPage(category: category)),
                    );
                  },
                  onLongPress: () {
                    // edit or delete category on long press
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        backgroundColor: backgroundColor,
                        title: Text(
                          'Edit or delete category "${category.name}"?',
                          style: TextStyle(color: Colors.white),
                        ),
                        content: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            TextButton(
                              onPressed: () async {
                                final newCategory = await showDialog<Category>(
                                  context: context,
                                  builder: (context) => AddCategoryDialog(
                                      emoji: category.emoji,
                                      name: category.name),
                                );
                                if (newCategory != null) {
                                  _updateCategory(category.id, newCategory);
                                  Navigator.of(context).pop();
                                }
                              },
                              child: Text(
                                'Edit',
                                style: TextStyle(color: Colors.white),
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                _deleteCategory(category.id);
                                Navigator.of(context).pop();
                              },
                              child: Text(
                                'Delete',
                                style: TextStyle(color: redColor),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: boxColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          category.emoji ??
                              '😀', // if no emoji selected set default
                          style: TextStyle(fontSize: 50),
                        ),
                        Text(
                          category.name,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ]),
      floatingActionButton: AddButton(
        onPressed: () async {
          final category = await showDialog<Category>(
            context: context,
            builder: (context) => AddCategoryDialog(),
          );
          if (category != null) {
            _addCategory(category); // Save the category
          }
        },
      ),
      bottomNavigationBar: BottomBar(
        selectedIndex: 2,
      ),
    );
  }

  @override
  void dispose() {
    _categoryController.closeBox();
    _searchController.dispose();
    super.dispose();
  }
}
