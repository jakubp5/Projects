/**
 * @author Jakub Pogadl(xpogad00)
 * @file journal_page.dart
 */

import 'package:table_calendar/table_calendar.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../controllers/journal_controller.dart';
import '../models/journal.dart';
import '../constants.dart';
import 'components/appbar.dart';
import 'components/bottom_bar.dart';
import 'components/add_button.dart';
import 'components/app_drawer.dart';
import 'components/calendar.dart'; 

class JournalPage extends StatefulWidget {
  @override
  _JournalPageState createState() => _JournalPageState();
}

class _JournalPageState extends State<JournalPage> {
  CalendarFormat _calendarFormat = CalendarFormat.week;
  final JournalController _journalController = JournalController();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();
  late Future<void> _initFuture;
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  final int _initialPage = 10000; // allows swiping
  final PageController _pageController = PageController(initialPage: 10000);

  @override
  void initState() {
    super.initState();
    _initFuture = _journalController.init();
  }

  void _addJournalEntry() {
    final entry = JournalEntry()
      ..id = Uuid().v4()
      ..title = _titleController.text
      ..content = _contentController.text
      ..date = _selectedDay;

    _journalController.addJournalEntry(entry);
    _titleController.clear();
    _contentController.clear();
    setState(() {});
  }


  void _deleteJournalEntry(String id) {
    _journalController.deleteJournalEntry(id);
    setState(() {});
  }

  // Update journal entry
  Future<void> _updateJournalEntry(JournalEntry entry) async {
    await _journalController.updateJournalEntry(entry);
    setState(() {});
  }

  // Show dialog to add journal entry
  void _showAddJournalEntryDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: backgroundColor,
          title:
              Text('Add Journal Entry', style: TextStyle(color: Colors.white)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _titleController,
                decoration: InputDecoration(
                  labelText: 'Title',
                  labelStyle: TextStyle(color: Colors.white),
                  filled: true,
                  fillColor: boxColor,
                ),
                style: TextStyle(color: Colors.white),
              ),
              SizedBox(height: 8),
              TextField(
                controller: _contentController,
                decoration: InputDecoration(
                  labelText: 'Content',
                  labelStyle: TextStyle(color: Colors.white),
                  filled: true,
                  fillColor: boxColor,
                ),
                style: TextStyle(color: Colors.white),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(
              child: Text('Cancel', style: TextStyle(color: Colors.white)),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text('Add', style: TextStyle(color: Colors.white)),
              onPressed: () {
                _addJournalEntry();
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  // Show dialog to edit journal entry
  void _showEditJournalEntryDialog(JournalEntry entry) {
    _titleController.text = entry.title;
    _contentController.text = entry.content;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: backgroundColor,
          title:
              Text('Edit Journal Entry', style: TextStyle(color: Colors.white)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _titleController,
                decoration: InputDecoration(
                  labelText: 'Title',
                  labelStyle: TextStyle(color: Colors.white),
                  filled: true,
                  fillColor: boxColor,
                ),
                style: TextStyle(color: Colors.white),
              ),
              SizedBox(height: 8),
              TextField(
                controller: _contentController,
                decoration: InputDecoration(
                  labelText: 'Content',
                  labelStyle: TextStyle(color: Colors.white),
                  filled: true,
                  fillColor: boxColor,
                ),
                style: TextStyle(color: Colors.white),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(
              child: Text('Cancel', style: TextStyle(color: Colors.white)),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text('Save', style: TextStyle(color: Colors.white)),
              onPressed: () async {
                entry.title = _titleController.text;
                entry.content = _contentController.text;
                await _updateJournalEntry(entry);
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  // displays the content of the journal entry
  void _showJournalEntryDetailDialog(JournalEntry entry) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: backgroundColor,
          title: Text(entry.title, style: TextStyle(color: Colors.white)),
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                entry.date
                    .toLocal()
                    .toString()
                    .split(' ')[0], 
                style: TextStyle(color: Colors.grey),
              ),
              SizedBox(height: 8),
              SingleChildScrollView(
                child: Text(
                  entry.content,
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              child: Text('Edit', style: TextStyle(color: Colors.white)),
              onPressed: () {
                Navigator.of(context).pop();
                _showEditJournalEntryDialog(entry);
              },
            ),
            TextButton(
              child: Text('Close', style: TextStyle(color: Colors.white)),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: CustomAppBar(),
      drawer: AppDrawer(),
      body: FutureBuilder<void>(
        future: _initFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(
                child: Text('Error initializing journal',
                    style: TextStyle(color: Colors.white)));
          } else {
            return Column(
              children: [
                Calendar(
                  focusedDay: _focusedDay,
                  selectedDay: _selectedDay,
                  calendarFormat: _calendarFormat,
                  onDaySelected: (selectedDay, focusedDay) {
                    setState(() {
                      _selectedDay = selectedDay;
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
                      final journalEntries =
                          _journalController.getJournalEntries();
                      final filteredEntries = journalEntries.where((entry) {
                        return entry.date.toLocal().toString().split(' ')[0] ==
                            _selectedDay.toLocal().toString().split(' ')[0];
                      }).toList();
                      return Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: GridView.builder(
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 8.0,
                            mainAxisSpacing: 8.0,
                          ),
                          itemCount: filteredEntries.length,
                          itemBuilder: (context, index) {
                            final entry = filteredEntries[index];
                            return GestureDetector(
                              onTap: () => _showJournalEntryDetailDialog(entry),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: boxColor,
                                  borderRadius: BorderRadius.circular(12.0),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        entry.title,
                                        style: TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        entry.date
                                            .toLocal()
                                            .toString()
                                            .split(' ')[0], // Display the date
                                        style: TextStyle(color: Colors.grey),
                                      ),
                                      SizedBox(height: 4),
                                      Expanded(
                                        child: SingleChildScrollView(
                                          child: Text(
                                            entry.content,
                                            style:
                                                TextStyle(color: Colors.white),
                                          ),
                                        ),
                                      ),
                                      Align(
                                        alignment: Alignment.bottomRight,
                                        child: IconButton(
                                          icon: Icon(Icons.delete,
                                              color: Colors.white),
                                          onPressed: () =>
                                              _deleteJournalEntry(entry.id),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
                ),
              ],
            );
          }
        },
      ),
      floatingActionButton: AddButton(
        onPressed: () {
          _showAddJournalEntryDialog();
        },
      ),
      bottomNavigationBar: BottomBar(selectedIndex: 1),
    );
  }
}
