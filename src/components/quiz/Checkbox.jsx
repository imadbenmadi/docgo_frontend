import React from "react";

function Checkbox({ isChecked, onChange }) {
    const iconMap = {
        false: "https://cdn.builder.io/api/v1/image/assets/TEMP/d874d161a2429ff20972a278a17b63bf3016234a?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3",
        true: "https://cdn.builder.io/api/v1/image/assets/TEMP/a773c086bba89bf8d9bdc83579026bf6ed523a99?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3",
    };

    return (
        <button
            type="button"
            onClick={onChange}
            className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
        >
            <img
                src={
                    isChecked
                        ? "https://cdn.builder.io/api/v1/image/assets/TEMP/a773c086bba89bf8d9bdc83579026bf6ed523a99?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
                        : "https://cdn.builder.io/api/v1/image/assets/TEMP/d874d161a2429ff20972a278a17b63bf3016234a?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
                }
                alt={isChecked ? "Checked" : "Unchecked"}
                className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
            />
        </button>
    );
}

export default Checkbox;
