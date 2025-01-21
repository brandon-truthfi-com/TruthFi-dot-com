import React, { useState } from "react";

export const WelcomeCard: React.FC = () => {
  // State management for form fields
  const [userName, setUserName] = useState<string>("");
  const [age, setAge] = useState<string>("40");
  const [role, setRole] = useState<string>("user");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ userName, age, role, theme }); // Example action: log the form data
    alert(`Welcome, ${userName}! Role: ${role}, Age: ${age}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`welcome-card bg-card text-card-foreground p-6 rounded-lg shadow-md transition duration-200 ${
        theme === "dark" ? "dark:bg-card dark:text-card-foreground" : ""
      }`}
    >
      <h2 className="text-xl font-bold mb-4">Welcome Form</h2>

      {/* User Name Input */}
      <div className="mb-4">
        <label htmlFor="userName" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>

      {/* Age Input */}
      <div className="mb-4">
        <label htmlFor="age" className="block text-sm font-medium mb-1">
          Age
        </label>
        <input
          id="age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Enter your age"
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Role Input */}
      <div className="mb-4">
        <label htmlFor="role" className="block text-sm font-medium mb-1">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      {/* Theme Toggle */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Theme</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
              className="mr-2"
            />
            Light
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
              className="mr-2"
            />
            Dark
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90"
      >
        Submit
      </button>
    </form>
  );
};

export default WelcomeCard;
