"use client";

import React, { useEffect } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import ReactSelect from "react-select";

interface RadioProps {
  register: UseFormRegister<FieldValues>;
  label: string;
  id: string;
  defaultValue?: any;
  options: Record<string, any>[];
  disabled?: boolean;
}

const Radio: React.FC<RadioProps> = ({
  id,
  label,
  options,
  register,
  defaultValue,
}) => {
  const [value, setValue] = React.useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div>
      <label className=" block  text-sm  font-medium  leading-6  text-gray-900 ">
        {label}
      </label>
      <div className="flex items-center space-x-4 py-1.5">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-1">
            <input
              {...register(id)}
              type="radio"
              value={option.value}
              id={id + option.value}
              checked={value === option.value}
              onChange={(e) => {
                register(id).onChange(e);
                setValue(option.value);
              }}
              className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 cursor-pointer"
            />
            <label
              htmlFor={id + option.value}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Radio;
