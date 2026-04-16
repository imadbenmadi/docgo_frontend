import { useTranslation } from "react-i18next";

function ThereIsNothing() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center mt-20 ">
      <h1 className="text-customGray font-normal text-center 2xl:text-3xl xl:text-xl lg:text-lg sm-sm:max-md:text-base ">
        {t("NoResultsFound", "No results found") || "No results found"}
      </h1>
      <img src="../../src/assets/Empty Cart 1 1.png" alt="empty cart" />
    </div>
  );
}

export default ThereIsNothing;
