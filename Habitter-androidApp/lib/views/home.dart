/**
 * @author Jakub Pogadl(xpogad00)
 * @file home.dart
 */
import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import '../views/components/appbar.dart';
import 'package:habitter_itu/constants.dart';
import '../views/components/bottom_bar.dart';
import '../views/components/add_button.dart';
import '../views/components/add_habit.dart';
import '../models/habit.dart';
import '../models/schedule.dart';
import '../controllers/habit_controller.dart';
import '../views/components/app_drawer.dart';
import '../views/components/calendar.dart';


class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  CalendarFormat _calendarFormat = CalendarFormat.week;
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  final int _initialPage = 10000; // allows swiping to the past and future
  final PageController _pageController = PageController(initialPage: 10000);
  final HabitController _habitController = HabitController();
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeHabitController();
  }

  // Initialize the habit controller and set the isInitialized flag to true, prevents late initialization error
  Future<void> _initializeHabitController() async {
    await _habitController.init();
    if (mounted) {
      setState(() {
        _isInitialized = true;
      });
    }
  }

  //return all habits that should occur on the selected day
  Future<List<Habit>> get _selectedDayHabits async {
    if (!_isInitialized) {
      await _initializeHabitController();
    }
    List<Habit> habits = await _habitController.getHabits();
    return habits.where((habit) {
      return habit.shouldOccurOnDate(_selectedDay);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: CustomAppBar(),
      drawer: AppDrawer(),
      body: _isInitialized
          ? Stack(
              children: [
                Column(
                  children: [
                    Calendar(
                      focusedDay: _focusedDay,
                      selectedDay: _selectedDay,
                      calendarFormat: _calendarFormat,
                      onDaySelected: (selectedDay, focusedDay) {
                        setState(() {
                          _selectedDay = selectedDay;
                          _focusedDay = focusedDay;
                        });
                      },
                      onFormatChanged: (format) {
                        if (_calendarFormat != format) {
                          setState(() {
                            _calendarFormat = format;
                          });
                        }
                      },
                      onPageChanged: (focusedDay) {
                        _focusedDay = focusedDay;
                      },
                    ),
                    Expanded(
                      child: PageView.builder(
                        controller: _pageController,
                        onPageChanged: (index) {
                          setState(() {
                            _selectedDay = DateTime.now()
                                .add(Duration(days: index - _initialPage));
                            _focusedDay = _selectedDay;
                          });
                        },
                        itemBuilder: (context, index) {
                          DateTime day = DateTime.now()
                              .add(Duration(days: index - _initialPage));
                          return SingleChildScrollView(
                            child: FutureBuilder<List<Habit>>(
                              future: _selectedDayHabits,
                              builder: (context, snapshot) {
                                if (snapshot.connectionState ==
                                    ConnectionState.waiting) {
                                  return CircularProgressIndicator();
                                } else if (snapshot.hasError) {
                                  return Text('Error: ${snapshot.error}');
                                } else if (!snapshot.hasData ||
                                    snapshot.data!.isEmpty) {
                                  return Text('No habits for the selected day');
                                } else {
                                  
                                  // Filter habits based on their frequency
                                  List<Habit> todayHabits = [];
                                  List<Habit> weekHabits = [];
                                  List<Habit> monthHabits = [];

                                  for (var habit in snapshot.data!) {
                                    if (habit.schedule.type ==
                                        ScheduleType.statical) {
                                      todayHabits.add(habit);
                                    } else if (habit.schedule.frequencyUnit ==
                                        FrequencyUnit.days) {
                                      todayHabits.add(habit);
                                    } else if (habit.schedule.frequencyUnit ==
                                        FrequencyUnit.weeks) {
                                      weekHabits.add(habit);
                                    } else if (habit.schedule.frequencyUnit ==
                                        FrequencyUnit.months) {
                                      monthHabits.add(habit);
                                    }
                                  }


                                  // Display habits based on their frequency 
                                  return Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      if (todayHabits.isNotEmpty) ...[
                                        Padding(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 20.0, vertical: 8.0),
                                          child: Text(
                                            'Today',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 18.0,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        ...todayHabits
                                            .map((habit) =>
                                                _buildHabitTile(habit))
                                            .toList(),
                                      ],
                                      if (weekHabits.isNotEmpty) ...[
                                        Padding(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 20.0, vertical: 8.0),
                                          child: Text(
                                            'This Week',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 18.0,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        ...weekHabits
                                            .map((habit) =>
                                                _buildHabitTile(habit))
                                            .toList(),
                                      ],
                                      if (monthHabits.isNotEmpty) ...[
                                        Padding(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 20.0, vertical: 8.0),
                                          child: Text(
                                            'This Month',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 18.0,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        ...monthHabits
                                            .map((habit) =>
                                                _buildHabitTile(habit))
                                            .toList(),
                                      ],
                                      SizedBox(height: 80.0),
                                    ],
                                  );
                                }
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
                
                // button to add a new habit
                Align(
                  alignment: Alignment.bottomRight,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: AddButton(
                      onPressed: _showAddHabitDialog,
                    ),
                  ),
                ),
              ],
            )
          : Center(child: CircularProgressIndicator()),
      bottomNavigationBar: BottomBar(selectedIndex: 0),
    );
  }

  Widget _buildHabitTile(Habit habit) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 20.0),
      child: Container(
        height: 80.0,
        decoration: BoxDecoration(
          color: habitColor,
          borderRadius: BorderRadius.circular(12.0),
        ),
        child: ListTile(
          leading: Text(
            habit.category.emoji ?? '😀',
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
              fontSize: 18.0,
            ),
          ),
          subtitle: () {

            // if the habit is statical, display the days it should occur instead of completions
            if (habit.schedule.type == ScheduleType.statical) {
              return Text(
                'Days: ${habit.getStaticDays()}',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14.0,
                ),
              );
            } else if (habit.schedule.type == ScheduleType.interval) {
              return SizedBox
                  .shrink(); // Do not display anything for interval schedules
            } else {
              return Text(
                habit.schedule.frequencyUnit == FrequencyUnit.weeks
                    ? 'This week: ${habit.getCompletions(_selectedDay!)} / ${habit.schedule.frequency} times' // Display weekly completions
                    : 'This month: ${habit.getCompletions(_selectedDay!)} / ${habit.schedule.frequency} times', // Display monthly completions
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14.0,
                ),
              );
            }
          }(),
          trailing: Checkbox(
            value: habit.isDoneOn(_selectedDay),
            onChanged: (value) {
              setState(() {
                habit.setDoneOn(_selectedDay, value!);
                _habitController.updateHabit(habit.id, habit);
              });
            },
            activeColor: Colors.white,
            checkColor: habitColor,
          ),
        ),
      ),
    );
  }

  // Show the dialog to add a new habit
  void _showAddHabitDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AddHabitDialog(
          selectedDay: _selectedDay,
        );
      },
    ).then((_) {
      setState(() {});
    });
  }
}

