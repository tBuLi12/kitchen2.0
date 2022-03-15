import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'remote.dart' show fetchDishes, client;
import 'remote_array.dart' show RemoteArray, RemoteArrayRow;

class Dish extends RemoteArrayRow {
  Dish(this._name, this._lastMade, RemoteArray<Dish> array, {int? id})
      : super(array, id);
  factory Dish.fromJSON(Map<String, dynamic> json, RemoteArray<Dish> array) {
    return Dish(json['name'], json['lastMade'], array, id: json['id']);
  }

  String get lastMade {
    var date = DateTime.parse(_lastMade);
    var timeDiff = DateTime.now().difference(date);
    if (timeDiff < const Duration(days: 1)) {
      return 'Today';
    }
    if (timeDiff < const Duration(days: 2)) {
      return 'Yesterday';
    }
    if (timeDiff < const Duration(days: 7)) {
      return DateFormat('EEEE').format(date);
    }
    return DateFormat('d MMM').format(date);
  }

  set lastMade(String date) {
    var value = date.split('T')[0];
    _lastMade = value;
    array.changes.add({
      'action': 'update',
      'values': {'lastMade': value}
    });
  }

  String get name {
    return _name;
  }

  @override
  Map<String, dynamic> toJson() {
    return {'id': id, 'name': _name, 'lastMade': _lastMade};
  }

  String _name;
  String _lastMade;
}

class Dishes extends StatefulWidget {
  const Dishes({Key? key}) : super(key: key);

  @override
  State<Dishes> createState() => _DishesState();
}

class _DishesState extends State<Dishes> {
  late var dishes = RemoteArray<Dish>('dishes', setState);
  String newName = '';

  @override
  Widget build(BuildContext context) {
    var addButton = Container(
      child: TextButton(
          onPressed: () => showDialog(
              context: context,
              builder: (context) => AddForm((name) => setState(() {
                    dishes.add(
                        Dish(name, DateTime.now().toIso8601String(), dishes));
                  }))),
          child: const Text(
            '+',
            style: TextStyle(color: Colors.black),
          )),
      width: 30,
      height: 30,
      margin: const EdgeInsets.only(top: 10, left: 5),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.all(Radius.circular(2)),
      ),
    );
    var children = dishes.data.isEmpty
        ? [addButton]
        : [
            const SizedBox(
              width: 30,
              height: 30,
            ),
            Container(
              child: ListView.builder(
                  itemBuilder: (_, i) => Container(
                        child: PopupMenuButton(
                          itemBuilder: (context) => [
                            PopupMenuItem(
                              child: const Text('Done'),
                              onTap: () => setState(() {
                                dishes.data[i].lastMade =
                                    DateTime.now().toIso8601String();
                              }),
                            ),
                          ],
                          child: Column(children: [
                            Text(dishes.data[i].name),
                            Text(dishes.data[i].lastMade)
                          ]),
                        ),
                        padding: const EdgeInsets.all(7),
                        margin: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius:
                              const BorderRadius.all(Radius.circular(2)),
                        ),
                      ),
                  itemCount: dishes.data.length),
              width: 200,
              padding: const EdgeInsets.only(top: 5),
            ),
            addButton
          ];
    return Row(
      children: children,
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
    );
  }

  @override
  void initState() {
    super.initState();
    dishes.refresh();
  }

  @override
  void dispose() {
    super.dispose();
    client.close();
  }
}

class AddForm extends StatefulWidget {
  final void Function(String) onAdd;
  const AddForm(this.onAdd, {Key? key}) : super(key: key);

  @override
  State<AddForm> createState() => _AddFormState();
}

class _AddFormState extends State<AddForm> {
  final controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return SimpleDialog(
      contentPadding: const EdgeInsets.all(10),
      title: const Text('Add dish'),
      children: [
        TextField(
          controller: controller,
        ),
        TextButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                widget.onAdd(controller.text);
                Navigator.pop(context, true);
              }
            },
            child: const Text('Add'))
      ],
    );
  }
}
