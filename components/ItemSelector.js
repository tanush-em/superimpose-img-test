// components/ItemSelector.js
"use client";

import { useState } from 'react';

export default function ItemSelector({ items, selectedItems, onSelect }) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (categoryId, itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [`${categoryId}-${itemId}`]: true
    }));
  };

  return (
    <div className="item-selector-container">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Customize Your Room</h1>
      <div className="space-y-8">
        {Object.entries(items).map(([categoryId, category]) => (
          <div key={categoryId} className="border-b border-gray-200 pb-6 last:border-b-0">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">{category.name}</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {category.options.map(option => {
                const hasError = imageErrors[`${categoryId}-${option.id}`];
                const isSelected = selectedItems[categoryId] === option.id;
                
                return (
                  <button
                    key={option.id}
                    className={`item-button p-2 rounded-lg transition-all ${
                      isSelected ? 'selected' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onSelect(categoryId, option.id)}
                  >
                    <div className="item-image-container">
                      {hasError ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                          Image not available
                        </div>
                      ) : (
                        <img
                          src={option.thumbnailUrl || option.imageUrl}
                          alt={option.name}
                          className="item-image"
                          onError={() => handleImageError(categoryId, option.id)}
                        />
                      )}
                    </div>
                    <p className="text-sm text-center mt-2 text-gray-600">{option.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}