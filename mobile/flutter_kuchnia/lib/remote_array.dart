import 'dart:convert';

import 'remote.dart' show get, post;

abstract class RemoteArrayRow {
  RemoteArrayRow(this.array, int? id) {
    if (id != null) {
      this.id = id;
    }
  }
  final RemoteArray<RemoteArrayRow> array;
  late final int id;
  void delete() {
    array.data.remove(this);
    array.changes.add({'action': 'delete', 'id': id});
  }

  Map<String, dynamic> toJson();
}

class RemoteArray<T extends RemoteArrayRow> {
  RemoteArray(this.route, this.setState);
  final void Function(void Function()) setState;
  final String route;
  List<Map<String, dynamic>> changes = [];
  List<T> data = [];
  int lastId = 0;
  void refresh() async {
    List<T> newData;
    if (changes.isNotEmpty) {
      newData = await post(route, changes);
    } else {
      newData = await get(route);
    }
    setState(() {
      data = newData;
    });
  }

  void add(T row) {
    row.id = --lastId;
    data.add(row);
    changes.add({'action': 'add', 'values': row.toJson()});
  }
}
