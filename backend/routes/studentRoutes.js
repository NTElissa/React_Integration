import { Router } from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deactivateStudent
} from "../controllers/studentController.js";

const router = Router();

router.route("/")
  .post(createStudent)
  .get(getStudents);

router.route("/:id")
  .get(getStudentById)
  .patch(updateStudent);

router.patch("/:id/deactivate", deactivateStudent);

export default router;