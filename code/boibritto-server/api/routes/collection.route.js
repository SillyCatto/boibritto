const express = require("express");
const {
  CollectionController,
} = require("../controllers/collection.controller");

const collectionRoute = express.Router();

collectionRoute.get("/", CollectionController.getCollectionsList);

collectionRoute.get("/:id", CollectionController.getOneCollectionByID);

collectionRoute.post("/", CollectionController.createCollection);

collectionRoute.patch("/:id", CollectionController.updateCollection);

collectionRoute.delete("/:id", CollectionController.deleteCollection);

module.exports = collectionRoute;
