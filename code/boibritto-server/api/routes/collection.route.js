import express from 'express';
import { 
  CollectionController,
 } from '../controllers/collection.controller.js';

const collectionRoute = express.Router();

collectionRoute.get("/", CollectionController.getCollectionsList);

collectionRoute.get("/:id", CollectionController.getOneCollectionByID);

collectionRoute.post("/", CollectionController.createCollection);

collectionRoute.patch("/:id", CollectionController.updateCollection);

collectionRoute.delete("/:id", CollectionController.deleteCollection);

export default collectionRoute;
