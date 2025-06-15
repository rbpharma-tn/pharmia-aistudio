
import React from 'react';

interface CustomFileInputProps {
  label: string;
  id: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFileDisplay: string;
  buttonText: string;
  accept?: string;
  multiple?: boolean;
}

export const CustomFileInput: React.FC<CustomFileInputProps> = ({
  label,
  id,
  onChange,
  selectedFileDisplay,
  buttonText,
  accept,
  multiple = false,
}) => {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1">
        <label
          htmlFor={id} // Ensure this matches the input's id for accessibility
          className="flex items-center h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer bg-white hover:border-sky-400 focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500"
        >
          <span className="text-sm font-medium text-sky-600 hover:text-sky-700 whitespace-nowrap">
            {buttonText}
          </span>
          <span className="ml-3 text-sm text-gray-500 truncate overflow-hidden flex-grow" title={selectedFileDisplay}>
            {selectedFileDisplay}
          </span>
          <input
            id={id}
            name={id}
            type="file"
            className="sr-only" // Hidden, controlled by the label
            onChange={onChange}
            accept={accept}
            multiple={multiple}
          />
        </label>
      </div>
    </div>
  );
};
