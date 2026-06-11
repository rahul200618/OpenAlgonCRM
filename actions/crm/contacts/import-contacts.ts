"use server";

import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { writeAuditLog } from "@/lib/audit-log";
import Papa from "papaparse";

export async function importContacts(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File;
  const mappingStr = formData.get("mapping") as string;
  if (!file || !mappingStr) {
    throw new Error("Missing file or mapping");
  }

  const mapping = JSON.parse(mappingStr);
  const text = await file.text();

  const { data, errors: parseErrors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parseErrors.length > 0) {
    throw new Error(`CSV parse error: ${parseErrors[0].message}`);
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const raw = data[i];
    const rowData: Record<string, any> = {};

    for (const [csvCol, targetField] of Object.entries(mapping)) {
      if (raw[csvCol]) {
        rowData[targetField as string] = raw[csvCol];
      }
    }

    if (!rowData.lastName) {
      skipped++;
      errors.push(`Row ${i + 2}: missing Last Name`);
      continue;
    }

    try {
      const contact = await prismadb.crm_Contacts.create({
        data: {
          first_name: rowData.firstName,
          last_name: rowData.lastName,
          email: rowData.email,
          office_phone: rowData.phone,
          description: rowData.description,
          assigned_to: session.user.id,
          createdBy: session.user.id,
          updatedBy: session.user.id,
          organization_id: session.user.organization_id || undefined,
        },
      });

      await writeAuditLog({
        entityType: "contact",
        entityId: contact.id,
        action: "imported",
        changes: null,
        userId: session.user.id,
      });

      imported++;
    } catch (err: any) {
      skipped++;
      errors.push(`Row ${i + 2}: ${err.message}`);
    }
  }

  return { imported, skipped, errors };
}
