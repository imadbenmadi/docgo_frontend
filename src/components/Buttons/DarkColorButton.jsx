function DarkColorButton({ text, style = "", icon = "" }) {
  return (
    <button
      className={`bg-customBlue text-white border-[3px] border-solid border-customBlue px-8 py-3 rounded-3xl font-medium md:text-sm  md:px-4 md:py-2 ${style}`}
    >
      {icon}
      {text}
    </button>
  );
}

export default DarkColorButton;
