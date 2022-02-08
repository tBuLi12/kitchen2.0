from flask import (
    Flask,
    json,
    request,
    session,
)
from threading import Lock
import datetime
from database import DbCursor, init as dbInit, close as dbClose
import bcrypt
from time import time
from string import printable
from random import choice


app = Flask(__name__)
app.secret_key = '1k09&ebq17&bd(o]=aQ!$bb'

suToken = None
suTokenLock = Lock()



def pullDishes(user):
    with DbCursor() as cursor:
        cursor.execute("select dish_id, name, last_made from dishes where user_id = %s order by last_made", (user,))
        recipeNames = cursor.fetchall()
    return [
        {"name": name, "lastMade": last.strftime("%m/%d/%Y"), "id": id}
        for id, name, last in recipeNames
    ]

def resetDate(dish, user):
    with DbCursor() as cursor:
        cursor.execute("update dishes set last_made = sysdate() where dish_id = %s and user_id = %s", (dish, user))

def addRecipe(name, user):
    with DbCursor() as cursor:
        cursor.execute("insert into dishes (name, last_made, user_id) values (%s, sysdate(), %s)", (name, user))

def pullList(user):
    with DbCursor() as cursor:
        cursor.execute("select list_item_id, name, quantity, unit, checked from lists where user_id = %s order by checked, name", (user,))
        recipeNames = cursor.fetchall()
    return [
        {"name": name, "quantity": quantity, "id": id, "unit": unit, "checked": checked}
        for id, name, quantity, unit, checked in recipeNames
    ]

def addToList(name, quantity, unit, user):
    with DbCursor() as cursor:
        cursor.execute("insert into lists (name, quantity, unit, user_id) values (%s, %s, %s, %s)", (name, quantity, unit, user))

def toggleCheck(product):
    with DbCursor() as cursor:
        cursor.execute("update lists set checked = if (checked, false, true) where list_item_id = %s", (product,))


# def recipeSetdate(name):
#     with DbCursor() as cursor:
#         args = (datetime.date.today().strftime('%Y-%m-%d'), name, session['username'])
#         cursor.execute("UPDATE recipes SET last=%s WHERE name=%s AND userid=(SELECT id FROM users WHERE username=%s)", args)
#         DbCursor().commit()


# def addRecipe(name):
#     with DbCursor() as cursor:
#         cursor.execute("INSERT INTO recipes (name, userid) VALUES (%s, (SELECT id FROM users WHERE username=%s))", (name, session['username']))
#         DbCursor().commit()


def authenticate(username, password):
    with DbCursor() as cursor:
        cursor.execute("select user_id, passhash from users where username=%s", (username,))
        row = cursor.fetchone()
    if row:
        user_id, passHash = row
        if bcrypt.checkpw(password, passHash):
            return user_id
    return None


def signUp(username, password):
    passhash = bcrypt.hashpw(password, bcrypt.gensalt())
    with DbCursor() as cursor:
        cursor.execute("insert into users (username, passhash) values (%s, %s)", (username, passhash))


@app.route('/dishes', methods=['GET', 'POST'])
def dishes():
    if 'user_id' not in session:
        return 'not logged in', 401
    if request.method == 'POST':
        body = request.get_json()
        if body["actionName"] == "done":
            resetDate(body["data"], session['user_id'])
        elif body["actionName"] == "add":
            addRecipe(body["data"], session['user_id'])

    return json.dumps(pullDishes(session['user_id']))

@app.route('/list', methods=['GET', 'POST'])
def lists():
    if 'user_id' not in session:
        return 'not logged in', 401
    if request.method == 'POST':
        body = request.get_json()
        if body["actionName"] == "toggle":
            toggleCheck(body["data"])
        elif body["actionName"] == "add":
            data = body["data"]
            addToList(data["name"], data["quantity"], data["unit"], session['user_id'])
 
    return json.dumps(pullList(session['user_id']))

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
    if session["username"] == "admin":
        signUp(request.form['username'], request.form['password'])
        return 'ok'
    return 'only admin can sign up', 401
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
    user_id = authenticate(request.form['username'], request.form['password'])
    if user_id:
        session['username'] = request.form['username']
        session['user_id'] = user_id
        return "ok"
    return "Invalid credentials", 401


@app.route('/logout', methods=['GET'])
def logoutRoute():
    if 'username' in session:
        session.pop('username')
        session.pop('user_id')
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
    dbInit()
    app.run()
    dbClose()
