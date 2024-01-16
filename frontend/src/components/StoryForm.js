import { useState } from "react";
import { useStoriesContext } from "../hooks/useStoriesContext";
import Select from 'react-select';

const StoryForm = () => {
  const { dispatch } = useStoriesContext();
  const [title, setTitle] = useState('');
  const [children, setChildren] = useState([]);
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert selected children to a comma-separated string
    const childrenString = children.map((child) => child.value).join(',');

    // Convert selected tags to a comma-separated string
    const tagsString = tags.map((tag) => tag.value).join(',');

    const story = { title, children: childrenString, tags: tagsString, content };

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
        setChildren([]);
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
      <Select
        isMulti
        options={[
          { value: 'child1', label: 'Child 1' },
          { value: 'child2', label: 'Child 2' },
          // Add more options as needed
        ]}
        onChange={(selectedOptions) => setChildren(selectedOptions)}
        value={children}
        isSearchable
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

      <label>Story Content:</label>
      <textarea
        type="text"
        onChange={(e) => setContent(e.target.value)}
        value={content}
      />

      <button>Post Story</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default StoryForm;
