from flask import (
    Flask,
    json,
    request,
    session,
)
from threading import Lock
import datetime
from database import dbConnection
import bcrypt
from time import time
from string import printable
from random import choice


app = Flask(__name__)
app.secret_key = '1k09&ebq17&bd(o]=aQ!$bb'

suToken = None
suTokenLock = Lock()



def pullDishes():
    with dbConnection as cursor:
        cursor.execute("SELECT id, name, last_made FROM dishes ORDER BY last_made")
        recipeNames = cursor.fetchall()
    return [
        {"name": name, "lastMade": last.strftime("%m/%d/%Y"), "id": id}
        for id, name, last in recipeNames
    ]

def resetDate(id):
    with dbConnection as cursor:
        cursor.execute("UPDATE dishes SET last_made = sysdate() WHERE id = %s", (id,))
        dbConnection.commit()


# def recipeSetdate(name):
#     with dbConnection as cursor:
#         args = (datetime.date.today().strftime('%Y-%m-%d'), name, session['username'])
#         cursor.execute("UPDATE recipes SET last=%s WHERE name=%s AND userid=(SELECT id FROM users WHERE username=%s)", args)
#         dbConnection.commit()


# def addRecipe(name):
#     with dbConnection as cursor:
#         cursor.execute("INSERT INTO recipes (name, userid) VALUES (%s, (SELECT id FROM users WHERE username=%s))", (name, session['username']))
#         dbConnection.commit()


def authenticate(username, password):
    with dbConnection as cursor:
        cursor.execute("SELECT passhash FROM users WHERE username=%s", (username,))
        result = cursor.fetchone()
        if not result:
            return False
        passHash = result[0]
    return bcrypt.checkpw(password, passHash)


def signUp(username, password):
    passhash = bcrypt.hashpw(password, bcrypt.gensalt())
    with dbConnection as cursor:
        cursor.execute("INSERT INTO users (username, passhash) VALUES (%s, %s)", (username, passhash))
        dbConnection.commit()

@app.route('/dishes', methods=['GET', 'POST'])
def dishes():
    if request.method == 'POST':
        body = request.get_json()["data"]
        if body["actionName"] == "done":
            resetDate(body["data"])
    return json.dumps(pullDishes())



# @app.route('/token', methods=['GET'])
# def getToken():
#     if 'username' not in session or session['username'] != 'jeremi':
#         return 'Permission denied.'
#     global suToken
#     token = ''.join([choice(printable) for i in range(10)])
#     with suTokenLock:
#         suToken = (time(), token)
#     return token


# @app.route('/', methods=['GET'])
# def homeRoute():
#     if 'username' in session:
#         return render_template('index.html', loggedin=True, username=session['username'])
#     else:
#         return redirect(url_for('loginRoute'))


# @app.route('/verify', methods=['POST'])
# def verifySessionRoute():
#     if 'username' in session and session['username'] == request.form['name']:
#         return 'true'
#     return 'false'


@app.route('/signup', methods=['POST'])
def signupRoute():
    # if session["username"] == "admin"
    signUp(request.form['username'], request.form['password'])
    return 'ok'
    # global suToken
    # if request.method == 'GET':
    #     return render_template('signup.html', loggedin=None)
    # if request.method == 'POST':
    #     token = request.form['token']
    #     if suToken and token == suToken[1]:
    #         if time() - suToken[0] < 60:
    #             flash('Sign up successful.')
    #             return redirect(url_for('loginRoute'))
    #         else:
    #             flash('token expired')
    #     else:
    #         flash('invalid token')
    #     return redirect(url_for('signupRoute'))


@app.route('/login', methods=['POST'])
def loginRoute():
    if authenticate(request.form['username'], request.form['password']):
        session['username'] = request.form['username']
        return "ok"
    return "Invalid credentials", 401


@app.route('/logout', methods=['GET'])
def logoutRoute():
    if 'username' in session:
        session.pop('username', None)
    return 'ok'


# @app.route('/recipes', methods=['GET', 'POST'])
# def recipesRoute():
#     if 'username' not in session:
#         return 'Not logged in'
#     if request.method == 'GET':
#         return json.dumps(pullRecipes())
#     if request.method == 'POST':
#         try:
#             if request.form["op"] == "new":
#                 addRecipe(request.form["name"])
#                 return "added"
#             else:
#                 recipeSetdate(request.form["name"])
#         except Exception as e:
#             return str(e)
#         return "date set"


if __name__ == '__main__':
    app.run()
