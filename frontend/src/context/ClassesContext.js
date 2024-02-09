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

  // Update the count when classes are updated
  useEffect(() => {
    fetchClasses();
  }, []);

  //function to update the count
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
          formData.append(key, String(student[key]));
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

  // Function to transfer a student from one class to another
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
      await fetchClasses();
    } catch (error) {
      console.error("Error transferring student:", error);
    }
  };

  // Function to update a student's data in a class
  const updateStudentInClass = async (classId, studentId, updatedStudent) => {
    try {
      const formData = new FormData();
      for (const key in updatedStudent) {
        if (key === "image") {
          if (updatedStudent[key] instanceof File) {
            formData.append(key, updatedStudent[key]);
          } else if (
            typeof updatedStudent[key] === "string" ||
            updatedStudent[key] instanceof String
          ) {
            formData.append(key, updatedStudent[key]);
          }
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

      // Update the classes state with the updated class info
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
      return data;
    } catch (error) {
      console.error("Failed to fetch student:", error);
      throw error;
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
