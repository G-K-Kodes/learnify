// pages/LoginOrRegisterPage.tsx
import { useState } from "react";

export default function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true); // toggle login/register
  const [role, setRole] = useState<"student" | "instructor">("student");

  const handleToggle = () => setIsLogin(!isLogin);

  const handleRoleChange = (newRole: "student" | "instructor") => setRole(newRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isLogin ? "Logging in" : `Registering as ${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login" : `Register as ${role === "student" ? "Student" : "Instructor"}`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="flex justify-center gap-4 mb-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg ${role === "student" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
                onClick={() => handleRoleChange("student")}
              >
                Join as Student
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg ${role === "instructor" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
                onClick={() => handleRoleChange("instructor")}
              >
                Join as Instructor
              </button>
            </div>
          )}

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={handleToggle} className="text-indigo-600 font-semibold hover:underline">
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
