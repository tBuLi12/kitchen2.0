import 'package:flutter/material.dart';
import 'dishes.dart';

void main() {
  runApp(const KitchenApp());
}

class KitchenApp extends StatelessWidget {
  const KitchenApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Kuchnia'),
          backgroundColor: const Color.fromRGBO(255, 0, 0, 1),
          elevation: 1,
        ),
        body: const Dishes(),
      ),
    );
  }
}

