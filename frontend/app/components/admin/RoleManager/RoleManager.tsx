import prisma from "@/prisma/prisma";
import ViewRoles from "./components/ViewRoles";

async function RoleManager() {
  const rolesTableStructure = await prisma.$queryRaw`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'roles'
  `;
  console.log(rolesTableStructure);

  const roles = await prisma.role.findMany();
  console.log(roles);

  return (
    <div>
      <h1>Role Manager</h1>

      <div>
        <h2>Roles</h2>
      </div>

      <div>
        <h2>Roles Table Structure</h2>
        <table>
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {rolesTableStructure.map(
              (column: {column_name: string; data_type: string}) => (
                <tr key={column.column_name}>
                  <td>{column.column_name}</td>
                  <td>{column.data_type}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoleManager;
