import express from "express";
import { saveProfile } from "../controllers/profileController";

const router = express.Router();

router.post("/", saveProfile);

export default router;
