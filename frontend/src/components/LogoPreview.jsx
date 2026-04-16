// LogoPreview.jsx
import React from 'react';

const LogoPreview = ({ logoUrl, altText = 'Generated Logo' }) => {
    if (!logoUrl) return null;
    return (
        <div className="logo-preview">
            <img src={logoUrl} alt={altText} className="max-w-full rounded-lg shadow-md" />
        </div>
    );
};

export default LogoPreview;
