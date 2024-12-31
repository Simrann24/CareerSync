import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// Helper function to validate file types
const validateFileType = (file, allowedFormats) => {
  return allowedFormats.includes(file.mimetype);
};

export const postApplication = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;

  // Ensure that Job Seekers cannot access Employer's routes
  if (role === "Employer") {
    return next(new ErrorHandler("Employers are not allowed to access this resource.", 403));
  }

  // Check if resume file is provided
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume file is required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];

  // Validate file type
  if (!validateFileType(resume, allowedFormats)) {
    return next(new ErrorHandler("Invalid file type. Please upload a PNG, JPEG, or WebP file.", 400));
  }

  // Upload the resume to Cloudinary
  let cloudinaryResponse;
  try {
    cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath);
  } catch (error) {
    console.error("Cloudinary Error:", error);
    return next(new ErrorHandler("Failed to upload resume to Cloudinary.", 500));
  }

  // Destructure body params
  const { name, email, coverLetter, phone, address, jobId } = req.body;

  // Check if job exists
  if (!jobId) {
    return next(new ErrorHandler("Job ID is required.", 400));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  // Check if all fields are provided
  if (!name || !email || !coverLetter || !phone || !address) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }

  // Create the application object
  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID: {
      user: req.user._id,
      role: "Job Seeker",
    },
    employerID: {
      user: jobDetails.postedBy,
      role: "Employer",
    },
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Application submitted successfully!",
    application,
  });
});

export const employerGetAllApplications = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;

  // Ensure that only Employers can access this resource
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seekers are not allowed to access this resource.", 403));
  }

  const { _id } = req.user;
  const applications = await Application.find({ "employerID.user": _id });

  if (applications.length === 0) {
    return next(new ErrorHandler("No applications found for this employer.", 404));
  }

  res.status(200).json({
    success: true,
    applications,
  });
});

export const jobseekerGetAllApplications = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;

  // Ensure that only Job Seekers can access this resource
  if (role === "Employer") {
    return next(new ErrorHandler("Employers are not allowed to access this resource.", 403));
  }

  const { _id } = req.user;
  const applications = await Application.find({ "applicantID.user": _id });

  if (applications.length === 0) {
    return next(new ErrorHandler("No applications found for this job seeker.", 404));
  }

  res.status(200).json({
    success: true,
    applications,
  });
});

export const jobseekerDeleteApplication = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;

  // Ensure that only Job Seekers can delete their applications
  if (role === "Employer") {
    return next(new ErrorHandler("Employers are not allowed to delete applications.", 403));
  }

  const { id } = req.params;
  const application = await Application.findById(id);

  if (!application) {
    return next(new ErrorHandler("Application not found.", 404));
  }

  // Delete the application
  await application.deleteOne();

  res.status(200).json({
    success: true,
    message: "Application deleted successfully!",
  });
});
