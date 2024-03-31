import React, { useState } from 'react';
import axios_obj from "../axios";
import StoryDetails from "../components/StoryDetails";
import "../searchstories.css";
import Logo2 from "../components/logov2";

const SearchStories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stories, setStories] = useState([]);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const initiateSearch = async () => {
    const term = searchTerm.trim();
    setError(''); // Clear any existing errors
    setShowNotification(false); // Hide any existing notifications
    setStories([]); // Clear previous stories right at the start of a new search

    if (!term) {
      return;
    }

    try {
      const response = await axios_obj.get(`/stories/search?search=${term}`);
      if (response.status === 200 && response.data.length > 0) {
        setStories(response.data);
      } else {
        setError('No stories found. Please try again.');
        setShowNotification(true);
      }
    } catch (err) {
      console.error('Error searching for stories:', err);
      setError('Failed to fetch stories. Please try again.');
      setShowNotification(true); // Show notification in case of error
    }
  };

  return (
    <div className="search-stories-container">
      <div className="stories-logo-container">
        <Logo2 />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Search for stories..."
        className="search-stories-input"
      />
      <button onClick={initiateSearch} className="search-stories-button">Search</button>
      <div className="story-cards-container">
        {stories.length > 0 && (
          stories.map(story => (
            <StoryDetails story={story} key={story._id} />
          ))
        )}
      </div>
      <div className={`notification ${showNotification ? 'show' : ''}`}>
        {error}
        <button onClick={() => setShowNotification(false)}>×</button>
      </div>
    </div>
  );
};

export default SearchStories;
