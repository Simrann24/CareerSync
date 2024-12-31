import React, { useEffect, useContext } from "react";
import "./App.css";
import { Context } from "./main";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Auth/login';
import Register from './components/Auth/Register';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './components/Home/Home';
import Jobs from './components/Job/Jobs';
import JobDetails from './components/Job/JobDetail';
import MyJobs from './components/Job/MyJobs';
import PostJobs from './components/Job/PostJobs';
import Application from './components/Application/Application';
import MyApplication from './components/Application/MyApplication';
import NotFound from './components/NotFound/NotFound.jsx';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

function App() {
  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  useEffect(() => {
    // This function will run only once when the component mounts
    const fetchUser = async () => {
      try {
        const response = await axios.get("https://careersync-backend.onrender.com/api/v1/user/getuser", {
          withCredentials: true, // Make sure cookies are sent with the request
        });
        
        // If the response has user data, update the context
        if (response.data && response.data.user) {
          setUser(response.data.user);
          setIsAuthorized(true); // Mark as authorized if user data is fetched
        } else {
          setIsAuthorized(false); // Mark as not authorized if no user is returned
        }
      } catch (error) {
        setIsAuthorized(false); // If there's an error, mark as not authorized
      }
    };

    // Run fetchUser function
    fetchUser();
  }, [setIsAuthorized, setUser]); // This will run only once after the component mounts

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/job/getall" element={<Jobs />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/job/post" element={<PostJobs />} />
          <Route path="/job/me" element={<MyJobs />} />
          <Route path="/application/:id" element={<Application />} />
          <Route path="/applications/me" element={<MyApplication />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <Toaster />
      </Router>
    </>
  );
}

export default App;

