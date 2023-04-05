import express from 'express';
import {contactUs} from '../controllers/contactController.js';
import protect from "../middleWare/authMiddleware.js";

const route = express.Router();

route.post('/', protect, contactUs);

export default route;