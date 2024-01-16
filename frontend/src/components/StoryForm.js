import { useState } from "react";
import { useStoriesContext } from "../hooks/useStoriesContext";
import Select from 'react-select';
import '../index.css';

const StoryForm = () => {
  const { dispatch } = useStoriesContext();
  const [title, setTitle] = useState('');
  const [children, setChildren] = useState('');
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Convert selected tags to a comma-separated string
    const tagsString = tags.map((tag) => tag.value).join(',');
  
    const story = { title, children, tags: tagsString, content };
  
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        body: JSON.stringify(story),
        headers: {
          'Content-Type' : 'application/json'
        }
      });
  
      const json = await response.json();
  
      if (!response.ok) {
        setError(json.error);
      }
  
      if (response.ok) {
        setTitle('');
        setChildren('');
        setTags([]);
        setContent('');
        setError(null);
        console.log('New Story Posted', json);
        dispatch({ type: 'CREATE_STORY', payload: json });
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      setError('An error occurred while submitting the form.');
    }
  };
  
  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Create a new Story</h3>

      <label>Story Title:</label>
      <input
        type="text"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
      />

      <label>Children in this story:</label>
      <input
        type="text"
        onChange={(e) => setChildren(e.target.value)}
        value={children}
      />

      <label>Learning Tags:</label>
      <Select
        isMulti
        options={[
          { value: 'tag1', label: 'Tag 1' },
          { value: 'tag2', label: 'Tag 2' },
          // Add more options as needed
        ]}
        onChange={(selectedOptions) => setTags(selectedOptions)}
        value={tags}
        isSearchable
      />

      <br></br>

      <label>Story Content:</label>
      <textarea
        type="text"
        onChange={(e) => setContent(e.target.value)}
        value={content}
      />

      <div className="centered-button">
        <button>Post Story</button>
      </div>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default StoryForm;
