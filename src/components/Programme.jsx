import { useTranslation } from "react-i18next";

function Programme({ program }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col sm:flex-row gap-4">
      <div className="w-full sm:w-48 h-48 relative">
        <img
          src={program.flag}
          alt="France Flag"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-2">{program.title}</h2>
        <p className="text-lg font-medium text-gray-900 mb-2">
          {program.price}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          {t("Description", "Description")}: {program.description}
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
          {t("Detail", "View Details")}
        </button>
      </div>
    </div>
  );
}

export default Programme;
