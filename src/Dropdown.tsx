// Dropdown.tsx
import React, { ChangeEvent } from "react";

// Define the shape of the option object
interface DropdownOption {
  value: string;
  label: string;
}

// Define the props for the Dropdown component
interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

function Dropdown({ options, selectedValue, onChange }: DropdownProps) {
  // Handler for the select change event
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select value={selectedValue} onChange={handleChange}>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Dropdown;
