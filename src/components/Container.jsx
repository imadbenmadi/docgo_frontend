function Container({ children, style, id }) {
  return (
    <div id={id} className={`max-w-[1400px] py-16 ml-auto mr-auto  ${style}`}>
      {children}
    </div>
  );
}

export default Container;
