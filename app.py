from quart import websocket, Quart, render_template
from Bluetin_Echo import Echo
import time
import asyncio

app = Quart(__name__)
Pins = ((22,18),(23,17))
speed = 320
samples = 5
Distance = [Echo(*pin ,speed) for pin in Pins]
print(Distance[0].read('cm'))
clients = set()

async def SendtoWebsocket():
    while clients: #while clients are connected
        reads = [ round(d.read('cm',samples),1) for d in Distance ]
        for websocket in clients:
            try:
                await websocket.send(str(reads))
            except asyncio.CancelledError:
                print("Client Disconnected")
        await asyncio.sleep(0.05) #Give 0.05 seconds to the webserver for other tasks
    print("Finish Task")


@app.websocket('/ws')
async def ws():
    Webserver_Loop = asyncio.get_event_loop()
    clients.add(websocket._get_current_object())
    if "Websocket" in [task.get_name() for task in asyncio.all_tasks()]:
        print("Starting Task")
        task = asyncio.create_task(SendtoWebsocket())
        task.set_name("Websocket")
    print(asyncio.all_tasks())


@app.route('/', methods=['GET'])
async def posts():
    return await render_template('index.html')


app.run(host='0.0.0.0',port=81)
