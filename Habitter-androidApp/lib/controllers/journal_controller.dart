/**
 * @author Jakub Pogádl (xpogad00)
 * @file journal_controller.dart
 */
import 'package:hive/hive.dart';
import '../models/journal.dart';

class JournalController {
  static const String _boxName = 'journalBox';
  late Box<JournalEntry> _journalBox;

  // Initialize Hive box
  Future<void> init() async {
    _journalBox = await Hive.openBox<JournalEntry>(_boxName);
  }

  // Get all journal entries
  List<JournalEntry> getJournalEntries() {
    return _journalBox.values.toList();
  }

  // Add a new journal entry
  Future<void> addJournalEntry(JournalEntry entry) async {
    await _journalBox.put(entry.id, entry);
  }

  // Delete a journal entry
  Future<void> deleteJournalEntry(String id) async {
    await _journalBox.delete(id);
  }

  // Update a journal entry
  Future<void> updateJournalEntry(JournalEntry entry) async {
    await _journalBox.put(entry.id, entry);
  }
  
  // Close the box
  Future<void> closeBox() async {
    await _journalBox.close();
  }
}