type DigitAuthLogoProps = {
  className?: string;
};

export default function DigitAuthLogo({
  className = "h-7 w-7",
}: DigitAuthLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 8.5h8.5a11.5 11.5 0 0 1 0 23H12z"
        stroke="#60A5FA"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15h7a5 5 0 0 1 0 10h-7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="29" cy="10" r="2" fill="#60A5FA" />
    </svg>
  );
}
