"use client";

import {useState} from "react";

function ChangeUserRoleForm() {
  const [userIdOrEmail, setUserIdOrEmail] = useState("");
  const [newRole, setNewRole] = useState("");

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();

    setUserIdOrEmail(userIdOrEmail.trim());
    setNewRole(newRole.trim());

    try {
      const response = await fetch("/api/changeUserRole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({userIdOrEmail, newRole}),
      });
      if (response.ok) {
        console.log("User role updated successfully", response);
        const result = await response.json();
        alert(`User role updated successfully: ${JSON.stringify(result)}`);
        // Optionally, refresh the page or update the state to reflect the changes
      } else {
        const result = await response.json();
        console.log("Failed to update user role", response);
        alert(`Failed to update user role: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("An error occurred while updating the user role");
    }
  };

  return (
    <div>
      <h2>Change User Role</h2>
      <form onSubmit={handleRoleChange}>
        <div>
          <label>
            User ID or Email:
            <input
              type="text"
              value={userIdOrEmail}
              onChange={(e) => setUserIdOrEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            New Role:
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Change Role</button>
      </form>
    </div>
  );
}

export default ChangeUserRoleForm;
