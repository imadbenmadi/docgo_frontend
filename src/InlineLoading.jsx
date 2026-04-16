import React from "react";

function InlineLoading({ className = "", borderColor = "#464646" }) {
    return (
        <span
            className={`small-loader m-auto ${className}`}
            style={{
                borderColor: `${borderColor} ${borderColor} transparent ${borderColor}`,
            }}
        ></span>
    );
}

export default InlineLoading;
