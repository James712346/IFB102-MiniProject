from quart import websocket, Quart, render_template
from Bluetin_Echo import Echo
import time

app = Quart(__name__)
Pins = ((22,18),(23,17))
speed = 320
samples = 5
Distance = [Echo(*pin ,speed) for pin in Pins]
print(Distance[0].read('cm'))

@app.websocket('/ws')
async def ws():
    while True:
        reads = [ round(d.read('cm',samples),1) for d in Distance ]
        print(reads)
        await websocket.send(str(reads))

@app.route('/', methods=['GET'])
async def posts():
    return await render_template('index.html')

app.run(host='0.0.0.0',port=81)
