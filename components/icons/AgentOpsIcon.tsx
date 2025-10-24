import React from 'react';

export const AgentOpsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <g
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.5}
    >
      {/* Three connected hexagons for the grid effect */}
      <path d="M12.0001 8.99999L8.50006 11V15L12.0001 17L15.5 15V11L12.0001 8.99999Z" />
      <path d="M15.5 11L19 8.99999L15.5 7V11Z" />
      <path d="M8.5 11L5 8.99999L8.5 7V11Z" />
    </g>
    <g
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Bot Head */}
      <path
        fill="white"
        d="M15.5 9.5H8.5C7.94772 9.5 7.5 9.94772 7.5 10.5V14.5C7.5 15.0523 7.94772 15.5 8.5 15.5H15.5C16.0523 15.5 16.5 15.0523 16.5 14.5V10.5C16.5 9.94772 16.0523 9.5 15.5 9.5Z"
      />
      <path d="M14 9.5V8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8V9.5" />
      <circle cx={10.5} cy={12.5} r={0.5} fill="currentColor" />
      <circle cx={13.5} cy={12.5} r={0.5} fill="currentColor" />
    </g>
  </svg>
);
