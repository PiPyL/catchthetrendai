import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center py-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                Catch The Trend <span className="text-blue-500">AI</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Catch every AI image trend. Upload a style, upload your face, and create magic.
            </p>
        </header>
    );
};

export default Header;