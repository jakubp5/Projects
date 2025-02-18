/**
 * @author Jakub Pogadl(xpogad00)
 * @file calendar.dart
 */

import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:habitter_itu/constants.dart';

class Calendar extends StatelessWidget {
  final DateTime focusedDay;
  final DateTime? selectedDay;
  final CalendarFormat calendarFormat;
  final Function(DateTime, DateTime) onDaySelected;
  final Function(CalendarFormat) onFormatChanged;
  final Function(DateTime) onPageChanged;

  Calendar({
    required this.focusedDay,
    required this.selectedDay,
    required this.calendarFormat,
    required this.onDaySelected,
    required this.onFormatChanged,
    required this.onPageChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0), 
      child: Container(
        decoration: BoxDecoration(
          color: habitColor, // Background color of the container
          borderRadius: BorderRadius.circular(16.0), 
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              spreadRadius: 2,
              blurRadius: 5,
              offset: Offset(0, 3), 
            ),
          ],
        ),
        child: TableCalendar(
          focusedDay: focusedDay,
          firstDay: DateTime.utc(2010, 10, 16),
          lastDay: DateTime.utc(2030, 3, 14),
          calendarFormat: calendarFormat,
          selectedDayPredicate: (day) {
            return isSameDay(selectedDay, day);
          },
          onDaySelected: onDaySelected,
          onFormatChanged: onFormatChanged,
          onPageChanged: onPageChanged,
          // color styles for the calendar
          calendarStyle: CalendarStyle(
            defaultTextStyle: TextStyle(
                color: Colors.white), 
            weekendTextStyle: TextStyle(
                color: Colors.white), 
            selectedTextStyle: TextStyle(
                color: Colors.white), 
            todayTextStyle: TextStyle(
                color: Colors.white), 
          ),
          headerStyle: HeaderStyle(
            titleTextStyle: TextStyle(
              color: Colors.white, 
              fontSize: 16.0,
            ),
            formatButtonTextStyle: TextStyle(
              color: Colors.white, 
            ),
            formatButtonDecoration: BoxDecoration(
              border: Border.all(color: Colors.white), 
              borderRadius: BorderRadius.circular(12.0),
            ),
            leftChevronIcon: Icon(
              Icons.chevron_left,
              color: Colors.white, 
            ),
            rightChevronIcon: Icon(
              Icons.chevron_right,
              color: Colors.white, 
            ),
          ),
        ),
      ),
    );
  }
}