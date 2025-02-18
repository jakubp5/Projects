/**
 * @author Boris Hatala (xhatal02)
 * @file habit_page.dart
 */
import 'package:flutter/material.dart';
import 'package:habitter_itu/controllers/habit_controller.dart';
import 'package:habitter_itu/models/habit.dart';
import 'package:habitter_itu/constants.dart';
import 'package:habitter_itu/models/schedule.dart';
import 'components/edit_habit.dart';
import 'components/appbar.dart';
import 'components/bottom_bar.dart';

class HabitPage extends StatefulWidget {
  Habit habit;

  HabitPage({required this.habit}) {
    print("PASSS ID: ${habit.id}");
  }

  @override
  _HabitPageState createState() => _HabitPageState();
}

class _HabitPageState extends State<HabitPage> {
  final HabitController _habitController = HabitController();

  @override
  void initState() {
    super.initState();
    _habitController.init();
  }

  void _editHabit() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return EditHabitDialog(habit: widget.habit);
      },
    ).then((result) async {
      if (result == true) {
        _habitController.printAllHabits();
        print("ID BEFORE FETCH: ${widget.habit.id}");
        final updatedHabit = await _habitController.getHabit(widget.habit.id);
        if (updatedHabit != null) {
          setState(() {
            widget.habit = updatedHabit;
          });
          print("ID AFTER FETCH: ${widget.habit.id}");
        } else {
          print("Error: Habit not found");
        }
      }
    });
  }

  void _deleteHabit() async {
    await _habitController.deleteHabit(widget.habit.id);
    Navigator.of(context).pop();
  }

  String dayNumberToWord(int dayNumber) {
    switch (dayNumber) {
      case 1:
        return 'Monday';
      case 2:
        return 'Tuesday';
      case 3:
        return 'Wednesday';
      case 4:
        return 'Thursday';
      case 5:
        return 'Friday';
      case 6:
        return 'Saturday';
      case 7:
        return 'Sunday';
      default:
        return 'Unknown';
    }
  }

// Details about habit
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Habitter'),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 100.0,
                      height: 100.0,
                      margin: const EdgeInsets.only(right: 16.0),
                      decoration: BoxDecoration(
                        color: habitColor,
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      child: Center(
                        child: Text(
                          widget.habit.category.emoji ?? '😀',
                          style: const TextStyle(fontSize: 80.0),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.habit.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18.0,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16.0),
                          RichText(
                            text: TextSpan(
                              children: [
                                const TextSpan(
                                  text: 'Category: ',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold),
                                ),
                                TextSpan(
                                  text: widget.habit.category.name,
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8.0),
                          if (widget.habit.schedule.type ==
                              ScheduleType.periodic)
                            RichText(
                              text: TextSpan(
                                children: [
                                  const TextSpan(
                                    text: 'Frequency: ',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold),
                                  ),
                                  TextSpan(
                                    text:
                                        '${widget.habit.schedule.frequency} times per ${widget.habit.schedule.frequencyUnit.toString().split('.').last}',
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                          if (widget.habit.schedule.type ==
                              ScheduleType.interval)
                            RichText(
                              text: TextSpan(
                                children: [
                                  const TextSpan(
                                    text: 'Frequency: ',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold),
                                  ),
                                  TextSpan(
                                    text:
                                        'Every ${widget.habit.schedule.frequency} ${widget.habit.schedule.frequencyUnit.toString().split('.').last}',
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                          if (widget.habit.schedule.type ==
                              ScheduleType.statical)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Static Days:',
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                                ...widget.habit.schedule.staticDays.map((day) {
                                  return Text(
                                    dayNumberToWord(day),
                                    style: const TextStyle(color: Colors.white),
                                  );
                                }).toList(),
                              ],
                            ),
                          const SizedBox(height: 8.0),
                          Text(
                            'Completion Rate: ${widget.habit.completionStatus.length}%',
                            style: const TextStyle(color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                //description box
                const SizedBox(height: 16.0),
                const Text(
                  'Description',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8.0),
                Container(
                  width: double.infinity,
                  height: 150.0,
                  padding: EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: habitColor,
                    borderRadius: BorderRadius.circular(8.0),
                    border: Border.all(
                        color: Colors.white),
                  ),
                  child: SingleChildScrollView(
                    child: Text(
                      widget.habit.description,
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            top: 16.0,
            right: 16.0,
            child: IconButton(
              icon: Icon(Icons.edit, color: Colors.white),
              onPressed: _editHabit,
            ),
          ),
        ],
      ),
      backgroundColor: backgroundColor,
      bottomNavigationBar: BottomBar(selectedIndex: 1),
    );
  }
}