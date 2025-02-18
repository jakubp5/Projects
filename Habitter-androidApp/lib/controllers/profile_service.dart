/**
 * @author Jakub Pogádl (xpogad00)
 * @file category_controller.dart
 */

import 'package:hive/hive.dart';
import '../models/profile.dart';

class ProfileService {
  static const String _boxName = 'profileBox';

  Future<void> saveProfile(Profile profile) async {
    var box = await Hive.openBox<Profile>(_boxName);
    await box.put('profile', profile);
  }

  Future<Profile?> getProfile() async {
    var box = await Hive.openBox<Profile>(_boxName);
    return box.get('profile');
  }

  Future<void> deleteProfile() async {
    var box = await Hive.openBox<Profile>(_boxName);
    await box.delete('profile');
  }

  Future<void> clearProfile() async {
    var box = await Hive.openBox<Profile>(_boxName);
    await box.clear();
  }
}