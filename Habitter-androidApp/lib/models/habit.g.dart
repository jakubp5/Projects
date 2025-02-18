// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'habit.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class HabitAdapter extends TypeAdapter<Habit> {
  @override
  final int typeId = 0;

  @override
  Habit read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Habit(
      title: fields[0] as String,
      schedule: fields[2] as Schedule,
      reminder: fields[3] as bool,
      description: fields[4] as String,
      reminderTime: fields[5] as DateTime?,
      startDate: fields[6] as DateTime?,
      category: fields[7] as Category,
    )..completionStatus = (fields[1] as Map).cast<String, bool>();
  }

  @override
  void write(BinaryWriter writer, Habit obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.title)
      ..writeByte(1)
      ..write(obj.completionStatus)
      ..writeByte(2)
      ..write(obj.schedule)
      ..writeByte(3)
      ..write(obj.reminder)
      ..writeByte(4)
      ..write(obj.description)
      ..writeByte(5)
      ..write(obj.reminderTime)
      ..writeByte(6)
      ..write(obj.startDate)
      ..writeByte(7)
      ..write(obj.category);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HabitAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
