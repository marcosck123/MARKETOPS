"use server";

import { db } from "@/lib/db";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CompanySettingsData = {
  id: string;
  razaoSocial: string;
  cnpj: string;
  ie: string | null;
  address: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  nfeSerie: string;
  nfeSequence: number;
};

export async function getCompanySettings(): Promise<CompanySettingsData> {
  const settings = await db.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return settings;
}

export async function updateCompanySettings(
  data: Partial<Omit<CompanySettingsData, "id" | "nfeSequence">>,
): Promise<ActionResult> {
  await db.companySettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
  return { success: true, data: undefined };
}
