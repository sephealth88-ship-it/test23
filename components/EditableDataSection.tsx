import React from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface EditableDataSectionProps {
  title: string;
  items: string[];
  onItemsChange: (newItems: string[]) => void;
}

export const EditableDataSection: React.FC<EditableDataSectionProps> = ({
  title,
  items,
  onItemsChange,
}) => {
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onItemsChange(newItems);
  };

  const handleAddItem = () => {
    onItemsChange([...items, '']);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  return (
    <div>
      <h4 className="font-semibold text-gray-700 mb-2 text-base sticky top-0 bg-white pt-2">{title}</h4>
      <div className="space-y-2 pl-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                className="w-full text-sm text-gray-800 bg-gray-50 p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#009c6d] focus:border-[#009c6d] outline-none transition-shadow"
                placeholder={`Enter ${title.toLowerCase()}...`}
              />
              <button
                onClick={() => handleRemoveItem(index)}
                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"
                aria-label={`Remove item ${index + 1}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No {title.toLowerCase()} items found. Add one below.</p>
        )}
        <button
          onClick={handleAddItem}
          className="flex items-center gap-2 text-sm font-medium text-[#009c6d] hover:text-[#008a60] mt-2 py-1 px-2 rounded-md hover:bg-[#009c6d]/10 transition-colors"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span>Add {title}</span>
        </button>
      </div>
    </div>
  );
};
