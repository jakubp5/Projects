/**
 * @author Boris Hatala (xhatal02) Jakub Pogádl (xpogad00) Boris Semanco(xseman06)
 * @file habit.dart
 */
import 'package:hive/hive.dart';

part 'profile.g.dart';

@HiveType(typeId: 6)
class Profile extends HiveObject {
  @HiveField(0)
  String name;

  @HiveField(1)
  String gender;

  @HiveField(2)
  DateTime dateOfBirth;

  @HiveField(3)
  String? bio;

  Profile({
    required this.name,
    required this.gender,
    required this.dateOfBirth,
    required this.bio,
  });
}