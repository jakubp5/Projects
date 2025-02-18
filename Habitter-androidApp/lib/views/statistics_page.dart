/**
 * @author Boris Semanco(xseman06)
 * @file statistics_page.dart
 */

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:habitter_itu/controllers/habit_controller.dart';
import 'package:habitter_itu/models/habit.dart';
import 'package:habitter_itu/constants.dart';
import 'components/appbar.dart';
import 'components/bottom_bar.dart';
import 'package:fl_chart/fl_chart.dart';
import 'components/app_drawer.dart';

class StatisticsPage extends StatefulWidget {
  @override
  _StatisticsPageState createState() => _StatisticsPageState();
}

class _StatisticsPageState extends State<StatisticsPage> {
  final HabitController _habitController = HabitController();
  List<Habit> habits = [];
  double totalHabitCompletionRate = 0;
  double totalGoalCompletionRate = 0;
  Map<String, double> categoryDistribution = {};
  List<Habit> topStreaks = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  // Load habits and calculate statistics
  Future<void> _loadData() async {
    await _habitController.init();
    List<Habit> loadedHabits = await _habitController.getHabits();
    setState(() {
      habits = loadedHabits;
      _calculateStats();
      _calculateTopStreaks();
    });
  }

  // Calculate top 5 streaks based on days of completion
  void _calculateTopStreaks() {
    topStreaks = List.from(habits);
    topStreaks.sort((a, b) => b.getStreak().compareTo(a.getStreak()));
    if (topStreaks.length > 5) {
      topStreaks = topStreaks.sublist(0, 5);
    }
  }

  void _calculateStats() {
    double totalCompletionRate = 0;
    double totalGoalRate = 0;
    Map<String, double> categoryCount = {};

    // Calculate total completion rate and goal completion rate
    for (Habit habit in habits) {
      totalCompletionRate +=
          habit.completionStatus.values.where((status) => status).length;
      totalGoalRate += habit.completionStatus.length;

      String categoryName = habit.category.name;
      categoryCount[categoryName] = (categoryCount[categoryName] ?? 0) + 1;
    }

    totalHabitCompletionRate =
        habits.isEmpty ? 0 : (totalCompletionRate / totalGoalRate) * 100;
    totalGoalCompletionRate =
        habits.isEmpty ? 0 : (totalCompletionRate / habits.length) * 100;

    // Calculate category distribution
    categoryDistribution = categoryCount.map((key, value) {
      return MapEntry(key, (value / habits.length) * 100);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(),
      drawer: AppDrawer(),
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SvgPicture.asset(
                      'assets/pie-chart.svg',
                      color: Colors.white,
                    ),
                    Text(
                      " Statistics",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                'Total Habit Completion Rate: ${totalHabitCompletionRate.toStringAsFixed(2)}%',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 8.0),
              Text(
                'Total Goal Completion Rate: ${totalGoalCompletionRate.toStringAsFixed(2)}%',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 16.0),
              Text(
                'Habit Completion Rates',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 8.0),
              Container(
                height: 200,
                child: BarChart(
                  BarChartData(
                    alignment: BarChartAlignment.spaceAround,
                    barGroups: habits.map((habit) {
                      double completionCount = habit.completionStatus.values
                          .where((status) => status)
                          .length
                          .toDouble();
                      double totalCount =
                          habit.completionStatus.length.toDouble();
                      double barHeight = totalCount == 0
                          ? 0
                          : (completionCount / totalCount) * 100;
                      return BarChartGroupData(
                        x: habits.indexOf(habit),
                        barRods: [
                          BarChartRodData(
                            toY: barHeight,
                            color: Colors.orange,
                          ),
                        ],
                      );
                    }).toList(),
                    titlesData: FlTitlesData(
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(showTitles: true),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (double value, TitleMeta meta) {
                            return Text(
                              habits[value.toInt()].title,
                              style:
                                  TextStyle(color: Colors.white, fontSize: 10),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 16.0),
              Text(
                'Category Distribution',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 8.0),
              Container(
                height: 200,
                child: Row(
                  children: [
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 80.0),
                        child: PieChart(
                          PieChartData(
                            sections: categoryDistribution.entries.map((entry) {
                              return PieChartSectionData(
                                color: Colors.primaries[categoryDistribution
                                        .keys
                                        .toList()
                                        .indexOf(entry.key) %
                                    Colors.primaries.length],
                                value: entry.value,
                                title: '${entry.value.toStringAsFixed(1)}%',
                                radius: 80,
                                titleStyle: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              );
                            }).toList(),
                            sectionsSpace: 0,
                            centerSpaceRadius: 40,
                          ),
                        ),
                      ),
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: categoryDistribution.entries.map((entry) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4.0),
                          child: Row(
                            children: [
                              Container(
                                width: 16,
                                height: 16,
                                color: Colors.primaries[categoryDistribution
                                        .keys
                                        .toList()
                                        .indexOf(entry.key) %
                                    Colors.primaries.length],
                              ),
                              SizedBox(width: 8),
                              Text(
                                entry.key,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16.0,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 100.0),
              Text(
                'Top 5 Habit Streaks',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 8.0),
              ListView.builder(
                shrinkWrap: true,
                itemCount: topStreaks.length,
                itemBuilder: (context, index) {
                  Habit habit = topStreaks[index];
                  return ListTile(
                    title: Text(
                      habit.title,
                      style: TextStyle(color: Colors.white),
                    ),
                    subtitle: Text(
                      'Streak: ${habit.getStreak()} days',
                      style: TextStyle(color: Colors.white70),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
      backgroundColor: backgroundColor,
      bottomNavigationBar: BottomBar(selectedIndex: 3),
    );
  }
}
