function DropDownContent({ links }) {
  const Style =
    "text-customGray font-medium  px-6 py-3  hover:bg-sky-50 lg:px-4 lg:py-2 md:px-2 md:py-1";
  return (
    <div className="flex flex-col text-base   rounded-xl bg-white  border-[2px] border-solid border-gray-400 w-64 md:text-[12px] md:gap-2 lg:text-sm lg:w-44 md:w-36 ">
      {links.map((link, index) => {
        if (index === 0)
          return (
            <a
              key={link.text}
              className={`${Style} border-solid border-gray-400 rounded-t-lg`}
              href={link.href}
            >
              {link.text}
            </a>
          );
        else if (index === links.length - 1)
          return (
            <a
              key={link.text}
              className={`${Style} border-solid border-gray-400  rounded-b-lg`}
              href={link.href}
            >
              {link.text}
            </a>
          );
        else
          return (
            <a key={link.text} className={Style} href={link.href}>
              {link.text}
            </a>
          );
      })}
    </div>
  );
}

export default DropDownContent;
