import React from "react";
import PropTypes from "prop-types";

const ShowSmallBoxData = ({ text, maxLength = 10, fallback = "guest" }) => {
    if (!text) {
        return fallback;
    }

    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

ShowSmallBoxData.propTypes = {
    text: PropTypes.string,
    maxLength: PropTypes.number,
    fallback: PropTypes.string,
};

export default ShowSmallBoxData;

// Usage example:
// <ShowSmallBoxData text={user?.firstName} maxLength={10} fallback="guest" />
