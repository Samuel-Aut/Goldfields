import React, { createContext, useState, useEffect } from "react";

export const ClassesContext = createContext();

export const ClassesProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [updateCount, setUpdateCount] = useState(0);

  // Function to fetch classes from the backend
  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      const data = await response.json();
      const classesWithStudents = data.map((c) => ({
        ...c,
        students: c.students || [],
      }));
      setClasses(classesWithStudents);
    } catch (error) {
      console.error("Could not fetch classes:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const addClass = async (newClass) => {
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClass),
      });
      const addedClass = await response.json();
      setClasses((prevClasses) => [...prevClasses, addedClass]);
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  // Updated to handle new student object with image upload
  const addStudentToClass = async (classId, student) => {
    try {
      const formData = new FormData();
      for (const key in student) {
        if (key === "image" && student[key]) {
          formData.append(key, student[key]);
        } else {
          formData.append(key, String(student[key])); // Ensure non-file values are converted to strings
        }
      }
      const response = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      const updatedClass = await response.json();
      setClasses((prevClasses) =>
        prevClasses.map((c) =>
          c.id === classId ? { ...c, students: updatedClass.students } : c
        )
      );
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const transferStudent = async (studentId, oldClassId, newClassId) => {
    try {
      const response = await fetch("/api/classes/transfer-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId, oldClassId, newClassId }),
      });
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      await fetchClasses(); // Re-fetch classes to update the state
    } catch (error) {
      console.error("Error transferring student:", error);
    }
  };
  
  const updateStudentInClass = async (classId, studentId, updatedStudent) => {
    try {
      const formData = new FormData();
      for (const key in updatedStudent) {
        if (key === "image" && updatedStudent[key]) {
          formData.append(key, updatedStudent[key]);
        } else {
          formData.append(key, String(updatedStudent[key]));
        }
      }

      const response = await fetch(
        `/api/classes/${classId}/students/${studentId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      const updatedClass = await response.json();

      // Directly update the state with the updated class information
      setClasses((prevClasses) =>
        prevClasses.map((c) => (c.id === classId ? updatedClass : c))
      );
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  // Function to fetch a single student's data from the backend
  const fetchStudentData = async (classId, studentId) => {
    try {
      const response = await fetch(
        `/api/classes/${classId}/students/${studentId}`
      );
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      const data = await response.json();
      return data; // Return the fetched student data
    } catch (error) {
      console.error("Failed to fetch student:", error);
      throw error; // Rethrow the error to be handled by the calling component
    }
  };

  return (
    <ClassesContext.Provider
      value={{
        classes,
        addClass,
        addStudentToClass,
        transferStudent,
        updateStudentInClass,
        fetchClasses,
        fetchStudentData,
        updateCount,
      }}
    >
      {children}
    </ClassesContext.Provider>
  );
};
