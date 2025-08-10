import React, { useState } from "react";
import { Button } from "../components/ui/button";
import Input from "../components/ui/input";
import { Label } from "../components/ui/label";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";
import { Loader2 } from "lucide-react";
import { validateFields } from "../utilities/validation";
import { showAlert } from "../utilities/toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateFields(email, password);
    if (!validation.valid) {
      showAlert("error", "Validation Error", validation.message);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${config.backendUrl}/api/auth/register`, {
        email,
        password,
      });
      showAlert(
        "success",
        "Signup Successful",
        "Your account has been created!"
      );
      navigate("/login");
    } catch (err) {
      showAlert(
        "error",
        "Signup Failed",
        "Something went wrong. Please try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Welcome to TaskTick
        </h2>
        <p className="text-center mb-2">Create an account to continue</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <Button
            type="submit"
            className="w-full flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            {loading ? "" : "Signup"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button
            onClick={handleLoginRedirect}
            className="w-full"
            disabled={loading}
          >
            Already have an account ?
          </Button>
        </div>
      </div>
    </div>
  );
}
