import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const login = async () => {
    try {
      const res = await API.post(
        "/auth/login",
        form
      );

      // SAVE TOKEN
      localStorage.setItem(
        "token",
        res.data.token
      );

      // SAVE ROLE
      localStorage.setItem(
        "role",
        res.data.role
      );

      navigate("/dashboard");

    } catch (err) {
      alert(
        err.response?.data?.msg ||
        "Invalid login credentials"
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value
          })
        }
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value
          })
        }
      />

      <br /><br />

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}