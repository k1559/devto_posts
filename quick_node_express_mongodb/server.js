// server.js

const express = require("express");
const server = express();

const body_parser = require("body-parser");

// parse JSON (application/json content-type)
server.use(body_parser.json());

const port = 4000;

// << db setup >>
const db = require("./db");
const dbName = "data";
const collectionName = "movies";

db.initialize(dbName, collectionName, function (dbCollection) { // successCallback
   // get all items
   dbCollection.find().toArray(function (err, result) {
      if (err) throw err;
      console.log(result);

      // << return response to client >>
   });

   // << db CRUD routes >>
   server.post("/items", (req, res) => {
      const item = req.body;
      dbCollection.insertOne(item, (err, result) => {
         if (err) throw err;
         // return updated list
         dbCollection.find().toArray((_err, _res) => {
            if (_err) throw _err;
            res.json(_res);
         });
      });
   });

   server.get("/items/:id", (req, res) => {
      const itemId = req.params.id;

      dbCollection.findOne({ id: itemId }, (err, result) => {
         if (err) throw err;
         // return item
         res.json(result);
      });
   });


   server.get("/items", (req, res) => {
      // return updated list
      dbCollection.find().toArray((_err, _res) => {
         if (_err) throw _err;
         res.json(_res);
      });
   });

   server.put("/items/:id", (req, res) => {
      const itemId = req.params.id;
      const item = req.body;
      console.log("Editing item: ", itemId, " to be ", item);

      dbCollection.updateOne({ id: itemId }, { $set: item }, function (err, result) {
         if (err) throw err;
         // send back entire updated list, to make sure frontend data is up-to-date
         dbCollection.find().toArray(function (_err, _result) {
            if (_err) throw _err;
            res.json(_result);
         });
      });
   });

   server.delete("/items/:id", (req, res) => {
      const itemId = req.params.id;
      console.log("Delete item with id: ", itemId);

      dbCollection.deleteOne({ id: itemId }, function (err, result) {
         if (err) throw err;
         // send back entire updated list after successful request
         dbCollection.find().toArray(function (_err, _result) {
            if (_err) throw _err;
            res.json(_result);
         });
      });
   });

}, function (err) { // failureCallback
   throw (err);
});

server.listen(port, () => {
   console.log(`Server listening at ${port}`);
});