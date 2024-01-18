import React, { useState, useContext } from "react";
import Logo from "../components/logo";
import "../class.css";
import ClassForm from "../components/ClassForm.js";
import { ClassesContext } from "../context/ClassesContext";

function Class() {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { classes, addClass } = useContext(ClassesContext); // Destructure classes from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addClass({ className, subject });
      setMessage(`Class '${className}' created successfully.`);
      setClassName("");
      setSubject("");
    } catch (error) {
      console.error("Error creating class:", error);
      setMessage("Failed to create class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMessage = () => {
    setMessage("");
  };

 return (
    <div className="class-page-container">
      <div className="logo-container">
        <Logo />
      </div>
      <div className="class-form-container">
        <ClassForm
          className={className}
          setClassName={setClassName}
          subject={subject}
          setSubject={setSubject}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
        />
        <div className="message-wrapper">
          {message && (
            <div className="message-container">
              <p>{message}</p>
              <button className="message-close-btn" onClick={clearMessage}>
                &times;
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="classes-container">
        <h3 className="class-form-h3">Created Classes</h3>
        <div className="cards-container">
          {classes.length > 0 ? (
            classes.map((c, index) => (
              <div key={index} className="class-card">
                <span>{c.className}</span>
                <span>{c.subject}</span>
              </div>
            ))
          ) : (
            <p>No classes created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Class;
