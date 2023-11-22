from flask import Flask,request
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
import psycopg2
import psycopg2.extras
from datetime import datetime as dt
import random


CREATE_USERS_TABLE = (
    """CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT ,user_name TEXT, password TEXT);"""
)

CREATE_SETTINGS_TABLE = """CREATE TABLE IF NOT EXISTS settings (user_id INTEGER, start_date TIMESTAMP,
                        end_date TIMESTAMP, ticker TEXT, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);"""

CREATE_WATCHLIST_TABLE = """CREATE TABLE IF NOT EXISTS watchlist (user_id INTEGER, ticker TEXT, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);"""

INSERT_USER_RETURN_ID = "INSERT INTO users (name, user_name, password) VALUES (%s, %s, %s) RETURNING id;"

INSERT_WATCHLIST = "INSERT INTO watchlist (user_id, ticker) VALUES (%s, %s);"

INSERT_SETTINGS = "INSERT INTO settings (user_id, start_date, end_date, ticker) VALUES (%s, %s, %s, %s)"

GLOBAL_USER = """SELECT * FROM users"""

GLOBAL_SETTING = """SELECT * FROM settings"""

GLOBAL_WATCHLIST ="""SELECT * FROM watchlist"""

SINGLE_USER = """SELECT * FROM users WHERE user_name = %s AND password = %s"""

SINGLE_SETTING = """SELECT * FROM settings WHERE user_id = %s"""

SINGLE_WATCHLIST = """SELECT * FROM watchlist WHERE user_id = %s"""

UPDATE_SETTING = """UPDATE settings SET start_date =%s, end_date=%s, ticker=%s  WHERE user_id = %s"""

DELETE_SETTING = """DELETE FROM settings WHERE user_id = %s"""




load_dotenv()

base_url = os.getenv('URL')
api = os.getenv('API_KEY')
temp =os.getenv('temp_key')
db = os.getenv('DB_NAME')
user_name = os.getenv('USER')
passwaord = os.getenv('PASSWORD')
host = os.getenv('HOST')


connection = psycopg2.connect(database=db,
                        user=user_name,
                        password=passwaord,
                        host=host)

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

def int_func(tick):
    url = "%sfunction=TIME_SERIES_DAILY&symbol=%s&apikey=%s" %(base_url, tick, api)
    r = requests.get(url)
    data = r.json()
    last_date = list(data['Time Series (Daily)'])[0]
    latest_data = data['Time Series (Daily)'][last_date]
    print("int_function", latest_data)
    return {tick: {
        "1. open": str(round(float(latest_data['1. open']), 2)),
        "2. high": str(round(float(latest_data['2. high']), 2)),
        "3. low": str(round(float(latest_data['3. low']), 2)),
        "4. close": str(round(float(latest_data['4. close']), 2))
    }}

@app.post('/api/customTable')
def creat_ticker_table():
    req = request.get_json()
    print(req)
    ticker = req['ticker']
    start_date = dt.strptime(req['start_date'], "%Y-%m-%d")
    end_date = dt.strptime(req['end_date'], "%Y-%m-%d")
    url = "%sfunction=TIME_SERIES_DAILY&symbol=%s&outputsize=full&apikey=%s" %(base_url, ticker, api)
    r = requests.get(url)
    data = r.json()
    res = []
    for (k,v) in data['Time Series (Daily)'].items():
            c = dt.strptime(k, "%Y-%m-%d")
            if(c >= start_date and c <= end_date):
                res.append({k:v})
    sliced = res
    # print(sliced)
    with connection:
        with connection.cursor() as cursor:
            for slice in sliced:
                for date, value in slice.items():
                    CREATE_DYNAMIC_TABLE = f"CREATE TABLE IF NOT EXISTS {ticker} (date TIMESTAMP, open REAL, high REAL, low REAL, close REAL);"
                    cursor.execute(CREATE_DYNAMIC_TABLE)
                    INSERT_DATA = f"INSERT INTO {ticker} (date, open , high, low, close) VALUES(%s, %s, %s, %s, %s);"
                    cursor.execute(INSERT_DATA, (date, value['1. open'], value['2. high'], value['3. low'], value['4. close']))
    return{"message":sliced}


##########################################################################################################################
@app.route("/api/stockFullDaily", methods=['POST'])
def fullDaily():
    req = request.get_json()
    ticker = req['symbol']
    interval = req['interval']
    url = "%sfunction=TIME_SERIES_DAILY&symbol=%s&interval=%s&outputsize=full&apikey=%s" %(base_url, ticker, interval, api)
    r = requests.get(url)
    data = r.json()
    return data['Time Series (Daily)']

@app.post("/api/stockDaily")
def daily():
    req = request.get_json()
    ticker = req['symbol']
    url = "%sfunction=TIME_SERIES_DAILY&symbol=%s&apikey=%s" %(base_url, ticker, temp)
    r = requests.get(url)
    data = r.json()
    sliced = data['Time Series (Daily)']
    return sliced

@app.get("/api/gain")
def gain():
    url = "%sfunction=TOP_GAINERS_LOSERS&apikey=%s" %(base_url, temp)
    r = requests.get(url)
    data = r.json()
    res = []
    # try :
    top_gainers = data['top_gainers'][:5]
    i = 0
    for gain in top_gainers:
        res += [{'id': i, 'ticker':gain['ticker'], 'per':gain['change_percentage']}]
        i += 1
    # except:
    #     ticker = ['TSLA', 'META', 'GS', 'MS']
    #     i = 0
    #     for tick in ticker:
    #         res += [{'id': i, 'ticker': tick, 'per': (str(round(random.uniform(10, 30), 2)) + "%")}]
    #         i += 1
    return res

@app.post("/api/dailyQuote")
def quote():
    req = request.get_json()
    ticker = req['symbol']
    url = "%sfunction=GLOBAL_QUOTE&symbol=%s&apikey=%s" %(base_url, ticker, temp)
    r = requests.get(url)
    data = r.json()
    return data['Global Quote']


@app.route("/api/pinUp", methods=['POST'])
def pinUp():
    req = request.get_json()
    ticker = req['symbol']
    r = int_func(ticker)
    try:
        res = r[ticker]
    except:
        print("error in pinup")
        res =  {
                "1. open":str(round(random.uniform(100, 200), 2)),
                "2. high":str(round(random.uniform(100, 200), 2)),
                "3. low":str(round(random.uniform(100, 200), 2)),
                "4. close":str(round(random.uniform(100, 200), 2))
                }
    return res

@app.route('/api/selected', methods=['POST'])
def selected():
    req = request.get_json()
    ticker = req['symbol']
    start = dt.strptime(req['start_date'], "%Y-%m-%d")
    end = dt.strptime(req['end_date'], "%Y-%m-%d")
    url = "%sfunction=TIME_SERIES_DAILY&symbol=%s&apikey=%s" %(base_url, ticker, temp)
    r = requests.get(url)
    data = r.json()
    res = []
    try:
        for (k,v) in data['Time Series (Daily)'].items():
            c = dt.strptime(k, "%Y-%m-%d")
            if(c >= start and c <= end):
                res.append({k:v})
        return res
    except:
        return data['Time Series (Daily)']


#########################################################################################################################


@app.post("/api/user")
def register():
    data = request.get_json()
    name = data["name"]
    user_name = data["user_name"]
    password = data["password"]
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(CREATE_USERS_TABLE)
            cursor.execute(INSERT_USER_RETURN_ID, (name, user_name, password))
            id = cursor.fetchone()[0]
    return {"id": id, "message":f"User {name} created."}, 201

@app.get("/api/user")
def getUser():
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(GLOBAL_USER)
            user = cursor.fetchall()
    return {"user": user}, 200

@app.post("/api/login")
def userLogin():
    data = request.get_json()
    uname = data['user_name']
    password = data['password']
    with connection:
        with connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(SINGLE_USER, (uname, password))
            user = cursor.fetchone()
    return {"user": {"user_id":user['id'], "name":user["name"], 'message':"success", 'accessToken': "test_access_token" }}, 200


#################################################################################################################################


@app.post("/api/settings")
def postSetting():
    data = request.get_json()
    user_id = data["user_id"]
    start_date = data["start_date"]
    end_date = data["end_date"]
    ticker = data["ticker"]
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(CREATE_SETTINGS_TABLE)
            cursor.execute(INSERT_SETTINGS, (user_id, start_date, end_date, ticker))
    return {"res": f"settings Created at for {user_id}"}, 201


@app.get("/api/settings")
def getSetting():
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(GLOBAL_SETTING)
            setting = cursor.fetchall()
    return {"setting": setting}, 200


@app.get("/api/settings/<int:user_id>")
def getSingleSetting(user_id):
    with connection:
        with connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(SINGLE_SETTING, (user_id,))
            setting = cursor.fetchone()
    return {"setting": {"user_id":setting['user_id'], "start_date":setting['start_date'], "end_date":setting['end_date'], "ticker":setting['ticker']}}, 200


@app.put("/api/settings/<int:user_id>")
def putSetting(user_id):
    data = request.get_json()
    start_date = data['start_date']
    end_date = data['end_date']
    ticker = data['ticker']
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(UPDATE_SETTING, (start_date, end_date, ticker, user_id))
    return {"res": f"settings Updated at for {user_id}"}, 201

@app.delete("/api/settings/<int:user_id>")
def set_delete(user_id):
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(DELETE_SETTING, (user_id,))
    return {"res": f"{user_id} setting deleted"}

###################################################################################################################


@app.post("/api/watchlist")
def postWatchlist():
    data = request.get_json()
    user_id = data["user_id"]
    ticker = data["ticker"]
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(CREATE_WATCHLIST_TABLE)
            cursor.execute(INSERT_WATCHLIST, (user_id, ticker))
    try:
        res = int_func(ticker)
    except:
        print("error in post watchlist")
        res = {
            ticker:
            {
                "1. open":str(round(random.uniform(100, 200), 2)),
                "2. high":str(round(random.uniform(100, 200), 2)),
                '3. low':str(round(random.uniform(100, 200), 2)),
                '4. close':str(round(random.uniform(100, 200), 2))
            }
        }

    return {"res": f"Warchlist Created at for {user_id}", "data": res}, 201


@app.get("/api/watchlist")
def getWatchlist():
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(GLOBAL_WATCHLIST)
            watchlist = cursor.fetchall()
    res = []
    for watch in watchlist:
        try:
            res += [int_func(watch[1])]
        except:
            print("error in get watchlist")
            res.append({
                watch[1]:
                {
                    "1. open":str(round(random.uniform(100, 200), 2)),
                    "2. high":str(round(random.uniform(100, 200), 2)),
                    '3. low':str(round(random.uniform(100, 200), 2)),
                    '4. close':str(round(random.uniform(100, 200), 2))
                }
            })

    return {"watchlist": res}, 200


@app.get("/api/watchlist/<int:user_id>")
def getSingleWatchlist(user_id):
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(SINGLE_WATCHLIST, (user_id,))
            watchlist = cursor.fetchall()
    res = []
    for watch in watchlist:
        try :
            res += [int_func(watch[1])]
        except:
            print("something wrong in watchlist")
            res.append({
                        watch[1]:
                        {
                            "1. open":str(round(random.uniform(100, 200), 2)),
                            "2. high":str(round(random.uniform(100, 200), 2)),
                            '3. low':str(round(random.uniform(100, 200), 2)),
                            '4. close':str(round(random.uniform(100, 200), 2))
                        }
                    })
    return {"watchlist": res}, 200


@app.route('/api/testdata', methods=['GET'])
def testData():
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(GLOBAL_WATCHLIST)
            watchlist = cursor.fetchall()
    res = []
    for watch in watchlist:
        res.append({
            watch[1]:
            {
                "1. open":round(random.random(), 2),
                "2. high":round(random.random(), 2),
                "3. low":round(random.random(), 2),
                "4. close":round(random.random(), 2)
            }
        })
    return {"watchlist": res}, 200


#################################################################################################################################


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')