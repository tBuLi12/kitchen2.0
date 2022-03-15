import 'dart:convert';
import 'package:http/http.dart' as http;

const String url = 'tbuli12.pythonanywhere.com';

late http.Client client = http.Client();
String? sessionId;

Future<String> getSession() async {
  final loginRequest = http.MultipartRequest('POST', Uri.https(url, 'login'))
    ..fields['username'] = 'bony'
    ..fields['password'] = 'niepotrzebne';
  return (await client.send(loginRequest)).headers['set-cookie']!;
}

Future<dynamic> get(String route) async {
  sessionId ??= await getSession();
  return jsonDecode(
      (await client.get(Uri.https(url, route), headers: {'Cookie': sessionId!}))
          .body);
}

Future<dynamic> post(String route, dynamic json) async {
  sessionId ??= await getSession();
  return jsonDecode((await client.post(Uri.https(url, route),
          headers: {'Cookie': sessionId!, 'Content-Type': 'application/json'},
          body: jsonEncode(json)))
      .body);
}
