// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'schedule.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ScheduleAdapter extends TypeAdapter<Schedule> {
  @override
  final int typeId = 2;

  @override
  Schedule read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Schedule(
      type: fields[0] as ScheduleType,
      frequency: fields[1] as int,
      frequencyUnit: fields[2] as FrequencyUnit,
      staticDays: (fields[3] as List).cast<int>(),
    );
  }

  @override
  void write(BinaryWriter writer, Schedule obj) {
    writer
      ..writeByte(4)
      ..writeByte(0)
      ..write(obj.type)
      ..writeByte(1)
      ..write(obj.frequency)
      ..writeByte(2)
      ..write(obj.frequencyUnit)
      ..writeByte(3)
      ..write(obj.staticDays);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ScheduleAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class FrequencyUnitAdapter extends TypeAdapter<FrequencyUnit> {
  @override
  final int typeId = 3;

  @override
  FrequencyUnit read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return FrequencyUnit.days;
      case 1:
        return FrequencyUnit.weeks;
      case 2:
        return FrequencyUnit.months;
      default:
        return FrequencyUnit.days;
    }
  }

  @override
  void write(BinaryWriter writer, FrequencyUnit obj) {
    switch (obj) {
      case FrequencyUnit.days:
        writer.writeByte(0);
        break;
      case FrequencyUnit.weeks:
        writer.writeByte(1);
        break;
      case FrequencyUnit.months:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FrequencyUnitAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class ScheduleTypeAdapter extends TypeAdapter<ScheduleType> {
  @override
  final int typeId = 4;

  @override
  ScheduleType read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return ScheduleType.periodic;
      case 1:
        return ScheduleType.statical;
      case 2:
        return ScheduleType.interval;
      default:
        return ScheduleType.periodic;
    }
  }

  @override
  void write(BinaryWriter writer, ScheduleType obj) {
    switch (obj) {
      case ScheduleType.periodic:
        writer.writeByte(0);
        break;
      case ScheduleType.statical:
        writer.writeByte(1);
        break;
      case ScheduleType.interval:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ScheduleTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
