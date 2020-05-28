from quart import websocket, Quart, render_template
from functools import wraps
from Bluetin_Echo import Echo
import time
import asyncio

app = Quart(__name__)
Pins = ((17,18),(23,22))
speed = 320
samples = 5
Distance = [Echo(*pin ,speed) for pin in Pins]
print(Distance[0].read('cm'))
clients = set()

class Dummy:
    def done(self):
        return True

task = Dummy()

async def SendtoWebsocket():
    while clients: #while clients are connected (if 0 < websockets in the clients set)
        reads = [ round(d.read('cm',samples),1) for d in Distance ] #read data from the two sensors
        [await websocket.send(str(reads)) for websocket in clients] #loops through all webscokets open and sends the data from the sensors
        await asyncio.sleep(0.05) #Give 0.05 seconds to the webserver for other tasks
    print("Finish Task") #

def collect_websocket(func): #function grabbed from https://medium.com/@pgjones/websockets-in-quart-f2067788d1ee
    @wraps(func)             #This function add the WS object and puts it into a set (unordered array)
    async def wrapper(*args, **kwargs): #This could be done in the function below but atm as a proof of concept it works
        global clients
        clients.add(websocket._get_current_object())
        try:
            return await func(*args, **kwargs)
        finally:
            print("Client left")
            clients.remove(websocket._get_current_object())
    return wrapper


@app.websocket('/ws')
@collect_websocket
async def ws():
    global task
    print("Client Joining")
    Webserver_Loop = asyncio.get_event_loop() #graps the webserver asyncio loop
    if task.done(): #checks if a task is running, if task.done() return false that means the task is running
        print("Starting New Task") #if the task isn't running it will start a new task
        task = asyncio.create_task(SendtoWebsocket())
    while True:
        await asyncio.sleep(10) #keeps the websocket live untill the websocket closes


@app.route('/', methods=['GET'])
async def posts():
    return await render_template('index.html') #Response to the request with a the HTML file


app.run(host='0.0.0.0',port=81)
