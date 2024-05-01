import React, { ChangeEvent } from "react";

// Define the shape of the option object
interface DropdownOption {
  value: string;
  label: string;
}

// Define the props for the Dropdown component
interface DropdownProps {
  selectedValue: string;
  onChange: (value: string) => void;
}

const dropdownOptions = [
  { value: "default", label: "Choose Bus Company" },
  { value: "VYX", label: "Vy Express" },
  { value: "VOT", label: "Vestfold og Telemark" },
  { value: "SKY", label: "Vestland (Skyss)" },
  { value: "AKT", label: "Agder (AKT)" },
  { value: "ATB", label: "Trøndelag (AtB)" },
  { value: "BRA", label: "Viken (Brakar)" },
  { value: "FIN", label: "Troms og Finnmark (Snelandia)" },
  { value: "MOR", label: "Møre og Romsdal (Fram)" },
  { value: "NOR", label: "Nordland fylkeskommune" },
  { value: "NSB", label: "Vy" },
  { value: "OST", label: "Viken (Østfold kollektivtrafikk)" },
  { value: "SOF", label: "Vestland (Kringom)" },
  { value: "TRO", label: "Troms og Finnmark (Troms fylkestrafikk)" },
  { value: "VOT", label: "Vestfold og Telemark" },
  { value: "VYX", label: "Vy Express" },
];

function Dropdown({ selectedValue, onChange }: DropdownProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select
      className={"baseLayer_select"}
      value={selectedValue}
      onChange={handleChange}
    >
      {dropdownOptions.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Dropdown;
