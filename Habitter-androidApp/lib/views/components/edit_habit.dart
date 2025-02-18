/**
 * @author Boris Hatala (xhatal02)
 * @file edit_habit.dart
 */

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:habitter_itu/constants.dart';
import 'package:habitter_itu/controllers/habit_controller.dart';
import 'package:habitter_itu/models/category.dart';
import 'package:habitter_itu/models/habit.dart';
import 'package:habitter_itu/controllers/category_controller.dart';
import 'package:habitter_itu/views/components/add_category.dart';
import 'package:habitter_itu/models/schedule.dart';

class EditHabitDialog extends StatefulWidget {
  final Habit habit;

  EditHabitDialog({required this.habit});

  @override
  _EditHabitDialogState createState() => _EditHabitDialogState();
}

// Init variables
class _EditHabitDialogState extends State<EditHabitDialog> {
  final _formKey = GlobalKey<FormState>();
  String habitName = '';
  String scheduleType = 'Per week/month';
  int frequency = 1;
  String frequencyUnit = 'weeks';
  String frequencyUnitPeriodic = 'week';
  List<int> selectedDays = [];
  bool hasReminder = false;
  TimeOfDay? reminderTime;
  String description = '';
  Category? selectedCategory;

  final CategoryController _categoryController = CategoryController();
  final HabitController _habitController = HabitController();
  List<Category> categories = [];
  List<String> scheduleTypes = ['Per week/month', 'Interval', 'Fixed days'];
  List<String> frequencyUnitsPeriodic = ['week', 'month'];
  List<String> frequencyUnits = ['days', 'weeks', 'months'];

  @override
  void initState() {
    super.initState();
    _loadCategories();
    _habitController.init();
    _initializeFormFields();
  }

  Future<void> _loadCategories() async {
    await _categoryController.init();
    setState(() {
      categories = _categoryController.getCategories();
    });
  }

  // Fill with existing info from a habit
  void _initializeFormFields() {
    final habit = widget.habit;
    habitName = habit.title;
      if (habit.schedule.type == ScheduleType.periodic) {
        scheduleType = 'Per week/month';
      } else if (habit.schedule.type == ScheduleType.interval) {
        scheduleType = 'Interval';
      } else {
        scheduleType = 'Fixed days';
      }
    frequency = habit.schedule.frequency;
    frequencyUnit = habit.schedule.frequencyUnit.toString().split('.').last;
    frequencyUnitPeriodic = habit.schedule.frequencyUnit == FrequencyUnit.weeks ? 'week' : 'month';
    if (habit.schedule.type == ScheduleType.statical) {
      selectedDays = habit.schedule.staticDays;
    }
    hasReminder = habit.reminder;
    reminderTime = TimeOfDay.fromDateTime(habit.reminderTime);
    description = habit.description;
    selectedCategory = habit.category;

    
    if (!scheduleTypes.contains(scheduleType)) {
      scheduleType = scheduleTypes.first;
    }
    if (!frequencyUnits.contains(frequencyUnit)) {
      frequencyUnit = frequencyUnits.first;
    }
    if (!frequencyUnitsPeriodic.contains(frequencyUnitPeriodic)) {
      frequencyUnitPeriodic = frequencyUnitsPeriodic.first;
    }
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      ScheduleType type;
      if (scheduleType == 'Per week/month') {
        type = ScheduleType.periodic;
        frequencyUnit = frequencyUnitPeriodic;
      } else if (scheduleType == 'Interval') {
        type = ScheduleType.interval;
      } else {
        type = ScheduleType.statical;
      }

      FrequencyUnit freqUnit;
      if (frequencyUnit == 'weeks' || frequencyUnit == 'week') {
        freqUnit = FrequencyUnit.weeks;
      } else if (frequencyUnit == 'months' || frequencyUnit == 'month') {
        freqUnit = FrequencyUnit.months;
      } else {
        freqUnit = FrequencyUnit.days;
      }

      final newSchedule = Schedule(
        type: type,
        frequency: frequency,
        frequencyUnit: freqUnit,
        staticDays: selectedDays,
      );

      final updatedHabit = Habit(
        title: habitName,
        schedule: newSchedule,
        category: selectedCategory!,
        description: description,
        reminder: hasReminder,
        reminderTime: reminderTime != null
            ? DateTime(0, 0, 0, reminderTime!.hour, reminderTime!.minute)
            : DateTime.now(),
      );

      updatedHabit.id = widget.habit.id;

      _habitController.updateHabit(widget.habit.id, updatedHabit);

      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: Theme.of(context).copyWith(
        dialogBackgroundColor: backgroundColor,
      ),
      child: AlertDialog(
        titlePadding: EdgeInsets.zero,
        title: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: SvgPicture.asset(
                      'assets/chevron-left.svg',
                      height: 24.0,
                      width: 24.0,
                      colorFilter:
                          const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                    ),
                  ),
                  const Text(
                    'Edit Habit',
                    style: TextStyle(color: Colors.white),
                  ),
                  GestureDetector(
                    onTap: _submitForm,
                    child: SvgPicture.asset(
                      'assets/check.svg',
                      height: 24.0,
                      width: 24.0,
                      colorFilter:
                          const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(color: Colors.grey, thickness: 1),
            const Padding(
              padding: const EdgeInsets.all(16.0),
              child: const Center(
                child: Text(
                  'Choose a Category:',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.add, color: Colors.white),
                    onPressed: () async {
                      final newCategory = await showDialog<Category>(
                        context: context,
                        builder: (_) => AddCategoryDialog(),
                      );
                      if (newCategory != null) {
                        setState(() {
                          _categoryController.addCategory(newCategory);
                          categories.add(newCategory);
                        });
                      }
                    },
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: categories.map((category) {
                          return Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 4.0),
                            child: ChoiceChip(
                              label: Text(category.name),
                              selected: selectedCategory!.id == category.id,
                              onSelected: (bool selected) {
                                setState(() {
                                  selectedCategory = selected ? category : null;
                                });
                              },
                              backgroundColor: boxColor,
                              labelStyle: const TextStyle(color: Colors.white),
                              selectedColor: orangeColor,
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildTextField(
                  label: "Name...",
                  initialValue: habitName,
                  onSaved: (value) => habitName = value!,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a habit name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16.0),

                _buildDropdown(
                  label: 'Schedule Type',
                  value: scheduleType,
                  items: scheduleTypes,
                  onChanged: (newValue) => setState(() {
                    scheduleType = newValue!;
                  }),
                ),
                if (scheduleType == 'Per week/month')
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: _buildTextField(
                          label: "",
                          initialValue: frequency.toString(),
                          onSaved: (value) => frequency = int.tryParse(value!) ?? 1,
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      const Align(
                        alignment: Alignment.center,
                        child: Text(
                          'times per',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: _buildDropdown(
                          label: '',
                          value: frequencyUnitPeriodic,
                          items: frequencyUnitsPeriodic,
                          onChanged: (newValue) => setState(() {
                            frequencyUnitPeriodic = newValue!;
                          }),
                        ),
                      ),
                    ],
                  ),

                if (scheduleType == 'Interval')
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Align(
                        alignment: Alignment.center,
                        child: Text(
                          'Every',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: _buildTextField(
                          label: "",
                          initialValue: frequency.toString(), // Set initial value
                          onSaved: (value) => frequency = int.tryParse(value!) ?? 1,
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: _buildDropdown(
                          label: '',
                          value: frequencyUnit,
                          items: frequencyUnits,
                          onChanged: (newValue) => setState(() {
                            frequencyUnit = newValue!;
                          }),
                        ),
                      ),
                    ],
                  ),

                if (scheduleType == 'Fixed days')
                  Row(
                    children: [
                      const SizedBox(width: 8.0),
                      const Text(
                        'Every ',
                        style: TextStyle(color: Colors.white),
                      ),
                      Expanded(child: _buildDayButtons())
                    ],
                  ),

                const SizedBox(height: 16.0),
                _buildSwitch(
                  label: 'Reminder:',
                  value: hasReminder,
                  onChanged: (newValue) => setState(() {
                    hasReminder = newValue;
                  }),
                ),
                if (hasReminder)
                  TextButton(
                    onPressed: () async {
                      final TimeOfDay? picked = await showTimePicker(
                        context: context,
                        initialTime: reminderTime ?? TimeOfDay.now(),
                      );
                      if (picked != null) {
                        setState(() {
                          reminderTime = picked;
                        });
                      }
                    },
                    child: Text(
                      reminderTime != null
                          ? reminderTime!.format(context)
                          : 'Set Time',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),

                const SizedBox(height: 16.0),
                _buildTextField(
                  label: "Description...",
                  initialValue: description,
                  onSaved: (value) => description = value!,
                  maxLines: 3,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required FormFieldSetter<String> onSaved,
    FormFieldValidator<String>? validator,
    int maxLines = 1,
    String? initialValue,
  }) {
    return TextFormField(
      onSaved: onSaved,
      validator: validator,
      maxLines: maxLines,
      initialValue: initialValue, // Set initial value
      style: TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: label,
        hintStyle: TextStyle(color: Colors.white),
        filled: true,
        fillColor: boxColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        DropdownButton<String>(
          value: value,
          onChanged: onChanged,
          items: items
              .map((item) => DropdownMenuItem<String>(
                    value: item,
                    child: Text(item, style: const TextStyle(color: Colors.white)),
                  ))
              .toList(),
          dropdownColor: boxColor,
          borderRadius: BorderRadius.circular(12.0),
        ),
      ],
    );
  }

  Widget _buildSwitch({
    required String label,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        Switch(
          value: value,
          onChanged: onChanged,
          activeColor: orangeColor,
        ),
      ],
    );
  }

  Widget _buildDayButtons() {
    final daysOfWeek = {
      'Mon': 1,
      'Tue': 2,
      'Wed': 3,
      'Thu': 4,
      'Fri': 5,
      'Sat': 6,
      'Sun': 7,
    };

    return Container(
      padding: EdgeInsets.all(4.0),
      height: 100,
      child: Row(
        children: daysOfWeek.keys.map((day) {
          return Expanded(
            child: Container(
              height: 100,
              padding: EdgeInsets.only(left: 4.0),
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    int dayValue = daysOfWeek[day]!;
                    if (selectedDays.contains(dayValue)) {
                      selectedDays.remove(dayValue);
                    } else {
                      selectedDays.add(dayValue);
                    }
                    print(
                        'Selected days: $selectedDays');
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: selectedDays.contains(daysOfWeek[day])
                      ? orangeColor
                      : boxColor,
                  foregroundColor: Colors.white,
                  shape: CircleBorder(),
                  minimumSize:
                      Size(40, 40),
                  padding: EdgeInsets.zero,
                ),
                child: Text(
                  day,
                  style: TextStyle(fontSize: 12),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}