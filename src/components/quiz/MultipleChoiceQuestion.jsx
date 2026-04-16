import { useState } from "react";
import RadioButton from "./RadioButton";

function MultipleChoiceQuestion({ options }) {
  const [selectedOption, setSelectedOption] = useState("D");

  return (
    <div className="mt-6 w-full max-md:max-w-full">
      <h2 className="text-2xl font-semibold text-zinc-800 max-md:max-w-full">
        Lequel des éléments suivants N'EST PAS un principe clé du design ?
      </h2>
      <div className="mt-6 max-w-full w-[218px]">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex gap-6 items-center w-full text-xl leading-10 text-zinc-800 mt-4 first:mt-0"
          >
            <RadioButton
              isSelected={selectedOption === option.id}
              onChange={() => setSelectedOption(option.id)}
            />
            <div className="self-stretch my-auto text-zinc-800 w-[170px]">
              {option.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MultipleChoiceQuestion;
