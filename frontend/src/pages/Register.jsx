
export default function Register() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>REGISTER TEST</h1>

      <input placeholder="Name" />
      <br /><br />

      <input placeholder="Email" />
      <br /><br />

      <input placeholder="Password" />
      <br /><br />

      <select>
        <option>Member</option>
        <option>Admin</option>
      </select>

      <br /><br />

      <button>Register</button>
    </div>
  );
}