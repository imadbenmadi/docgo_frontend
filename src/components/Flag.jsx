function Flag({ url, name }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <img className="md:w-16 sm-sm:w-10 " src={url} alt={`${name} Flag`} />
      <p className="sm-sm:text-[12px] md:text-sm lg:text-lg font-medium text-customGray">
        {name}
      </p>
    </div>
  );
}

export default Flag;
