import { useTranslation } from "react-i18next";
import backgroundImage from "../../assets/paris.png"; // Adjust the path as necessary

const ProgrammePage = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-6">
            <div className="relative w-full">
                <div
                    style={{
                        backgroundImage: `url(${backgroundImage})`,

                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "100% 100%",
                    }}
                    className="w-full h-40 sm:h-60 md:h-80 lg:h-96"
                >
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col text-customGray space-y-4">
                    <h1 className="text-2xl font-semibold xl:text-4xl lg:text-3xl md:text-2xl">
                        {t("FranceProgram", "France Program")}
                    </h1>

                    <p className="text-base leading-normal  sm-sm:max-sm:text-sm md:text-lg text-gray-700 ">
                        {t("FranceDescription", "France Description")}
                    </p>

                    <div className="pt-4">
                        <button className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors text-base md:text-lg font-medium sm-sm:max-sm:text-sm">
                            {t("Postulated", "Applied")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgrammePage;
