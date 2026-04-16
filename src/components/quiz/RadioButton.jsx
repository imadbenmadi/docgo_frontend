function RadioButton({ isSelected, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex gap-1.5 justify-center items-center self-stretch px-1 my-auto w-6 h-6 rounded-xl border-solid border-[0.632px] border-neutral-600 min-h-6"
    >
      {isSelected && (
        <div className="flex self-stretch my-auto w-3.5 h-3.5 bg-blue-600 rounded-full fill-blue-600 min-h-3.5" />
      )}
    </button>
  );
}

export default RadioButton;
