import express from 'express'
import {getAllJobs,deleteJob,getMyJobs,getSingleJob,postJob,updateJob,} from '../controllers/jobController.js'
const router=express.Router();
import { isAuthorized } from "../middlewares/auth.js";


router.get("/getall",getAllJobs);
router.post("/post", isAuthorized, postJob);
router.get("/getmyjobs", isAuthorized, getMyJobs);
router.put("/update/:id", isAuthorized, updateJob);
router.delete("/delete/:id", isAuthorized, deleteJob);
router.get("/:id", isAuthorized, getSingleJob);

export default router; 