import express from "express";
import {
  createLabResource,
  deleteLabResource,
  getAllLabResourceById,
  getAllLabResources,
  updateLabResource,
} from "../controllers/labResourceController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.get("/lab-resources", getAllLabResources);
router.get("/lab-resource/:id", getAllLabResourceById);
router.post(
  "/create-lab-resource",
  isAuthenticated,
  isAuthorized("lab_attendant", "admin"),
  singleUpload,
  createLabResource
);

router.put(
  "/lab-resource/:id",
  isAuthenticated,
  isAuthorized("lab_attendant", "admin"),
  singleUpload,
  updateLabResource
);

router.delete(
  "/lab-resource/:id",
  isAuthenticated,
  isAuthorized("lab_attendant", "admin"),
  deleteLabResource
);

export default router;
