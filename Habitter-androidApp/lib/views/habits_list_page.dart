/**
 * @author Boris Semanco(xseman06)
 * @file habits_list_page.dart
 */

import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:habitter_itu/controllers/habit_controller.dart';
import 'package:habitter_itu/models/habit.dart';
import 'package:habitter_itu/constants.dart';
import 'components/appbar.dart';
import 'components/bottom_bar.dart';
import 'components/edit_habit.dart';
import 'components/search_input.dart';
import 'habit_page.dart';
import 'package:habitter_itu/models/category.dart';
import 'components/app_drawer.dart';

class HabitsListPage extends StatefulWidget {
  final Category? category; // Add category property to filter habits

  HabitsListPage({this.category});

  @override
  _HabitsListPageState createState() => _HabitsListPageState();
}

class _HabitsListPageState extends State<HabitsListPage> {
  final HabitController _habitController = HabitController();
  List<Habit> habits = [];
  List<Habit> filteredHabits = [];
  TextEditingController searchController = TextEditingController();

  // Initialize the habit controller and load habits
  @override
  void initState() {
    super.initState();
    _loadHabits();
    searchController.addListener(_filterHabits);
  }

  Future<void> _loadHabits() async {
    await _habitController.init();
    List<Habit> loadedHabits = await _habitController.getHabits();
    // Filter habits by category if provided
    if (widget.category != null) {
      loadedHabits = loadedHabits
          .where((habit) => habit.category.id == widget.category!.id)
          .toList();
    }
    setState(() {
      habits = loadedHabits;
      _filterHabits(); // Update the filtered list
    });
  }

  // Filter habits based on search query
  void _filterHabits() {
    setState(() {
      filteredHabits = habits.where((habit) {
        return habit.title
            .toLowerCase()
            .contains(searchController.text.toLowerCase());
      }).toList();
    });
  }

  // Edit habit dialog
  void _editHabit(Habit habit) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return EditHabitDialog(habit: habit);
      },
    ).then((_) {
      _loadHabits(); // Reload habits after editing
    });
  }

  // Delete habit
  void _deleteHabit(String id) async {
    await _habitController.deleteHabit(id);
    setState(() {
      habits.removeWhere((habit) => habit.id == id);
      _filterHabits(); // Update the filtered list
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(),
      drawer: AppDrawer(),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SvgPicture.asset(
                  'assets/target.svg',
                  color: Colors.white,
                ),
                Text(
                  widget.category != null
                      ? ' ${widget.category!.name}'
                      : ' All Habits',
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
            controller: searchController,
            onChanged: (value) => _filterHabits(),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: filteredHabits.length,
              itemBuilder: (context, index) {
                final habit = filteredHabits[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(
                      vertical: 4.0, horizontal: 20.0),
                  child: Slidable(
                    key: ValueKey(habit.id),
                    endActionPane: ActionPane(
                      motion: const ScrollMotion(),
                      extentRatio: 0.25,
                      dismissible: DismissiblePane(onDismissed: () {
                        _deleteHabit(habit.id);
                      }),
                      children: [
                        SlidableAction(
                          onPressed: (_) => _deleteHabit(habit.id),
                          backgroundColor: redColor,
                          foregroundColor: Colors.white,
                          icon: Icons.delete,
                          label: 'Delete',
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ],
                    ),
                    child: GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => HabitPage(habit: habit),
                          ),
                        );
                      },
                      child: Container(
                        height: 80.0,
                        decoration: BoxDecoration(
                          color: habitColor,
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        child: ListTile(
                          leading: Text(
                            habit.category.emoji ??
                                '😀', // Display the category emoji
                            style: TextStyle(fontSize: 40.0),
                          ),
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 16.0,
                            vertical: 8.0,
                          ),
                          title: Text(
                            habit.title,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22.0,
                            ),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: Icon(Icons.edit, color: Colors.white),
                                onPressed: () => _editHabit(habit),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      backgroundColor: backgroundColor,
      bottomNavigationBar: BottomBar(selectedIndex: 1),
    );
  }
}
