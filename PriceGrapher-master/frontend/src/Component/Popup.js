import React, { useState } from 'react';
import "./css/Popup.css"

const AddDataModal = ({ isOpen, onClose, onSubmit }) => {
  const [data, setData] = useState('');

  const handleInputChange = (e) => {
    setData(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(data);
    setData('');
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <input
        className='inTicker'
          type="text"
          placeholder="Enter Ticker"
          value={data}
          onChange={handleInputChange}
        />
        <button onClick={handleSubmit}>ADD</button>
      </div>
    </div>
  );
};

export default AddDataModal;