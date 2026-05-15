import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Auth() {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member"
  });

  const submit = async () => {

    try {

      // LOGIN
      if (isLogin) {

        const res = await API.post(
          "/auth/login",
          {
            email: form.email,
            password: form.password
          }
        );

        localStorage.setItem(
          "token",
          res.data.token
        );

        localStorage.setItem(
          "role",
          res.data.role
        );

        navigate("/dashboard");
      }

      // REGISTER
      else {

        await API.post(
          "/auth/register",
          form
        );

        alert("Registration Successful");

        setIsLogin(true);
      }

    } catch (err) {

      alert(
        err.response?.data?.msg ||
        "Something went wrong"
      );
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f4f7fb"
    }}>

      <div style={{
        width: "350px",
        padding: "30px",
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
      }}>

        <h2 style={{
          textAlign: "center",
          marginBottom: "20px"
        }}>
          {isLogin ? "Login" : "Register"}
        </h2>

        {/* NAME */}
        {!isLogin && (
          <input
            placeholder="Name"
            style={inputStyle}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
          />
        )}

        {/* EMAIL */}
        <input
          placeholder="Email"
          style={inputStyle}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          style={inputStyle}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
        />

        {/* ROLE */}
        {!isLogin && (

          <select
            style={inputStyle}
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value
              })
            }
          >

            <option value="Member">
              Member
            </option>

            <option value="Admin">
              Admin
            </option>

          </select>

        )}

        <button
          onClick={submit}
          style={buttonStyle}
        >
          {isLogin ? "Login" : "Register"}
        </button>

        <p style={{
          textAlign: "center",
          marginTop: "15px"
        }}>

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"
          }

          <span
            onClick={() =>
              setIsLogin(!isLogin)
            }
            style={{
              color: "blue",
              cursor: "pointer",
              marginLeft: "5px"
            }}
          >
            {isLogin ? "Register" : "Login"}
          </span>

        </p>

      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "5px"
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};