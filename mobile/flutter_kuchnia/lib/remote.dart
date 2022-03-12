import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dishes.dart' show Dish;

const String url = 'tbuli12.pythonanywhere.com';

http.Client? client;
String? sessionId;

Future<List<Dish>> fetchDishes() async {
  if (client == null) {
    client = http.Client();
    final loginRequest = http.MultipartRequest('POST', Uri.https(url, 'login'))
    ..fields['username'] = 'bony'
    ..fields['password'] = 'niepotrzebne';
    sessionId = (await client!.send(loginRequest)).headers['set-cookie'];
  }
  final response = await client!.get(Uri.https(url, 'dishes'), headers: {'Cookie': sessionId!});
  if (response.statusCode == 200) {
    final List<dynamic> jsonArr = jsonDecode(response.body);
    return jsonArr.map((dish) => Dish.fromJSON(dish)).toList();
  }
  throw Exception('Error fetching data ${response.statusCode}');
}