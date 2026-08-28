const TitleBorder = (props:any) => {
  return (
    <svg
      width="120"
      height="12"
      viewBox="0 0 120 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <line
        x1="0"
        y1="6"
        x2="120"
        y2="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="6" r="4" fill="currentColor" />
    </svg>
  );
};

export default TitleBorder;