import {auth} from "../../lib/auth"; // from [../../lib/auth.ts](../../lib/auth.ts)
import prisma from "../../prisma/prisma"; // from [../../prisma/prisma.ts](../../prisma/prisma.ts)
import ChangeUserRoleForm from "../components/ChangeUserRoleForm/ChangeUserRoleForm"; // from [../components/ChangeUserRoleForm/ChangeUserRoleForm](../components/ChangeUserRoleForm/ChangeUserRoleForm.tsx)
import RoleManager from "../components/admin/RoleManager/RoleManager"; // from [../components/admin/RoleManager/RoleManager](../components/admin/RoleManager/RoleManager.tsx)
import CopyToClipboardButton from "../components/CopyToClipboard/CopyToClipboard"; // from [../components/CopyToClipboard/CopyToClipboard](../components/CopyToClipboard/CopyToClipboard.tsx)

async function Admin() {
  const session = await auth();
  const users = await prisma.user.findMany();

  const users_list = users.map((user) => ({
    _id: user.id,
    email: user.email,
    roles: user.roles,
  }));

  return (
    <main>
      <header>
        <p>
          you have reached&nbsp;
          <code>admin</code>
        </p>
      </header>
      <div>
        <h1>Admin Page</h1>
        <div>{session?.user?.roles}</div>
        <div>
          <h2>List Users</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users_list.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.email}</td>
                  <td>{user.roles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a href="./">to home</a>
      </div>
      <footer>
        <p>Footer content here</p>
      </footer>
    </main>
  );
}

export default Admin;
