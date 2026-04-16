function Select({ options }) {
  return (
    <select className="md:text-lg font-medium bg-white border-[2px] border-solid border-gray-300 lg:px-28 py-4 rounded-lg sm-sm:w-full sm-sm:text-[10px] sm-sm:px-2 md:px-16">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
