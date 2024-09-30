export const RUFlag = ({ width = "640px", height = "480px" }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 480"
        width={width}
        height={height}
        preserveAspectRatio="none"
      >
        <g fillRule="evenodd" strokeWidth="1pt">
          <rect width="640" height="160" fill="#fff" />
          <rect y="160" width="640" height="160" fill="#0039a6" />
          <rect y="320" width="640" height="160" fill="#d52b1e" />
        </g>
      </svg>
    );
  };
  