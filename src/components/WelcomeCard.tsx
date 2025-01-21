// note: Turn every item (whole thing) into a form, and add a highlight when input not given.

import React from "react";

interface WelcomeCardProps {
  userName: string;
  age?: string;
  role?: string;
  theme?: "light" | "dark";
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  userName,
  role = "user",
  age = '40',
  theme = "light",
}) => {
  return (
    <div
      className={`welcome-card bg-card text-card-foreground p-6 rounded-lg shadow-md transition duration-200 ${
        theme === "dark" ? "dark:bg-card dark:text-card-foreground" : ""
      }`}
    >
      <h2 className="text-xl font-bold mb-2">Welcome, {userName}!</h2>
      {role && <p className="text-sm text-muted-foreground">Role: {role}</p>}
      {role && <p className="text-sm text-muted-foreground">Age: {age}</p>}
    </div>
  );
};

export default WelcomeCard;
