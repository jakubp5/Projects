/**
 * @author Jakub Pogadl(xpogad00)
 * @file profile_page.dart
 */

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:habitter_itu/constants.dart';
import 'package:habitter_itu/models/profile.dart';
import 'package:habitter_itu/controllers/profile_service.dart';
import 'package:habitter_itu/views/components/appbar.dart';
import 'package:habitter_itu/views/components/app_drawer.dart';
import 'package:habitter_itu/views/components/bottom_bar.dart';

class ProfilePage extends StatefulWidget {
  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late ProfileService _profileService;
  Profile? _profile;
  late TextEditingController _bioController;

  @override
  void initState() {
    super.initState();
    _profileService = ProfileService();
    _bioController = TextEditingController();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    Profile? profile = await _profileService.getProfile();
    setState(() {
      _profile = profile ??
          Profile(
              name: "Enter Name",
              gender: "Gender",
              dateOfBirth: DateTime.now(),
              bio: "Enter Bio");
      _bioController.text = _profile!.bio ?? '';
    });
  }


  // functions to change profile data
  void _changeName(String newName) {
    setState(() {
      _profile?.name = newName;
    });
    _saveProfile();
  }

  void _changeGender(String newGender) {
    setState(() {
      _profile?.gender = newGender;
    });
    _saveProfile();
  }

  void _changeDateOfBirth(DateTime newDateOfBirth) {
    setState(() {
      _profile?.dateOfBirth = newDateOfBirth;
    });
    _saveProfile();
  }

  void _changeBio(String newBio) {
    setState(() {
      _profile?.bio = newBio;
    });
    _saveProfile();
  }

  Future<void> _saveProfile() async {
    if (_profile != null) {
      await _profileService.saveProfile(_profile!);
    }
  }

  void _showEditDialog() {
   
   // Text editing controllers for the profile fields
    TextEditingController nameController =
        TextEditingController(text: _profile?.name);
    TextEditingController genderController =
        TextEditingController(text: _profile?.gender);
    TextEditingController dateOfBirthController = TextEditingController(
        text: _profile?.dateOfBirth.toLocal().toString().split(' ')[0]);
    TextEditingController bioController =
        TextEditingController(text: _profile?.bio ?? '');

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: habitColor,
          title: Text('Edit Profile', style: TextStyle(color: Colors.white)),
          content: SingleChildScrollView(
            child: Column(
              children: [
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    labelText: 'Name',
                    labelStyle: TextStyle(color: Colors.white),
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                  ),
                  style: TextStyle(color: Colors.white),
                ),
                SizedBox(height: 8),
                TextField(
                  controller: genderController,
                  decoration: InputDecoration(
                    labelText: 'Gender',
                    labelStyle: TextStyle(color: Colors.white),
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                  ),
                  style: TextStyle(color: Colors.white),
                ),
                SizedBox(height: 8),
                TextField(
                  controller: dateOfBirthController,
                  decoration: InputDecoration(
                    labelText: 'Date of Birth',
                    labelStyle: TextStyle(color: Colors.white),
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                  ),
                  style: TextStyle(color: Colors.white),
                  onTap: () async {
                    DateTime? pickedDate = await showDatePicker(
                      context: context,
                      initialDate: _profile?.dateOfBirth ?? DateTime.now(),
                      firstDate: DateTime(1900),
                      lastDate: DateTime.now(),
                      builder: (BuildContext context, Widget? child) {
                        return Theme( //modify the theme of the date picker
                          data: ThemeData.light().copyWith(
                            colorScheme: ColorScheme.dark(
                              primary: habitColor, 
                              onPrimary: Colors.white, 
                              onSurface: Colors.white, 
                            ),
                            dialogBackgroundColor:
                                Colors.white, 
                          ),
                          child: child!,
                        );
                      },
                    );
                    if (pickedDate != null) {
                      dateOfBirthController.text =
                          pickedDate.toLocal().toString().split(' ')[0];
                    }
                  },
                ),
                SizedBox(height: 8),
                TextField(
                  controller: bioController,
                  decoration: InputDecoration(
                    labelText: 'Bio',
                    labelStyle: TextStyle(color: Colors.white),
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                  ),
                  style: TextStyle(color: Colors.white),
                ),
              ],
            ),
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
              onPressed: () {
                _changeName(nameController.text);
                _changeGender(genderController.text);
                _changeDateOfBirth(DateTime.parse(dateOfBirthController.text));
                _changeBio(bioController.text);
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
    
    // Show loading indicator if profile is not loaded
    if (_profile == null) {
      return Scaffold(
        backgroundColor: backgroundColor,
        appBar: CustomAppBar(),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: CustomAppBar(),
      drawer: AppDrawer(),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: habitColor, 
                        borderRadius:
                            BorderRadius.circular(8.0),
                      ),
                      child: SvgPicture.asset(
                        'assets/profile.svg',
                        fit: BoxFit.cover,
                      ),
                    ),
                    SizedBox(width: 16),
                    // Display profile information
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _profile!.name,
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          _profile!.gender,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                        Text(
                          _profile!.dateOfBirth
                              .toLocal()
                              .toString()
                              .split(' ')[0],
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                SizedBox(height: 16),
                Container(
                  padding: EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: habitColor,
                    borderRadius: BorderRadius.circular(8.0), 
                    border: Border.all(
                        color: Colors.white), 
                  ),
                  child: Text(
                    _profile!.bio ?? '',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16.0,
                    ),
                  ),
                ),
                SizedBox(height: 16),
              ],
            ),
          ),
          
          Positioned( // position the edit button
            top: 16,
            right: 16,
            child: IconButton(
              icon: Icon(Icons.edit),
              onPressed: _showEditDialog,
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomBar(selectedIndex: 1),
    );
  }
}
