import express from "express";
import { urlencoded } from "body-parser";
import { MongoClient } from "mongodb";
import { newDb } from "pg-mem";
import {devices, measurements} from './schema.js'
import {db} from './db.js';
import { desc, eq } from 'drizzle-orm';

    import render from "./render.js";
// Measurements database setup and access

let database = null;
const collectionName = "measurements";

async function startDatabase() {
    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";	
    const connection = await MongoClient.connect(uri);
    database = connection.db();
}

async function getDatabase() {
    if (!database) await startDatabase();
    return database;
}

async function insertMeasurement(message) {
    const {insertedId} = await database.collection(collectionName).insertOne(message);
    return insertedId;
}


// API Server

const app = express();

app.use(urlencoded({extended:false}));


app.use(express.static('spa/static'));

app.use(express.json());

//Metodo para imprimir en consola donde nos encontramos y que peticiones ejecutamos
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`)
    next();
})

const PORT = 8080;

//const router = express.Router();


app.post('/measurement', async (req, res) => {
    const{device_id, temperature, pressure, humidity} = req.body;
    if(!device_id || !temperature || !pressure){
        return res.status(400).json({error: "Missing fields"});
    }
    const [newMeasure] = await db.insert(measurements).values({device_id, temperature, pressure, humidity}).returning();
    res.status(200).json(newMeasure);
    //console.log("device id    : " + req.body.id + " key         : " + req.body.key + " temperature : " + req.body.t + " humidity    : " + req.body.h);	
    //const {insertedId} = insertMeasurement({id:req.body.id, t:req.body.t, h:req.body.h});
	//res.send("received measurement into " +  insertedId);
});

app.post('/device', async (req, res) => {
    const {name, key} = req.body;
    if (!name || !key){
        return res.status(400).json({error: 'Missing fields'});
    }

    const [newDevice] = await db.insert(devices).values({name, key}).returning();
    res.status(200).json(newDevice);
});

app.get('/web/device', async function (req, res) {
    try {
        const devicesList = await db.select().from(devices);

        const result = devicesList.map(function (device) {
            console.log(device);

            return '<tr><td><a href="/web/device/' + device.device_id + '">' +
                device.device_id + '</a>' +
                '</td><td>' + device.name +
                '</td><td>' + device.key + 
                '</td><td>' + device.createdAt +'</td></tr>';
        });

        res.send(
            "<html>" +
            "<head><title>Sensores</title></head>" +
            "<body>" +
            "<table border=\"1\">" +
            "<tr><th>id</th><th>name</th><th>key</th><th>createdAt</th></tr>" +
            result.join('') +
            "</table>" +
            "</body>" +
            "</html>"
        );
    } catch (error) {
        console.error("Error al consultar los dispositivos:", error);
        res.status(500).send("Error al consultar los dispositivos");
    }
});
/*
app.get('/web/device/:id', function (req,res) {
    var template = "<html>"+
                     "<head><title>Sensor {{name}}</title></head>" +
                     "<body>" +
		        "<h1>{{ name }}</h1>"+
		        "id  : {{ id }}<br/>" +
		        "Key : {{ key }}" +
                     "</body>" +
                "</html>";


    var device = db.public.many("SELECT * FROM devices WHERE device_id = '"+req.params.id+"'");
    console.log(device);
    res.send(render(template,{id:device[0].device_id, key: device[0].key, name:device[0].name}));
});	
*/
app.get('/web/device/:id', async function (req, res) {
    const id = Number(req.params.id);

    // Validar que el ID sea un número válido
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send('ID inválido');
    }

    const template =
        "<html>" +
        "<head><title>Sensor {{name}}</title></head>" +
        "<body>" +
        "<h1>{{name}}</h1>" +
        "id: {{id}}<br/>" +
        "Key: {{key}}<br/>" +
        "Time: {{time}}" +
        "</body>" +
        "</html>";

    try {
        const result = await db.select().from(devices).where(eq(devices.device_id, id)).limit(1);

        if (result.length === 0) {
            return res.status(404).send('Dispositivo no encontrado');
        }

        const device = result[0];

        res.send(render(template, {id: device.device_id, key: device.key, name: device.name, time: device.createdAt}));

    } catch (error) {
        console.error('Error al consultar el dispositivo:', error);
        res.status(500).send('Error interno del servidor');
    }
});
/*app.get('/web/device/:id', function (req,res) {
    const id = Number(req.params.id)
    var template = "<html>"+
                     "<head><title>Sensor {{name}}</title></head>" +
                     "<body>" +
		        "<h1>{{ name }}</h1>"+
		        "id  : {{ id }}<br/>" +
		        "Key : {{ key }}" +
                     "</body>" +
                "</html>";

    var device = db.select().from(devices).where(eq(devices.device_id, id));
    //var device = db.public.many("SELECT * FROM devices WHERE device_id = '"+req.params.id+"'");
    console.log(device);
    res.send(render(template,{id:device[0].device_id, key: device[0].key, name:device[0].name}));
});	*/

app.get('/term/device/:id', function (req, res) {
    var red = "\x1b[31m";
    var green = "\x1b[32m";
    var blue = "\x1b[33m";
    var reset = "\x1b[0m";
    var template = "Device name " + red   + "   {{name}}" + reset + "\n" +
		   "       id   " + green + "       {{ id }} " + reset +"\n" +
	           "       key  " + blue  + "  {{ key }}" + reset +"\n";
    var device = db.public.many("SELECT * FROM devices WHERE device_id = '"+req.params.id+"'");
    console.log(device);
    res.send(render(template,{id:device[0].device_id, key: device[0].key, name:device[0].name}));
});

app.get('/measurement', async (req,res) => {
    try {
    const data = await db.select().from(measurements);

    return res.status(200).json({
      success: true,
      count: data.length,
      measurements: data
    });
  } catch (error) {
    console.error('Error al obtener las mediciones:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener las mediciones'
    });
  }
});

app.get('/measurement/:id', async (req, res) => {
    const deviceId = Number(req.params.id); 
    try {
        const result = await db.select().from(measurements).where(eq(measurements.device_id, deviceId)).orderBy(desc(measurements.createdAt));

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener las mediciones:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al obtener las mediciones'
        });
    }
});

app.get('/device', async function(req,res) {
    const devicesList = await db.select().from(devices);
    res.send(devicesList);
});


/* Data pata tabla user y device
    db.public.none("CREATE TABLE devices (device_id VARCHAR, name VARCHAR, key VARCHAR)");
    db.public.none("INSERT INTO devices VALUES ('00', 'Fake Device 00', '123456')");
    db.public.none("INSERT INTO devices VALUES ('01', 'Fake Device 01', '234567')");
    db.public.none("CREATE TABLE users (user_id VARCHAR, name VARCHAR, key VARCHAR)");
    db.public.none("INSERT INTO users VALUES ('1','Ana','admin123')");
    db.public.none("INSERT INTO users VALUES ('2','Beto','user123')");
*/

app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    })
