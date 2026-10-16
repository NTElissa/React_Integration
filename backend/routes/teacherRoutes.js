import { Router } from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deactivateTeacher
} from "../controllers/teacherController.js";

const router = Router();

router.route("/")
  .post(createTeacher)
  .get(getTeachers);

router.route("/:id")
  .get(getTeacherById)
  .patch(updateTeacher);

router.patch("/:id/deactivate", deactivateTeacher);

export default router;