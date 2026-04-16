// MockupPreview.jsx
import React from 'react';

const MockupPreview = ({ mockupUrl, type = 'Mockup' }) => {
    if (!mockupUrl) return null;
    return (
        <div className="mockup-preview">
            <img src={mockupUrl} alt={`Generated ${type}`} className="max-w-full rounded-lg shadow-md" />
        </div>
    );
};

export default MockupPreview;
