import { LucideProps } from "lucide-react";

export function GoogleIcon(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <circle cx="6.43" cy="18.14" r="2.14" />
      <path d="M5.23 14.72c.89-2.49 3.34-4.28 6.17-4.28-1.38.83-2.94 1.53-4.42 1.92" />
      <path d="M4.84 9.38c-.72 1.72-1.05 3.61-1.05 5.64 0 2.02.33 3.92 1.05 5.64" />
    </svg>
  );
}
