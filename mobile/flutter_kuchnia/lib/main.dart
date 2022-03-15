import 'package:flutter/material.dart';
import 'dishes.dart';

void main() {
  runApp(const KitchenApp());
}

class KitchenApp extends StatefulWidget {
  const KitchenApp({Key? key}) : super(key: key);

  @override
  State<KitchenApp> createState() => _KitchenAppState();
}

class _KitchenAppState extends State<KitchenApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: DefaultTabController(
        child: Scaffold(
          appBar: AppBar(
            bottom: const TabBar(tabs: [Text('Dishes'), Text('List')]),
            elevation: 1,
          ),
          body: const TabBarView(children: [
            Align(child: Dishes(), alignment: Alignment.topCenter),
            Text('data')
          ]),
        ),
        length: 2,
      ),
      theme: ThemeData(
          primaryColor: const Color.fromARGB(255, 24, 78, 119),
          cardColor: const Color.fromARGB(255, 149, 246, 233),
          scaffoldBackgroundColor: const Color.fromARGB(255, 24, 78, 119),
          appBarTheme: const AppBarTheme(
              color: Color.fromARGB(255, 153, 217, 140),
              foregroundColor: Colors.black),
          popupMenuTheme: const PopupMenuThemeData(color: Colors.white),
          tabBarTheme: const TabBarTheme(labelColor: Colors.black),
          textTheme: const TextTheme(
              headline6: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 19))),
    );
  }

  @override
  void initState() {
    super.initState();
    print('app init');
  }

  @override
  void dispose() {
    super.dispose();
    print('app unmount');
  }
}
